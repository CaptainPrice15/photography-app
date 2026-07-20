import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Images, ShoppingBag, Settings } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/login?returnTo=/admin");
  }

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Collections", href: "/admin/collections", icon: Images },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-[80vh] w-full flex-col md:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="glass rounded-3xl p-6 sticky top-24">
          <h2 className="text-xl font-bold mb-6 text-fg">Admin</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-85 transition-colors text-muted hover:text-fg font-medium"
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="glass rounded-3xl p-8 min-h-[500px]">
          {children}
        </div>
      </main>
    </div>
  );
}
