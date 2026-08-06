// Genuinos UY — Edge Function: notify-new-order
//
// Triggered by a Supabase Database Webhook on INSERT INTO public.orders.
// Sends the admin an email with order details + customer WhatsApp link
// so they can move fast.
//
// Deploy:
//   supabase functions deploy notify-new-order --no-verify-jwt
//
// Secrets (set once via Supabase CLI):
//   supabase secrets set RESEND_API_KEY=re_xxx
//   supabase secrets set ADMIN_EMAIL=admin@example.com
//   supabase secrets set FROM_EMAIL="Genuinos <orders@genuinos.simplemente.com.uy>"
//
// Then in Dashboard → Database → Webhooks → Create:
//   Table: public.orders
//   Events: INSERT
//   Type: HTTP Request
//   URL:  https://<project-ref>.supabase.co/functions/v1/notify-new-order
//   Method: POST
//   Headers: Content-Type: application/json

import { Resend } from "https://esm.sh/resend@2.0.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "";
const FROM_EMAIL =
  Deno.env.get("FROM_EMAIL") ?? "Genuinos <orders@genuinos.simplemente.com.uy>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c] || c);
}

function formatUY(n: number): string {
  if (!Number.isFinite(n)) return "$ 0";
  return "$ " + n.toLocaleString("es-UY", { maximumFractionDigits: 0 });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const record = body.record ?? body;
  const orderNumber = record.order_number ?? record.id ?? "(sin número)";
  const customerName = record.customer_name ?? "Cliente";
  const customerPhone = record.customer_phone ?? "";
  const customerEmail = record.customer_email ?? "";
  const customerAddress = record.customer_address ?? "";
  const city = record.city ?? "";
  const totalAmount = Number(record.total_amount) || 0;
  const orderId = record.id;

  // Fetch items via PostgREST using service_role key (RLS bypassed).
  let items: any[] = [];
  if (orderId && SUPABASE_URL && SERVICE_ROLE_KEY) {
    try {
      const itemsResp = await fetch(
        `${SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}` +
          `&select=product_name,quantity,unit_price,unit_type`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
        },
      );
      if (itemsResp.ok) {
        const json = await itemsResp.json();
        if (Array.isArray(json)) items = json;
      }
    } catch {
      /* continue without items */
    }
  }

  const cleanPhone = (customerPhone || "").replace(/\D/g, "");
  const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;

  const itemsHtml = items
    .map(
      (it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(it.product_name || "")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${Number(it.quantity) || 0}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatUY(Number(it.unit_price) || 0)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatUY((Number(it.unit_price) || 0) * (Number(it.quantity) || 0))}</td>
    </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:20px;color:#1a1a1a">
      <h2 style="margin:0 0 8px;font-weight:800">Nuevo pedido · ${escapeHtml(orderNumber)}</h2>
      <p style="margin:0 0 16px;color:#666;font-size:14px">
        ${escapeHtml(customerName)}${customerPhone ? ` · ${escapeHtml(customerPhone)}` : ""}${customerEmail ? ` · ${escapeHtml(customerEmail)}` : ""}
      </p>
      ${customerAddress || city
        ? `<div style="background:#f6f6f6;padding:12px;margin:12px 0;font-size:14px">${escapeHtml(customerAddress)}${city ? `<br>${escapeHtml(city)}` : ""}</div>`
        : ""}
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead>
          <tr style="background:#1a1a1a;color:#fff">
            <th style="padding:10px;text-align:left">Producto</th>
            <th style="padding:10px;text-align:center">Cant.</th>
            <th style="padding:10px;text-align:right">Precio</th>
            <th style="padding:10px;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml || '<tr><td colspan="4" style="padding:10px;color:#999;text-align:center">Sin ítems registrados</td></tr>'}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:10px;text-align:right;font-weight:bold">Total</td>
            <td style="padding:10px;text-align:right;font-weight:bold;font-size:18px">${formatUY(totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      ${record.notes ? `<p style="background:#fff8e1;padding:10px;margin:16px 0;font-size:13px"><strong>Notas:</strong> ${escapeHtml(record.notes)}</p>` : ""}
      ${waLink
        ? `<p style="margin:24px 0">
        <a href="${waLink}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:14px">Contactar cliente por WhatsApp</a>
      </p>`
        : ""}
      <p style="margin-top:24px;font-size:12px;color:#999">
        Panel admin: <a href="#" style="color:#666">genuinos.simplemente.com.uy/#admin</a>
      </p>
    </div>
  `;

  if (!RESEND_API_KEY || !ADMIN_EMAIL) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "RESEND_API_KEY and ADMIN_EMAIL must be set as Edge Function secrets",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `Nuevo pedido ${orderNumber} — ${customerName}`,
      html,
    });
    if ((result as any).error) {
      return new Response(
        JSON.stringify({ ok: false, error: (result as any).error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    return new Response(
      JSON.stringify({ ok: true, id: (result as any).data?.id }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message ?? "send failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
