import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Store, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

const ADMIN_EMAIL = "kulwakulangwa@gmail.com"; // 👈 Change to your email

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    recentUsers: [] as any[],
    recentShops: [] as any[],
  });

  useEffect(() => {
    async function checkAdminAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated");
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        toast.error("Access denied. Admins only.");
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);

      try {
        const { data: totalUsers } = await supabase.rpc('get_total_users');
        const { count: totalShops } = await supabase.from("shops").select("*", { count: "exact", head: true });
        const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true });
        const { data: recentUsers } = await supabase.rpc('get_recent_users', { limit_count: 10 });
        const { data: recentShops } = await supabase.from("shops").select("id, name, slug, created_at, user_id").order("created_at", { ascending: false }).limit(10);

        setMetrics({
          totalUsers: totalUsers || 0,
          totalShops: totalShops || 0,
          totalProducts: totalProducts || 0,
          recentUsers: recentUsers || [],
          recentShops: recentShops || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoad();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-5 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/dashboard"><ArrowLeft className="size-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Total Users" value={metrics.totalUsers} icon={<Users className="size-4 text-muted-foreground" />} />
          <MetricCard title="Total Shops" value={metrics.totalShops} icon={<Store className="size-4 text-muted-foreground" />} />
          <MetricCard title="Total Products" value={metrics.totalProducts} icon={<Package className="size-4 text-muted-foreground" />} />
        </div>

        <Card>
          <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
          <CardContent>
            {metrics.recentUsers.length === 0 ? (
              <p className="text-muted-foreground">No users found</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{user.email || user.id}</p>
                      <p className="text-xs text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{user.id}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Shops</CardTitle></CardHeader>
          <CardContent>
            {metrics.recentShops.length === 0 ? (
              <p className="text-muted-foreground">No shops found</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentShops.map((shop: any) => (
                  <div key={shop.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">Slug: {shop.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Created: {new Date(shop.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">User: {shop.user_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
