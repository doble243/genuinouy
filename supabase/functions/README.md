# Genuinos UY — Supabase Edge Functions

Optional functions that connect DB events to external notifications.

## notify-new-order

Sends the admin an email whenever a new order lands.

### One-time setup

1. **Create a free Resend account** at https://resend.com
2. **Get the API key** from the Resend dashboard
3. **Verify a domain you own** (for the `FROM_EMAIL` address), or use Resend's free sandbox sender for testing
4. **Pick a destination email** for admin (`ADMIN_EMAIL`)
5. **Deploy the function** via Supabase CLI:

```bash
supabase functions deploy notify-new-order --no-verify-jwt
supabase secrets set RESEND_API_KEY=re_xxxxxxxx
supabase secrets set ADMIN_EMAIL=tunumero@dominio.com
supabase secrets set FROM_EMAIL="Genuinos <orders@tudominio.com>"
```

6. **Create the database webhook** in Supabase Dashboard:
   - Database → Webhooks → Create a new hook
   - Name: `new-order-email`
   - Table: `public.orders`
   - Events: `INSERT`
   - Type: `HTTP Request`
   - Method: `POST`
   - URL: `https://<your-project-ref>.supabase.co/functions/v1/notify-new-order`
   - Headers: `Content-Type: application/json`
   - Save

Now every new order will email the admin with:
- Order number (GEN-YYYYMMDD-NNNN)
- Customer name + WhatsApp + email + address
- Cart line items
- Total
- One-click "Contactar cliente por WhatsApp" button

### Limitations
- RLS/Auth: function is anonymous (`--no-verify-jwt`), protected only by URL obscurity. Acceptable for low-volume stores; for high-traffic, rotate the URL or add a shared secret header.
- Sender domain: using unverified sandbox `onresend.com` works for testing but bounces for real recipients. Set up a verified domain in Resend to deliver reliably.
