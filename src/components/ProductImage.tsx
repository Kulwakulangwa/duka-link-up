import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Resolves a storage path to a signed URL and renders an image (or placeholder). */
export function ProductImage({ path, className, alt }: { path: string | null; className?: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) { setUrl(null); return; }
    supabase.storage.from("shop-images").createSignedUrl(path, 3600).then(({ data }) => {
      if (!cancelled) setUrl(data?.signedUrl ?? null);
    });
    return () => { cancelled = true; };
  }, [path]);

  if (!url) {
    return (
      <div className={cn("bg-muted flex items-center justify-center text-muted-foreground", className)}>
        <ImageIcon className="size-1/3" />
      </div>
    );
  }
  return <img src={url} alt={alt ?? ""} className={cn("object-cover bg-muted", className)} loading="lazy" />;
}
