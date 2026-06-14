import { supabase } from "@/integrations/supabase/client";

// Generate a unique referral code
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Get free product limit for a shop
export async function getFreeProductLimit(shopId: string): Promise<number> {
  const { data: shop } = await supabase
    .from("shops")
    .select("referral_bonus_applied")
    .eq("id", shopId)
    .single();
  
  return shop?.referral_bonus_applied === true ? 10 : 5;
}

// Apply referral bonus when new user signs up
export async function applyReferralBonus(
  newShopId: string, 
  referrerCode: string
): Promise<boolean> {
  try {
    // Find referrer shop by referral code
    const { data: referrer } = await supabase
      .from("shops")
      .select("id")
      .eq("referral_code", referrerCode)
      .single();

    if (!referrer) return false;

    // Update new shop: mark as referred and set bonus
    await supabase
      .from("shops")
      .update({ 
        referred_by: referrer.id,
        referral_bonus_applied: true 
      })
      .eq("id", newShopId);

    // Update referrer: give them bonus if not already applied
    const { data: referrerShop } = await supabase
      .from("shops")
      .select("referral_bonus_applied")
      .eq("id", referrer.id)
      .single();

    if (!referrerShop?.referral_bonus_applied) {
      await supabase
        .from("shops")
        .update({ referral_bonus_applied: true })
        .eq("id", referrer.id);
    }

    return true;
  } catch (err) {
    console.error("Referral error:", err);
    return false;
  }
}
