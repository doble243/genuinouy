import { useEffect, useMemo, useState } from "react";
import type { AdminProduct, AdminTab } from "../../types/admin";
import { uy } from "../../lib/data";
import { supabase } from "../../lib/supabase";
import { listAdminOrderItems } from "../../lib/orders";
import { adminWhatsappUrl } from "../../lib/whatsapp";

interface AdminDashboardProps {
  products: AdminProduct[];
  onOpenNewProductModal: () => void;
  onSelectProductForEdit: (product: AdminProduct) => void;
  onToggleStock: (productId: string) => void;
  onViewAllProducts: () => void;
  onNavigateToTab: (tab: AdminTab) => void;
}

type PendingOrder = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email?: string | null;
  total_amount: number;
  status: string;
  created_at: string;
};

function fmtTimeAgo(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return "ahora";
    if (min < 60) return `${min} min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} h`;
    const d = Math.floor(hr / 24);
    return `${d} d`;
  } catch {
    return "";
  }
}

export function AdminDashboard({
  products,
  onOpenNewProductModal,
  onSelectProductForEdit,
  onToggleStock,
  onViewAllProducts,
  onNavigateToTab,
}: AdminDashboardProps) {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, number>>({});

  const loadPending = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("id,order_number,customer_name,customer_phone,total_amount,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data) return;
    setPendingOrders(data as PendingOrder[]);
    // item counts (best-effort, fire-and-forget)
    const counts: Record<string, number> = {};
    await Promise.all(
      (data as PendingOrder[]).map(async (o) => {
        const items = await listAdminOrderItems(o.id);
        counts[o.id] = items.length;
      }),
    );
    setItemsByOrder((prev) => ({ ...prev, ...counts }));
  };

  // Initial fetch on mount.
  useEffect(() => {
    loadPending();
  }, []);

  // Real-time: react to new pending orders + status updates.
  useEffect(() => {
    const channel = supabase
      .channel("admin-dashboard-pending")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as PendingOrder & { status?: string };
          if (o.status === "pending") {
            setPendingOrders((prev) => {
              if (prev.some((x) => x.id === o.id)) return prev;
              return [o, ...prev].slice(0, 20);
            });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const o = payload.new as PendingOrder & { status?: string };
          setPendingOrders((prev) => {
            if (o.status === "pending") {
              if (!prev.some((x) => x.id === o.id)) {
                return [o, ...prev].slice(0, 20);
              }
              return prev.map((x) => (x.id === o.id ? o : x));
            }
            return prev.filter((x) => x.id !== o.id);
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  // Calculated stats metrics
  const stats = useMemo(() => {
    const total = products.length;
    const outOfStockItems = products.filter(
      (p) => p.inStock === false || (p.stock !== undefined && p.stock <= 0)
    );
    const lowStockItems = products.filter(
      (p) => p.stock !== undefined && p.stock > 0 && p.stock <= 3
    );
    const inStockCount = total - outOfStockItems.length;
    
    const totalInventoryValue = products.reduce((acc, p) => {
      const isAvailable = p.inStock !== false;
      const qty = p.stock ?? (isAvailable ? 5 : 0);
      return acc + p.price * qty;
    }, 0);

    const stockRatio = total > 0 ? Math.round((inStockCount / total) * 100) : 0;

    // Brand breakdown calculation
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      const b = p.brand || "Sin Marca";
      brandMap[b] = (brandMap[b] || 0) + 1;
    });

    const topBrands = Object.entries(brandMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      total,
      inStockCount,
      outOfStockCount: outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockItems,
      totalInventoryValue,
      stockRatio,
      topBrands,
    };
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-obsidian text-bone p-6 rounded-2xl border border-ink/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400">
            Resumen General de Tienda
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Control
          </h1>
          <p className="text-xs text-smoke max-w-lg">
            Monitoreo en tiempo real de inventario, stock crítico, métricas de catálogo y acciones rápidas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenNewProductModal}
            className="bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-xs px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-gold-500/20 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {/* Decorative Gold Glow Accent */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Pedidos sin atender (live) */}
      <PendingOrdersAlert
        orders={pendingOrders}
        itemCounts={itemsByOrder}
        onViewAll={() => onNavigateToTab("orders")}
      />

      {/* Main Stats Overview Cards - Mobile First Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {/* Card 1: Total Productos */}
        <div className="bg-white border border-bone-300 p-4 md:p-5 rounded-2xl shadow-sm hover:border-ink/20 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-smoke">
              Total Productos
            </span>
            <div className="p-2 bg-bone-200 text-ink rounded-xl">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-black text-ink">{stats.total}</p>
            <p className="mt-1 text-[11px] text-smoke font-medium">
              Activos en catálogo
            </p>
          </div>
        </div>

        {/* Card 2: En Stock */}
        <div className="bg-white border border-bone-300 p-4 md:p-5 rounded-2xl shadow-sm hover:border-emerald-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              En Stock
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-black text-ink">{stats.inStockCount}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex-1 bg-bone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.stockRatio}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-700">{stats.stockRatio}%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Agotados / Stock Bajo */}
        <div className="bg-white border border-bone-300 p-4 md:p-5 rounded-2xl shadow-sm hover:border-rose-500/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Agotados / Alertas
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl relative">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {stats.outOfStockCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl md:text-3xl font-black text-rose-600">{stats.outOfStockCount}</p>
            <p className="mt-1 text-[11px] text-smoke font-medium">
              {stats.lowStockCount > 0 ? `+ ${stats.lowStockCount} en stock bajo` : "Sin disponibilidad"}
            </p>
          </div>
        </div>

        {/* Card 4: Valor Inventario */}
        <div className="bg-white border border-bone-300 p-4 md:p-5 rounded-2xl shadow-sm hover:border-gold-500/40 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600">
              Valor Inventario
            </span>
            <div className="p-2 bg-gold-500/10 text-gold-600 rounded-xl">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
              {uy(stats.totalInventoryValue)}
            </p>
            <p className="mt-1 text-[11px] text-smoke font-medium">
              Estimación total UYU
            </p>
          </div>
        </div>
      </div>

      {/* Accesos Rápidos Section */}
      <div className="bg-bone-200 border border-bone-300 p-4 rounded-2xl">
        <h3 className="text-xs font-bold uppercase tracking-widest text-smoke mb-3">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={onOpenNewProductModal}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-obsidian hover:text-bone border border-bone-300 rounded-xl text-xs font-bold text-ink transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar Producto
          </button>

          <button
            type="button"
            onClick={onViewAllProducts}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-obsidian hover:text-bone border border-bone-300 rounded-xl text-xs font-bold text-ink transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 text-smoke" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Ver Catálogo
          </button>

          <button
            type="button"
            onClick={onViewAllProducts}
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-obsidian hover:text-bone border border-bone-300 rounded-xl text-xs font-bold text-ink transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Revisar Agotados
          </button>

          <a
            href="/"
            className="flex items-center justify-center gap-2 p-3 bg-white hover:bg-obsidian hover:text-bone border border-bone-300 rounded-xl text-xs font-bold text-ink transition-all shadow-sm active:scale-98"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Previsualizar Tienda
          </a>
        </div>
      </div>

      {/* Grid Row: Out of Stock Alerts & Brand Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Out of Stock Alerts (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 bg-white border border-bone-300 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-bone-300 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">
                  Alertas de Stock Crítico
                </h2>
                <p className="text-[11px] text-smoke">Productos sin disponibilidad o stock bajo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onViewAllProducts}
              className="text-xs font-bold text-gold-600 hover:text-gold-500 transition-colors"
            >
              Ver Todos &rarr;
            </button>
          </div>

          {stats.outOfStockItems.length === 0 ? (
            <div className="p-8 text-center bg-bone-200/50 rounded-xl border border-dashed border-bone-300">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold text-ink">¡Excelente! Sin productos agotados</p>
              <p className="text-[11px] text-smoke mt-1">Todos los productos en el catálogo disponen de inventario activo.</p>
            </div>
          ) : (
            <div className="divide-y divide-bone-200">
              {stats.outOfStockItems.slice(0, 5).map((prod) => (
                <div key={prod.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover bg-bone-200 shrink-0 border border-bone-300"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600">
                        {prod.brand}
                      </span>
                      <h4 className="text-xs font-bold text-ink truncate group-hover:text-gold-600 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-[11px] text-smoke font-semibold">{uy(prod.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Agotado
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleStock(prod.id)}
                      className="text-xs font-bold text-obsidian bg-gold-500 hover:bg-gold-400 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                    >
                      Reactivar
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProductForEdit(prod)}
                      className="p-1.5 text-smoke hover:text-ink hover:bg-bone-200 rounded-lg transition-colors"
                      title="Editar Producto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand Distribution Breakdown (1 Column) */}
        <div className="bg-white border border-bone-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-bone-300 pb-3 mb-4">
              <h2 className="text-sm font-extrabold text-ink uppercase tracking-wide">
                Top Marcas en Catálogo
              </h2>
              <p className="text-[11px] text-smoke">Distribución por marca en inventario</p>
            </div>

            <div className="space-y-3.5">
              {stats.topBrands.map(([brandName, count]) => {
                const percentage = Math.round((count / (stats.total || 1)) * 100);
                return (
                  <div key={brandName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{brandName}</span>
                      <span className="text-smoke font-semibold">{count} prod ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-bone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-obsidian h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-bone-300 bg-bone-200/40 p-3 rounded-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-smoke uppercase tracking-wider text-[10px]">
                Estado Servidor & DB
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Conectado (Supabase)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pedidos sin atender — lives at the top of the dashboard. Listens (via the
 * parent's real-time subscription) for new pending orders and shows a live
 * count + the most recent 3 entries with a deep-link to the orders tab.
 */
function PendingOrdersAlert({
  orders,
  itemCounts,
  onViewAll,
}: {
  orders: PendingOrder[];
  itemCounts: Record<string, number>;
  onViewAll: () => void;
}) {
  if (orders.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <p className="text-[14px] font-bold text-emerald-900">
              Sin pedidos pendientes
            </p>
            <p className="text-[12px] text-emerald-700">
              Estás al día. Cuando entre un pedido nuevo aparece acá al instante.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-amber-300 bg-amber-50 rounded-2xl overflow-hidden animate-fade-in">
      <div className="bg-amber-100 px-5 py-3 border-b border-amber-200 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-amber-500 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-rose-500 ring-2 ring-amber-100 animate-pulse" />
          </span>
          <div>
            <p className="text-[14px] font-bold text-amber-900">
              {orders.length} pedido{orders.length === 1 ? "" : "s"} sin atender
            </p>
            <p className="text-[12px] text-amber-800">
              {orders.length === 1
                ? "Hay un pedido esperando que lo confirmes."
                : "Estos pedidos aún no fueron confirmados."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-bold uppercase tracking-[0.14em] px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-all"
        >
          Ver pedidos
        </button>
      </div>

      <ul className="divide-y divide-amber-200/70">
        {orders.slice(0, 3).map((o) => {
          const itemCount = itemCounts[o.id] ?? 0;
          const waUrl = adminWhatsappUrl(
            o.customer_phone,
            o.order_number || o.id.slice(0, 8),
            o.status || "pending",
            o.customer_name,
          );
          return (
            <li
              key={o.id}
              className="px-5 py-3 hover:bg-amber-100/60 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-ink">
                      {o.order_number || o.id.slice(0, 8)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] bg-amber-500 text-white">
                      Nuevo
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-ink/80">
                    {o.customer_name || "Cliente sin nombre"}{" "}
                    <span className="text-ink/50">·</span>{" "}
                    <span className="text-ink/70">
                      {uy(Number(o.total_amount) || 0)}
                    </span>{" "}
                    <span className="text-ink/50">·</span>{" "}
                    <span className="text-ink/70">
                      {fmtTimeAgo(o.created_at)}
                    </span>
                    {itemCount > 0 && (
                      <>
                        <span className="text-ink/50"> · </span>
                        <span className="text-ink/70">
                          {itemCount} ítem{itemCount === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 bg-[#25D366] hover:bg-[#1DA851] text-white text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-2 rounded-lg transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
