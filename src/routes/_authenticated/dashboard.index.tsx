// ... (keep all imports same)

function Dashboard() {
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data: shopRow } = await supabase.from("shops").select("id,slug,name").maybeSingle();
    setShop(shopRow as any);
    
    if (shopRow?.id) {
      const { data: prods } = await supabase
        .from("products")
        .select("id,name,price,image_url,in_stock,description")
        .eq("shop_id", shopRow.id)
        .order("created_at", { ascending: false });
      setProducts((prods as any) ?? []);
    } else {
      setProducts([]);
    }
    setLoading(false);
  }
  
  useEffect(() => { load(); }, []);

  // ... (keep other functions same)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  // ✅ If no shop exists, show Create Shop screen
  if (!shop) {
    return (
      <main className="min-h-screen bg-background">
        <header className="px-5 py-4 border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Store className="size-5 text-primary shrink-0" />
              <h1 className="font-bold text-foreground">Duka Link Up</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="size-5" />
            </Button>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-5 py-12">
          <div className="rounded-2xl border-2 border-dashed border-primary/30 p-10 text-center bg-card">
            <Store className="size-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Duka Link Up!</h2>
            <p className="text-muted-foreground mb-6">
              Create your digital shop page and start selling online.
            </p>
            <Button asChild size="lg" className="h-12 px-8 font-semibold">
              <Link to="/create-shop">Create Your Shop →</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // ✅ Rest of the dashboard for users with shops
  const shopUrl = typeof window !== "undefined" && shop ? `${window.location.origin}/${shop.slug}` : "";

  // ... (rest of your existing dashboard code for users with shops)
}
