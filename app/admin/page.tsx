import { prisma } from "@/lib/db";
import { Users, ShoppingBag, Heart, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [userCount, orderCount, favoriteCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.favorite.count(),
    prisma.order.aggregate({
      _sum: { amount: true },
      where: { status: "paid" },
    }),
  ]);

  const totalRevenue = ((revenue._sum.amount || 0) / 100).toFixed(2);

  const stats = [
    { name: "Total Users", value: userCount, icon: Users },
    { name: "Total Orders", value: orderCount, icon: ShoppingBag },
    { name: "Total Favorites", value: favoriteCount, icon: Heart },
    { name: "Revenue", value: `$${totalRevenue}`, icon: ImageIcon },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-fg mb-8">Overview</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="surface-contain rounded-2xl border border-border-40 bg-surface/50 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">{stat.name}</p>
                  <p className="text-2xl font-semibold text-fg">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
