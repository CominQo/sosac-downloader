// Supabase Edge Function: Stripe → zapíše nákup. Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
import Stripe from "https://esm.sh/stripe@16.12.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

Deno.serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
  } catch (e) {
    return new Response("bad signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid") {
      const email = (s.customer_details?.email || s.customer_email || "").toLowerCase();
      const { error } = await admin.from("purchases").upsert({
        user_id: s.client_reference_id || null,
        email,
        status: "paid",
        provider: "stripe",
        provider_ref: s.id,
      }, { onConflict: "provider_ref" });
      if (error) return new Response(error.message, { status: 500 });
    }
  }
  if (event.type === "charge.refunded") {
    const ch = event.data.object as Stripe.Charge;
    const email = (ch.billing_details?.email || "").toLowerCase();
    if (email) await admin.from("purchases").update({ status: "refunded" }).eq("email", email);
  }
  return new Response("ok");
});
