import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { uy } from "../lib/data";
import { customerWhatsappUrl } from "../lib/whatsapp";
import { Arrow, Close } from "./ui";

interface OrderSuccessProps {
  orderNumber?: string;
  orderId?: string;
  onExit: () => void;
}

interface OrderDetail {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address?: string;
  shipping_notes?: string;
  total_amount: number;
  status: string;
  created_at: string;
  items?: {
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    unit_type?: string;
  }[];
}

const STATUS_LABELS: Record<string, { label: string; bg: string }> = {
  pending: { label: "Pedido recibido", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  confirmed: { label: "Confirmado", bg: "bg-sky-100 text-sky-800 border-sky-300" },
  preparing: { label: "En preparación", bg: "bg-violet-100 text-violet-800 border-violet-300" },
  shipped: { label: "En camino", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  delivered: { label: "Entregado", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  cancelled: { label: "Cancelado", bg: "bg-rose-100 text-rose-800 border-rose-300" },
};

export function OrderSuccess({ orderNumber, orderId, onExit }: OrderSuccessProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber && !orderId) return;
      setLoading(true);
      try {
        let query = supabase.from("orders").select("*, items:order_items(*)");
        if (orderNumber) {
          query = query.eq("order_number", orderNumber);
        } else if (orderId) {
          query = query.eq("id", orderId);
        }
        const { data, error } = await query.single();
        if (!error && data) {
          setOrder(data as OrderDetail);
        }
      } catch (err) {
        console.warn("[GENUINOS] Order load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNumber, orderId]);

  const num = order?.order_number || orderNumber || "N/A";
  const statusInfo = STATUS_LABELS[order?.status || "pending"] || STATUS_LABELS.pending;
  const waUrl = customerWhatsappUrl(order?.customer_phone, num);

  return (
    <div className="min-h-screen bg-bone text-ink">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/10 bg-bone/95 px-5 backdrop-blur">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">
          Confirmación de Pedido
        </span>
        <button
          onClick={onExit}
          className="grid h-10 w-10 place-items-center text-ink/70 hover:text-ink"
          aria-label="Cerrar"
        >
          <Close className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-[800px] px-5 py-10 md:py-16">
        <div className="border border-ink/12 bg-white p-6 md:p-10 shadow-sm">
          {/* Header del comprobante */}
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-bone">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                <path
                  d="M5 12.5l4.2 4.2L19 7"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="mt-5 text-[26px] font-bold tracking-[-0.02em] md:text-[32px]">
              ¡Muchas gracias por tu compra!
            </h1>
            <p className="mt-2 text-[14px] text-smoke">
              Tu orden <span className="font-bold text-ink">{num}</span> ha sido registrada exitosamente.
            </p>

            <span className={`mt-4 inline-block border px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${statusInfo.bg}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Detalles del Cliente y Entrega */}
          {order && (
            <div className="mt-8 grid gap-6 border-t border-b border-ink/10 py-6 md:grid-cols-2">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-smoke">
                  Datos del Cliente
                </h3>
                <p className="mt-2 text-[14px] font-semibold">{order.customer_name}</p>
                <p className="text-[13px] text-smoke">{order.customer_phone}</p>
                {order.customer_email && (
                  <p className="text-[13px] text-smoke">{order.customer_email}</p>
                )}
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-smoke">
                  Dirección de Entrega
                </h3>
                <p className="mt-2 text-[14px] text-ink">{order.shipping_address || "A coordinar por WhatsApp"}</p>
                {order.shipping_notes && (
                  <p className="mt-1 text-[12px] italic text-smoke">
                    Notas: {order.shipping_notes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Listado de Productos */}
          {order?.items && order.items.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-smoke">
                Resumen del Pedido
              </h3>
              <div className="mt-3 divide-y divide-ink/8 border-y border-ink/8">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[14px] font-semibold">{item.product_name}</p>
                      {item.unit_type && (
                        <p className="text-[12px] text-smoke">{item.unit_type}</p>
                      )}
                      <p className="text-[12px] text-smoke">
                        Cantidad: {item.quantity} × {uy(item.unit_price)}
                      </p>
                    </div>
                    <span className="text-[14px] font-bold">
                      {uy(item.quantity * item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total y Acciones */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-ink/10 pt-6 md:flex-row">
            <div>
              <span className="text-[12px] font-semibold text-smoke">Monto Total:</span>
              <p className="text-[24px] font-bold text-ink">
                {uy(order?.total_amount || 0)}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border border-emerald-600 bg-emerald-600 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-emerald-700"
              >
                <span>Coordinar por WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={onExit}
                className="flex items-center justify-center gap-2 border border-ink/20 bg-bone px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:border-ink"
              >
                <span>Seguir viendo</span>
                <Arrow className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
