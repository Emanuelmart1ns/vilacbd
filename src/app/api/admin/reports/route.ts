import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminToken(request);
  if ("error" in auth) return auth.error;

  try {
    const db = getAdminDb();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const filterCategory = searchParams.get("category");
    const filterSupplier = searchParams.get("supplier");

    // Fetch data
    const ordersSnapshot = await db.collection("orders").get();
    const productsSnapshot = await db.collection("products").get();
    const suppliersSnapshot = await db.collection("suppliers").get();
    
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const suppliersList = suppliersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Processing variables
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let totalOrdersPaid = 0;
    let totalOrdersPending = 0;
    
    const salesByDate: Record<string, { total: number, orders: number }> = {};
    const salesByProduct: Record<string, { name: string, total: number, quantity: number, category: string }> = {};
    const salesByCategory: Record<string, number> = {};
    const salesByCustomer: Record<string, { email: string, total: number, orders: number }> = {};
    const shippingStatusCount: Record<string, number> = { "pendente": 0, "preparando": 0, "enviado": 0, "entregue": 0 };

    const filteredOrders = orders.filter((order: any) => {
      const dateStr = order.createdAt ? order.createdAt.split("T")[0] : "N/A";
      
      // Date Filter
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;

      // Supplier Filter
      if (filterSupplier && filterSupplier !== "all") {
        const hasSupplierProduct = order.items?.some((item: any) => {
          const prod = productsList.find(p => p.id === item.id);
          return (prod as any)?.supplierId === filterSupplier;
        });
        if (!hasSupplierProduct) return false;
      }

      // Category Filter
      if (filterCategory && filterCategory !== "all") {
        const hasCategory = order.items?.some((item: any) => {
          const prod = productsList.find(p => p.id === item.id);
          return (prod as any)?.category === filterCategory;
        });
        if (!hasCategory) return false;
      }

      // Aggregate Stats (only items matching filters)
      if (order.paymentStatus === "pago") {
        let orderContribution = 0;
        let hasContribution = false;

        if (order.items) {
          order.items.forEach((item: any) => {
            const prodId = item.id;
            const originalProd = productsList.find(p => p.id === prodId) as any;
            const cat = originalProd?.category || "Outros";
            const sId = originalProd?.supplierId || "";

            const matchesCategory = !filterCategory || filterCategory === "all" || cat === filterCategory;
            const matchesSupplier = !filterSupplier || filterSupplier === "all" || sId === filterSupplier;

            if (matchesCategory && matchesSupplier) {
              hasContribution = true;
              const itemTotal = (item.price * item.quantity);
              orderContribution += itemTotal;
              
              if (!salesByProduct[prodId]) {
                salesByProduct[prodId] = { name: item.name, total: 0, quantity: 0, category: cat };
              }
              salesByProduct[prodId].total += itemTotal;
              salesByProduct[prodId].quantity += item.quantity;
              salesByCategory[cat] = (salesByCategory[cat] || 0) + itemTotal;
            }
          });
        }

        if (hasContribution) {
          totalRevenue += orderContribution;
          totalOrdersPaid++;
          
          salesByDate[dateStr] = salesByDate[dateStr] || { total: 0, orders: 0 };
          salesByDate[dateStr].total += orderContribution;
          salesByDate[dateStr].orders++;

          const email = order.email || "Anon";
          if (!salesByCustomer[email]) salesByCustomer[email] = { email, total: 0, orders: 0 };
          salesByCustomer[email].total += orderContribution;
          salesByCustomer[email].orders++;
        }
      } else {
        pendingRevenue += order.total || 0;
        totalOrdersPending++;
      }

      const status = (order.shippingStatus || "pendente").toLowerCase();
      shippingStatusCount[status] = (shippingStatusCount[status] || 0) + 1;

      return true;
    });

    const chartSalesByDate = Object.entries(salesByDate)
      .map(([date, stats]) => ({ date, total: stats.total, orders: stats.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const chartSalesByProduct = Object.values(salesByProduct).sort((a, b) => b.total - a.total);
    const chartSalesByCategory = Object.entries(salesByCategory).map(([name, value]) => ({ name, value }));
    const topCustomers = Object.values(salesByCustomer).sort((a, b) => b.total - a.total).slice(0, 15);
    const categories = Array.from(new Set(productsList.map(p => (p as any).category))).filter(Boolean);

    return NextResponse.json({
      summary: {
        totalRevenue,
        pendingRevenue,
        totalOrdersPaid,
        totalOrdersPending,
        averageTicket: totalOrdersPaid > 0 ? totalRevenue / totalOrdersPaid : 0
      },
      charts: {
        salesByDate: chartSalesByDate,
        salesByProduct: chartSalesByProduct,
        salesByCategory: chartSalesByCategory,
        shippingStats: Object.entries(shippingStatusCount).map(([name, value]) => ({ name, value }))
      },
      topCustomers,
      categories,
      suppliers: suppliersList.map((s: any) => ({ id: s.id, name: s.name })),
      orders: filteredOrders.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt))
    });
  } catch (error: any) {
    console.error("Erro no relatório master:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
