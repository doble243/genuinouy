import { useEffect, useMemo, useState } from "react";
import {
  listOrdersByPhone,
  listOrdersByCustomerId,
} from "../lib/account";
import {
  listSavedCarts,
  type SavedCart,
} from "../lib/savedCarts";
import { listAdminOrderItems, type AdminOrderItem } from "../lib/orders";
import { currentCustomer } from "../lib/customerSession";
import { uy } from "../lib/data";
import type { AdminOrderRow } from "../lib/orders";
import { useStore } from "../lib/store";
import { Arrow, Close } from "./ui";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Nuevo", tone: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmado", tone: "bg-sky-100 text-sky-800" },
  preparing: { label: "Preparando", tone: "bg-violet-100 text-violet-800" },
  shipped: { label: "En camino", tone: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Entregado", tone: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", tone: "bg-rose-100 text-rose-800" },
};

const STATUS_ORDER: string[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
];

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function waLink(phone: string | null | undefined, orderNumber: string) {
  const cleanPhone = (phone || "").replace(/\D/g, "");
  if (!cleanPhone) return null;
  const text = encodeURIComponent(
    `Hola! Quiero saber sobre mi pedido ${orderNumber} en GENUINOS.`,
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export function Account({ onExit }: { onExit: () => void }) {
  const { products: storeProducts } = useStore();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [saved, setSaved] = useState<SavedCart[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<
    Record<string, AdminOrderItem[]>
  >({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);

  const productById = useMemo(() => {
    const map = new Map<string, (typeof storeProducts)[number]>();
    for (const p of storeProducts) map.set(p.id, p);
    return map;
  }, [storeProducts]);

  const sessionCustomer = useMemo(
    () => currentCustomer() || null,
    [],
  );

  // Auto-load: if the user already has a session customer, show their orders
  // + saved carts without forcing a phone lookup.
  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (sessionCustomer) {
        await loadByCustomer(sessionCustomer.id);
        setSearched(true);
        if (!cancelled) setPhone(sessionCustomer.phone);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadByCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [o, s] = await Promise.all([
        listOrdersByCustomerId(customerId),
        listSavedCarts(customerId),
      ]);
      setOrders(o);
      setSaved(s);
    } catch (e: any) {
      setError(e?.message || "No pudimos cargar tu cuenta");
    } finally {
      setLoading(false);
    }
  };

  const loadByPhone = async (raw: string) => {
    const p = raw.trim();
    if (!p) {
      setError("Ingresá tu WhatsApp para ver tus pedidos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const o = await listOrdersByPhone(p);
      setOrders(o);
      setSaved([]);
      if (o.length === 0) {
        setError("No encontramos pedidos con ese número. Verificá el formato (+598 9xx xx xx).");
      }
    } catch (e: any) {
      setError(e?.message || "No pudimos buscar tus pedidos.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const toggleOrderDetail = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!orderItems[orderId]) {
      setLoadingItems(orderId);
      try {
        const items = await listAdminOrderItems(orderId);
        setOrderItems((prev) => ({ ...prev, [orderId]: items }));
      } finally {
        setLoadingItems(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bone text-ink">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/8 bg-bone/95 px-5 backdrop-blur">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">
          Mi cuenta
        </span>
        <button
          aria-label="Volver"
          onClick={onExit}
          className="grid h-10 w-10 place-items-center text-ink/70 hover:text-ink"
        >
          <Close className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-[800px] px-5 py-8 md:py-12 space-y-10">
        {/* Phone lookup */}
        <section>
          <h1 className="text-[26px] font-bold leading-[0.95] tracking-[-0.02em] md:text-[30px]">
            Encontrá tus pedidos
          </h1>
          <p className="mt-2 text-[13px] text-smoke md:text-[14px]">
            Ingresá tu WhatsApp con el que hiciste el pedido.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadByPhone(phone);
            }}
            className="mt-5 flex gap-2"
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+598 9xx xx xx xx"
              inputMode="tel"
              autoComplete="tel"
              className="flex-1 border border-ink/15 bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink"
            />
            <button
              type="submit"
              className="bg-ink px-5 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-bone hover:bg-obsidian"
            >
              Buscar
            </button>
          </form>
        </section>

        {error && (
          <div className="border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
            {error}
          </div>
        )}

        {loading && (
          <p className="text-center text-[13px] text-smoke">Buscando...</p>
        )}

        {!loading && searched && orders.length > 0 && (
          <section>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.18em]">
              Tus pedidos
            </h2>
            <ul className="mt-3 space-y-3">
              {orders.map((o) => {
                const s = STATUS_LABELS[o.status] || {
                  label: o.status,
                  tone: "bg-ink/5 text-ink/70",
                };
                const link = waLink(o.customer_phone, o.order_number || o.id.slice(0, 8));
                const isOpen = expandedOrderId === o.id;
                const items = orderItems[o.id];
                const loadingThis = loadingItems === o.id;
                return (
                  <li
                    key={o.id}
                    className="border border-ink/12 bg-white"
                  >
                    <button
                      onClick={() => toggleOrderDetail(o.id)}
                      className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/[0.02]"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14px] font-bold">
                            {o.order_number || o.id.slice(0, 8)}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${s.tone}`}
                          >
                            {s.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-smoke">
                          {fmtDate(o.created_at)} · {uy(Number(o.total_amount) || 0)}
                        </p>
                        {o.notes && (
                          <p className="mt-1 text-[12px] text-smoke line-clamp-2">
                            <span className="font-semibold text-ink/80">Notas:</span>{" "}
                            {o.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {link && (
                          <a
                            href={link}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-[#25D366] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1DA851]"
                          >
                            WhatsApp
                          </a>
                        )}
                        <span className="text-[10px] uppercase tracking-[0.16em] text-smoke">
                          {isOpen ? "cerrar ▲" : "detalle ▼"}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-ink/8 px-4 py-4 space-y-4">
                        <OrderTimeline status={o.status} />
                        {loadingThis ? (
                          <p className="text-center text-[12px] text-smoke">
                            Cargando ítems...
                          </p>
                        ) : !items || items.length === 0 ? (
                          <p className="text-center text-[12px] text-smoke">
                            Sin ítems registrados.
                          </p>
                        ) : (
                          <ul className="divide-y divide-ink/8 border border-ink/8">
                            {items.map((it) => {
                              const product = productById.get(it.product_id);
                              const image =
                                product?.image ||
                                (Array.isArray(product?.images) && product.images[0]) ||
                                "";
                              return (
                                <li
                                  key={it.id}
                                  className="flex items-center gap-3 px-3 py-2"
                                >
                                  <div className="h-14 w-12 shrink-0 bg-bone-200">
                                    {image && (
                                      <img
                                        src={image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-semibold">
                                      {it.product_name || "(producto)"}
                                    </p>
                                    <p className="mt-0.5 text-[11.5px] text-smoke">
                                      {it.quantity} ×{" "}
                                      {uy(Number(it.unit_price) || 0)}
                                      {it.unit_type && it.unit_type !== "unidad"
                                        ? ` · ${it.unit_type}`
                                        : ""}
                                    </p>
                                  </div>
                                  <span className="text-[13px] font-bold">
                                    {uy(Number(it.subtotal) || 0)}
                                  </span>
                                </li>
                              );
                            })}
                            <li className="flex items-center justify-between gap-3 bg-ink/[0.03] px-3 py-3 text-[13px]">
                              <span className="font-bold uppercase tracking-[0.12em]">
                                Total
                              </span>
                              <span className="text-[15px] font-extrabold">
                                {uy(Number(o.total_amount) || 0)}
                              </span>
                            </li>
                          </ul>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!loading && searched && orders.length === 0 && !error && (
          <div className="border border-dashed border-ink/20 px-6 py-12 text-center text-[13px] text-smoke">
            No hay pedidos con ese número todavía.
          </div>
        )}

        {saved.length > 0 && (
          <section>
            <h2 className="text-[14px] font-bold uppercase tracking-[0.18em]">
              Carritos guardados
            </h2>
            <ul className="mt-3 space-y-2">
              {saved.map((sc) => (
                <li
                  key={sc.id}
                  className="flex items-center justify-between border border-ink/12 bg-white px-4 py-3 text-[13px]"
                >
                  <span className="truncate font-semibold">{sc.name}</span>
                  <span className="text-[11px] text-smoke">
                    {sc.items.length} ítem{sc.items.length === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!searched && !sessionCustomer && (
          <div className="border border-dashed border-ink/20 px-6 py-12 text-center text-[13px] text-smoke">
            Ingresá tu número para buscar tus pedidos.
          </div>
        )}

        <section className="border-t border-ink/8 pt-6">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onExit();
            }}
            className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] text-ink hover:text-obsidian"
          >
            <Arrow className="h-4 w-4 rotate-180" />
            Seguir viendo la tienda
          </a>
        </section>
      </main>
    </div>
  );
}

/**
 * Compact horizontal status timeline (steps with current step highlighted).
 * Shows the lifecycle for non-cancelled orders; cancelled orders get a banner.
 */
function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
        Este pedido fue cancelado.
      </div>
    );
  }
  const currentIdx = STATUS_ORDER.indexOf(status);
  const reached =
    currentIdx >= 0 ? currentIdx : status === "pending" ? 0 : 0;
  return (
    <ol className="flex w-full items-center gap-1">
      {STATUS_ORDER.map((step, idx) => {
        const done = idx <= reached;
        const label = STATUS_LABELS[step]?.label || step;
        const isLast = idx === STATUS_ORDER.length - 1;
        return (
          <li
            key={step}
            className="flex flex-1 items-center gap-1"
          >
            <div className="flex flex-1 flex-col items-center">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                  done
                    ? "bg-ink text-bone"
                    : "bg-ink/10 text-smoke"
                }`}
              >
                {done ? "✓" : idx + 1}
              </span>
              <span
                className={`mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-center ${
                  done ? "text-ink" : "text-smoke"
                }`}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mb-4 h-px w-full ${
                  idx < reached ? "bg-ink" : "bg-ink/10"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
