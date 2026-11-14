# Sosáč web – nastavenie (cca 20 minút)

GitHub Pages je len statický hosting, preto prihlásenie, kontrola nákupu a chránené sťahovanie
bežia cez **Supabase** (zadarmo) a platby cez **Stripe**. Súbor s appkou **nesmie** byť v repe ani v GitHub Releases
(tie sú verejné), leží v súkromnom Supabase buckete.

## 1. Supabase
1. Založ projekt na supabase.com.
2. SQL Editor → vlož celý `supabase/schema.sql` → Run.
3. Authentication → URL Configuration: *Site URL* = adresa tvojej stránky (napr. `https://cominqo.github.io/sosac-web/`), pridaj ju aj do *Redirect URLs*.
4. Settings → API: skopíruj *Project URL* a *anon public key* do `config.js`.

## 2. Stripe
1. Product catalog → nový produkt „Sosáč“, 10 €, jednorazová platba.
2. Payment Link → After payment → Redirect to: `https://cominqo.github.io/sosac-web/?paid=1`.
3. URL linku vlož do `config.js` ako `CHECKOUT_URL`.
4. Webhook: `supabase functions deploy stripe-webhook --no-verify-jwt`, potom v Stripe Developers → Webhooks pridaj
   `https://<projekt>.supabase.co/functions/v1/stripe-webhook`, udalosti `checkout.session.completed` a `charge.refunded`.
5. Secrets: `supabase secrets set STRIPE_SECRET_KEY=sk_... STRIPE_WEBHOOK_SECRET=whsec_...`

## 3. Nahratie verzie (aj pri každom update)
1. Storage → bucket `releases` → nahraj `Sosac-3.0.1.zip`.
2. Table Editor → `releases` → pridaj riadok (`version`, `file_path` = názov súboru, `notes`).
   Web vždy ponúkne riadok s najnovším `created_at`, takže zákazník po prihlásení uvidí nový update.

## 4. GitHub Pages
Nahraj obsah priečinka do repa → Settings → Pages → Deploy from branch `main` / root.

## Ako to hlási zákazníka
Pri kúpe web pošle do Stripe `client_reference_id` = ID prihláseného účtu, webhook ho zapíše do `purchases`.
Databázové pravidlá (RLS) potom dovolia stiahnuť súbor len účtu s platným nákupom, aj keby niekto obišiel web.
