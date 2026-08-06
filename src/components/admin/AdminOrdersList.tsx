import { useEffect, useState } from "react";
import {
  listAdminOrders,
  listAdminOrderItems,
  updateOrderStatus,
  type AdminOrderRow,
  type AdminOrderItem,
} from "../../lib/orders";
import { supabase } from "../../lib/supabase";
import { uy } from "../../lib/data";

const STATUS_LABELS: Record<string, { label: string; tone: string }> = {
  pending: { label: "Nuevo", tone: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmado", tone: "bg-sky-100 text-sky-800" },
  preparing: { label: "Preparando", tone: "bg-violet-100 text-violet-800" },
  shipped: { label: "En camino", tone: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Entregado", tone: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Cancelado", tone: "bg-rose-100 text-rose-800" },
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es-UY", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminOrdersList() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, AdminOrderItem[]>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listAdminOrders({
        status: statusFilter || undefined,
        limit: 200,
      });
      setOrders(rows);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Real-time subscription: prepend new orders, react to status changes.
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const incoming = payload.new as AdminOrderRow;
          setOrders((prev) => {
            if (prev.some((o) => o.id === incoming.id)) return prev;
            // skip when filter doesn't match
            if (
              statusFilter &&
              incoming.status !== statusFilter
            ) {
              return prev;
            }
            return [incoming, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as AdminOrderRow;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o)),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const handleExpand = async (orderId: string) => {
    if (expanded === orderId) {
      setExpanded(null);
      return;
    }
    setExpanded(orderId);
    if (!items[orderId]) {
      const list = await listAdminOrderItems(orderId);
      setItems((prev) => ({ ...prev, [orderId]: list }));
    }
  };

  const handleStatus = async (id: string, next: string) => {
    const res = await updateOrderStatus(id, next);
    if (!res.ok) {
      setError(res.error || "No se pudo cambiar el estado");
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o)),
    );
  };

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">Pedidos</h2>
          <p className="text-[13px] text-smoke">
            {loading
              ? "Cargando..."
              : `${orders.length} pedido${orders.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-ink/15 bg-bone px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] outline-none focus:border-ink"
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]?.label || s}
              </option>
            ))}
          </select>
          <button
            onClick={refresh}
            className="border border-ink/15 bg-bone px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-ink"
          >
            Refrescar
          </button>
        </div>
      </header>

      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="border border-dashed border-ink/20 px-6 py-12 text-center text-[13px] text-smoke">
          Todavía no hay pedidos. Cuando un cliente complete el checkout va a aparecer acá.
        </div>
      )}

      <ul className="space-y-3">
        {orders.map((o) => {
          const s = STATUS_LABELS[o.status] || {
            label: o.status,
            tone: "bg-ink/5 text-ink/70",
          };
          const orderItems = items[o.id];
          const isOpen = expanded === o.id;
          return (
            <li
              key={o.id}
              className="border border-ink/12 bg-white"
            >
              <button
                onClick={() => handleExpand(o.id)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-ink/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold">
                      {o.order_number || o.id.slice(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${s.tone}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-smoke">
                    {o.customer_name || "Cliente sin nombre"} ·{" "}
                    {o.customer_phone || "—"} · {fmtDate(o.created_at)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] font-extrabold">
                    {uy(Number(o.total_amount) || 0)}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-smoke">
                    {isOpen ? "cerrar" : "detalle"}
                  </p>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-ink/8 px-4 py-3">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                        Cliente
                      </p>
                      <p className="mt-1 text-[13px]">
                        {o.customer_name || "—"}
                      </p>
                      <p className="text-[12.5px] text-smoke">
                        {o.customer_phone || "—"}
                      </p>
                      {o.customer_email && (
                        <p className="text-[12.5px] text-smoke">
                          {o.customer_email}
                        </p>
                      )}
                      {o.customer_address && (
                        <p className="mt-1 text-[12.5px]">
                          {o.customer_address}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                        Estado
                      </p>
                      <select
                        value={o.status}
                        onChange={(e) => handleStatus(o.id, e.target.value)}
                        className="mt-1 w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]?.label || s}
                          </option>
                        ))}
                      </select>
                      {o.notes && (
                        <p className="mt-2 text-[12px] text-smoke">
                          <span className="font-semibold text-ink/80">
                            Notas:
                          </span>{" "}
                          {o.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
                      Ítems
                    </p>
                    {!orderItems ? (
                      <p className="mt-2 text-[12px] text-smoke">Cargando...</p>
                    ) : orderItems.length === 0 ? (
                      <p className="mt-2 text-[12px] text-smoke">
                        No hay ítems registrados.
                      </p>
                    ) : (
                      <ul className="mt-2 divide-y divide-ink/8 border border-ink/8">
                        {orderItems.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-center justify-between gap-3 px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold">
                                {it.product_name || "(producto eliminado)"}
                              </p>
                              <p className="text-[11.5px] text-smoke">
                                {it.quantity} × {uy(Number(it.unit_price) || 0)}{" "}
                                · {it.unit_type || "unidad"}
                              </p>
                            </div>
                            <span className="text-[13px] font-bold">
                              {uy(Number(it.subtotal) || 0)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
