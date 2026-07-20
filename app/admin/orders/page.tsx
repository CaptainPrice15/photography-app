import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export default async function AdminOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-fg mb-8">Recent Orders</h1>

      <div className="overflow-x-auto rounded-2xl border border-border-40 bg-surface/50">
        <table className="w-full text-left text-sm text-muted">
          <thead className="bg-surface-85 text-xs uppercase text-fg">
            <tr>
              <th scope="col" className="px-6 py-4">Order ID</th>
              <th scope="col" className="px-6 py-4">Customer</th>
              <th scope="col" className="px-6 py-4">Amount</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border-40 last:border-0 hover:bg-surface/80 transition-colors">
                <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-fg">{order.user.email}</div>
                </td>
                <td className="px-6 py-4 font-medium text-fg">
                  ${(order.amount / 100).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    order.status === "paid" 
                      ? "bg-green-500/10 text-green-400" 
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
