import { supabase } from "@/integrations/supabase/client";

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function getShopIdByReferralCode(code: string): Promise<string | null> {
  const { data } = await supabase
    .from("shops")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  return data?.id || null;
}
