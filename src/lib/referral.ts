import { supabase } from "@/integrations/supabase/client";

// Generate a unique referral code (8 characters)
export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Get shop ID by referral code
export async function getShopIdByReferralCode(code: string): Promise<string | null> {
  const { data } = await supabase
    .from("shops")
    .select("id")
    .eq("referral_code", code)
    .maybeSingle();
  return data?.id || null;
}

// Get free product limit for a shop
export async function getFreeProductLimit(shopId: string): Promise<number> {
  const { data } = await supabase
    .from("shops")
    .select("referral_bonus_applied")
    .eq("id", shopId)
    .single();
  return data?.referral_bonus_applied === true ? 10 : 5;
}

// Apply referral bonus when new user signs up with a ref code
export async function applyReferralBonus(
  newShopId: string,
  referrerCode: string
): Promise<boolean> {
  try {
    const referrerId = await getShopIdByReferralCode(referrerCode);
    if (!referrerId) return false;

    // Update new shop: mark as referred and apply bonus
    await supabase
      .from("shops")
      .update({
        referred_by: referrerId,
        referral_bonus_applied: true
      })
      .eq("id", newShopId);

    // Update referrer: give them bonus if not already applied
    const { data: referrer } = await supabase
      .from("shops")
      .select("referral_bonus_applied")
      .eq("id", referrerId)
      .single();

    if (!referrer?.referral_bonus_applied) {
      await supabase
        .from("shops")
        .update({ referral_bonus_applied: true })
        .eq("id", referrerId);
    }

    return true;
  } catch (err) {
    console.error("Referral error:", err);
    return false;
  }
}
