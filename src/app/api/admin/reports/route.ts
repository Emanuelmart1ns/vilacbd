import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");
    const filterClient = searchParams.get("client");
    const filterProduct = searchParams.get("product");
    const filterStatus = searchParams.get("status");

    // 1. Fetch all data needed
    const ordersSnapshot = await db.collection("orders").get();
    const productsSnapshot = await db.collection("products").get();
    
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Intelligence Processing
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let totalOrdersPaid = 0;
    let totalOrdersPending = 0;
    
    const salesByDate: Record<string, { total: number, orders: number }> = {};
    const salesByProduct: Record<string, { name: string, total: number, quantity: number, category: string }> = {};
    const salesByCategory: Record<string, number> = {};
    const salesByCustomer: Record<string, { email: string, total: number, orders: number }> = {};

    const filteredOrders = orders.filter((order: any) => {
      const dateStr = order.createdAt ? order.createdAt.split("T")[0] : "N/A";
      
      // Basic Filters
      if (startDate && dateStr < startDate) return false;
      if (endDate && dateStr > endDate) return false;
      if (filterClient && !order.email?.toLowerCase().includes(filterClient.toLowerCase())) return false;
      if (filterStatus && order.paymentStatus !== filterStatus) return false;
      
      if (filterProduct) {
        const hasProduct = order.items?.some((item: any) => item.id === filterProduct || item.name.includes(filterProduct));
        if (!hasProduct) return false;
      }

      // Aggregate Stats
      if (order.paymentStatus === "pago") {
        totalRevenue += order.total || 0;
        totalOrdersPaid++;
        
        // Sales by Date (Only paid)
        salesByDate[dateStr] = salesByDate[dateStr] || { total: 0, orders: 0 };
        salesByDate[dateStr].total += order.total || 0;
        salesByDate[dateStr].orders++;

        // Customer loyalty
        const email = order.email || "Anon";
        if (!salesByCustomer[email]) salesByCustomer[email] = { email, total: 0, orders: 0 };
        salesByCustomer[email].total += order.total || 0;
        salesByCustomer[email].orders++;

        // Product & Category aggregation
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const prodId = item.id;
            if (!salesByProduct[prodId]) {
              const originalProd = productsList.find(p => p.id === prodId) as any;
              salesByProduct[prodId] = { 
                name: item.name, 
                total: 0, 
                quantity: 0, 
                category: originalProd?.category || "Outros" 
              };
            }
            salesByProduct[prodId].total += (item.price * item.quantity);
            salesByProduct[prodId].quantity += item.quantity;
            
            const cat = salesByProduct[prodId].category;
            salesByCategory[cat] = (salesByCategory[cat] || 0) + (item.price * item.quantity);
          });
        }
      } else {
        pendingRevenue += order.total || 0;
        totalOrdersPending++;
      }

      return true;
    });

    // Formatting for Charts
    const chartSalesByDate = Object.entries(salesByDate)
      .map(([date, stats]) => ({ date, total: stats.total, orders: stats.orders }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const chartSalesByProduct = Object.values(salesByProduct)
      .sort((a, b) => b.total - a.total);

    const chartSalesByCategory = Object.entries(salesByCategory)
      .map(([name, value]) => ({ name, value }));

    const topCustomers = Object.values(salesByCustomer)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

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
      },
      topCustomers,
      orders: filteredOrders,
      products: productsList.map(p => ({ id: p.id, name: p.name }))
    });
  } catch (error: any) {
    console.error("Erro no relatório avançado:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
