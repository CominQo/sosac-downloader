// Tieto hodnoty sú verejné (anon key je určený do prehliadača), tajné kľúče sem NIKDY nedávaj.
window.SOSAC_CONFIG = {
  SUPABASE_URL: "https://TVOJ-PROJEKT.supabase.co",
  SUPABASE_ANON_KEY: "TVOJ_ANON_PUBLIC_KEY",
  // Stripe Payment Link (alebo Lemon Squeezy checkout URL) pre 10 € produkt
  CHECKOUT_URL: "https://buy.stripe.com/TVOJ_PAYMENT_LINK",
  RELEASES_BUCKET: "releases"
};
