import { useEffect, useMemo, useState } from "react";
import type { Review } from "../../types/reviews";
import { useStore } from "../../lib/store";
import {
  deleteReview,
  fetchAllReviews,
  setReviewApproved,
  setReviewFeatured,
  updateReview,
} from "../../lib/reviewsService";
import { AdminReviewFormModal } from "./AdminReviewFormModal";

type StatusFilter = "all" | "pending" | "approved" | "featured";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "approved", label: "Aprobadas" },
  { value: "featured", label: "Destacadas" },
];

/** Render de estrellas para listas (rellenas según `value`). */
function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`Calificación ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          className={`${cls} ${
            n <= value ? "text-gold-500 fill-gold-500" : "text-bone-300 fill-bone-300"
          }`}
          aria-hidden="true"
        >
          <path d="M12 2l2.939 6.318 6.933.849-5.144 4.734 1.359 6.859L12 17.278 5.913 20.76l1.359-6.859L2.128 9.167l6.933-.849L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function AdminReviewsManager() {
  const { products } = useStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Modal + delete confirm
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Review | null>(null);

  const productName = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const loadReviews = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await fetchAllReviews();
      setReviews(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las reseñas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-limpiar el aviso de éxito.
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const filteredReviews = useMemo(() => {
    const q = search.toLowerCase().trim();
    return reviews.filter((r) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !r.approved) ||
        (statusFilter === "approved" && r.approved) ||
        (statusFilter === "featured" && r.approved && r.featured);

      const product = productName.get(r.product_id) || "";
      const matchesSearch =
        !q ||
        r.customer_name.toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.body || "").toLowerCase().includes(q) ||
        product.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [reviews, search, statusFilter, productName]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (r: Review) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setNotice(
      editing
        ? "Reseña actualizada correctamente."
        : "Reseña creada correctamente."
    );
    loadReviews(true);
  };

  const handleToggleApproved = async (r: Review) => {
    try {
      await setReviewApproved(r.id, !r.approved);
      setNotice(r.approved ? "Reseña desaprobada." : "Reseña aprobada.");
      loadReviews(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar el estado de la reseña."
      );
    }
  };

  const handleToggleFeatured = async (r: Review) => {
    try {
      await setReviewFeatured(r.id, !r.featured);
      setNotice(r.featured ? "Reseña quitada de destacadas." : "Reseña destacada.");
      loadReviews(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar el estado de la reseña."
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteReview(deleteCandidate.id);
      setNotice("Reseña eliminada correctamente.");
      loadReviews(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar la reseña."
      );
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Reordenar: intercambia sort_order con la reseña vecina.
  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= filteredReviews.length) return;
    const a = filteredReviews[index];
    const b = filteredReviews[target];
    try {
      await Promise.all([
        updateReview(a.id, { sortOrder: b.sort_order }),
        updateReview(b.id, { sortOrder: a.sort_order }),
      ]);
      loadReviews(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reordenar las reseñas."
      );
    }
  };

  const countFor = (f: StatusFilter) =>
    f === "all"
      ? reviews.length
      : f === "pending"
      ? reviews.filter((r) => !r.approved).length
      : f === "approved"
      ? reviews.filter((r) => r.approved).length
      : reviews.filter((r) => r.approved && r.featured).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Controls */}
      <div className="bg-white border border-bone-300 p-4 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
              Gestión de Reseñas
            </h1>
            <p className="text-xs text-smoke">
              {filteredReviews.length} de {reviews.length} reseñas mostradas — aprobá,
              destacá y ordená lo que se ve en la tienda
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-gold-500/20 active:scale-95 transition-all self-start sm:self-auto min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nueva Reseña
          </button>
        </div>

        {/* Search + Status tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente, título, comentario o producto..."
              className="w-full bg-bone-200/60 border border-bone-300 rounded-xl pl-10 pr-9 py-2.5 text-xs text-ink placeholder:text-smoke focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
            />
            <svg
              className="w-4 h-4 text-smoke absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="md:col-span-6 flex items-center gap-1 bg-bone-200 p-1 rounded-xl min-h-[44px]">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                  statusFilter === tab.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-smoke hover:text-ink"
                }`}
              >
                {tab.label} ({countFor(tab.value)})
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            {notice}
          </p>
        )}
        {error && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </div>

      {/* List Content */}
      {loading ? (
        <div className="bg-white border border-bone-300 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-10 h-10 rounded-full border-4 border-gold-500 border-t-transparent animate-spin mx-auto" />
          <p className="mt-4 text-xs text-smoke font-semibold">Cargando reseñas…</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-bone-300 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-bone-200 text-smoke flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.976 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-ink">No se encontraron reseñas</h3>
          <p className="text-xs text-smoke max-w-sm mx-auto">
            No hay reseñas que coincidan con la búsqueda o filtro. Creá la primera
            reseña para empezar a mostrar confianza en la tienda.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="text-xs font-bold text-gold-600 hover:underline pt-2 inline-block"
          >
            + Nueva reseña
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Touch-Optimized Cards (visible < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredReviews.map((r, index) => {
              const product = productName.get(r.product_id) || "Producto sin nombre";
              return (
                <div
                  key={r.id}
                  className="bg-white border border-bone-300 rounded-2xl p-4 shadow-sm flex flex-col gap-3"
                >
                  {/* Top: reorder + photo + info */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={!r.approved || index === 0}
                        title="Subir"
                        className="p-1 text-smoke hover:text-gold-600 disabled:opacity-30 min-h-[32px]"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={!r.approved || index === filteredReviews.length - 1}
                        title="Bajar"
                        className="p-1 text-smoke hover:text-gold-600 disabled:opacity-30 min-h-[32px]"
                      >
                        ↓
                      </button>
                    </div>

                    {r.photo_url ? (
                      <img
                        src={r.photo_url}
                        alt={`Foto de la reseña de ${r.customer_name}`}
                        className="w-14 h-14 rounded-xl object-cover bg-bone-200 shrink-0 border border-bone-300"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-bone-200 border border-bone-300 shrink-0 flex items-center justify-center text-[10px] text-smoke">
                        Sin foto
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded">
                          {product}
                        </span>
                        {r.verified_purchase && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded">
                            Compra verificada
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-ink leading-snug line-clamp-1">
                        {r.customer_name}
                      </h3>
                      <Stars value={r.rating} size="md" />
                      {r.title && (
                        <p className="text-[10px] text-smoke truncate">
                          <span className="font-semibold text-ink">{r.title}</span>
                        </p>
                      )}
                      {r.body && (
                        <p className="text-[10px] text-smoke line-clamp-2">{r.body}</p>
                      )}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r.approved
                              ? "text-emerald-700 bg-emerald-500/10"
                              : "text-amber-700 bg-amber-500/10"
                          }`}
                        >
                          {r.approved ? "Aprobada" : "Pendiente"}
                        </span>
                        {r.featured && (
                          <span className="text-[10px] font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 rounded">
                            Destacada
                          </span>
                        )}
                        <span className="text-[10px] text-smoke font-mono bg-bone-200 px-1.5 py-0.5 rounded">
                          #{r.sort_order}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggles row */}
                  <div className="flex items-center justify-between pt-2 border-t border-bone-200 bg-bone-200/30 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-smoke">Aprobada</span>
                      <button
                        type="button"
                        onClick={() => handleToggleApproved(r)}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none min-h-[44px] min-w-[44px] justify-center ${
                          r.approved ? "bg-emerald-500" : "bg-bone-300"
                        }`}
                        aria-label="Toggle aprobada"
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            r.approved ? "translate-x-2.5" : "-translate-x-2.5"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-smoke">Destacada</span>
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(r)}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none min-h-[44px] min-w-[44px] justify-center ${
                          r.featured ? "bg-gold-500" : "bg-bone-300"
                        }`}
                        aria-label="Toggle destacada"
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            r.featured ? "translate-x-2.5" : "-translate-x-2.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="flex-1 bg-obsidian text-bone hover:bg-ink text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                    >
                      <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(r)}
                      className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Eliminar reseña"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Data Table (visible >= md) */}
          <div className="hidden md:block bg-white border border-bone-300 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bone-200/80 border-b border-bone-300 text-[10px] font-extrabold uppercase tracking-wider text-smoke">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-center">Orden</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200 text-xs">
                {filteredReviews.map((r, index) => {
                  const product = productName.get(r.product_id) || "—";
                  return (
                    <tr key={r.id} className="hover:bg-bone-200/40 transition-colors group">
                      {/* Producto */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-ink truncate max-w-[180px]">{product}</p>
                        {r.verified_purchase && (
                          <span className="text-[10px] font-bold text-emerald-700">
                            Compra verificada
                          </span>
                        )}
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-ink">{r.customer_name}</p>
                        {r.size && (
                          <p className="text-[10px] text-smoke">Talle: {r.size}</p>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4">
                        <Stars value={r.rating} size="md" />
                        {r.title && (
                          <p className="text-[10px] text-smoke truncate max-w-[140px]">
                            {r.title}
                          </p>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              r.approved
                                ? "text-emerald-700 bg-emerald-500/10"
                                : "text-amber-700 bg-amber-500/10"
                            }`}
                          >
                            {r.approved ? "Aprobada" : "Pendiente"}
                          </span>
                          {r.featured && (
                            <span className="text-[10px] font-bold text-gold-700 bg-gold-500/10 px-2 py-0.5 rounded">
                              Destacada
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Orden */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMove(index, -1)}
                            disabled={!r.approved || index === 0}
                            title="Subir"
                            className="p-1.5 text-smoke hover:text-gold-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <span className="text-[10px] text-smoke font-mono bg-bone-200 px-1.5 py-0.5 rounded">
                            #{r.sort_order}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 1)}
                            disabled={!r.approved || index === filteredReviews.length - 1}
                            title="Bajar"
                            className="p-1.5 text-smoke hover:text-gold-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </div>
                        {!r.approved && (
                          <p className="text-[9px] text-smoke">aprobá para ordenar</p>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleApproved(r)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              r.approved ? "bg-emerald-500" : "bg-bone-300"
                            }`}
                            title={r.approved ? "Desaprobar reseña" : "Aprobar reseña"}
                            aria-label="Toggle aprobada"
                          >
                            <span
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                r.approved ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(r)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              r.featured ? "bg-gold-500" : "bg-bone-300"
                            }`}
                            title={r.featured ? "Quitar de destacadas" : "Destacar reseña"}
                            aria-label="Toggle destacada"
                          >
                            <span
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                r.featured ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1.5 text-smoke hover:text-ink hover:bg-bone-200 rounded-lg transition-colors"
                            title="Editar reseña"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(r)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar reseña"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Form Modal */}
      <AdminReviewFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialReview={editing}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-obsidian/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-bone-300 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-base font-extrabold text-ink">Eliminar Reseña</h3>
            </div>

            <p className="text-xs text-smoke leading-relaxed">
              ¿Estás seguro de que deseas eliminar la reseña de{" "}
              <strong className="text-ink">{deleteCandidate.customer_name}</strong>?
              Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 bg-bone-200 hover:bg-bone-300 text-ink font-bold text-xs py-3 rounded-xl transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-colors min-h-[44px]"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
