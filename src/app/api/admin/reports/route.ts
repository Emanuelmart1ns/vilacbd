import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  try {
    const db = getAdminDb();
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // 1. Fetch all orders (we filter by date in JS for flexibility, but could be Firestore query)
    const ordersSnapshot = await db.collection("orders").get();
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 2. Data for Charts: Sales by Date
    const salesByDate: Record<string, number> = {};
    const salesByProduct: Record<string, { name: string, total: number, quantity: number }> = {};
    let totalRevenue = 0;
    let totalOrdersPaid = 0;

    orders.forEach((order: any) => {
      if (order.paymentStatus !== "pago") return;

      const dateStr = order.createdAt ? order.createdAt.split("T")[0] : "N/A";
      
      // Filter by date if provided
      if (startDate && dateStr < startDate) return;
      if (endDate && dateStr > endDate) return;

      totalRevenue += order.total || 0;
      totalOrdersPaid++;

      // Sales by Date
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + (order.total || 0);

      // Sales by Product
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const prodId = item.id;
          if (!salesByProduct[prodId]) {
            salesByProduct[prodId] = { name: item.name, total: 0, quantity: 0 };
          }
          salesByProduct[prodId].total += (item.price * item.quantity);
          salesByProduct[prodId].quantity += item.quantity;
        });
      }
    });

    // Convert records to sorted arrays for charts
    const sortedSalesByDate = Object.entries(salesByDate)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sortedSalesByProduct = Object.values(salesByProduct)
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({
      totalRevenue,
      totalOrdersPaid,
      salesByDate: sortedSalesByDate,
      salesByProduct: sortedSalesByProduct,
      orders: orders // For individual reports
    });
  } catch (error: any) {
    console.error("Erro no relatório:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
