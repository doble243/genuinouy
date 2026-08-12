import { useEffect, useRef, useState } from "react";
import type { Review } from "../../types/reviews";
import { useStore } from "../../lib/store";
import { resolveImageUrl, uploadImageToCloudinary } from "../../lib/cloudinary";
import { createReview, updateReview } from "../../lib/reviewsService";

const inputCls =
  "w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]";

const labelCls = "block font-bold text-ink mb-1";

interface AdminReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReview?: Review | null;
  onSaved?: (review: Review) => void;
}

type ReviewForm = {
  productId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  photoUrl: string;
  verifiedPurchase: boolean;
  approved: boolean;
  featured: boolean;
  sortOrder: number;
};

function emptyForm(productId: string): ReviewForm {
  return {
    productId,
    customerName: "",
    rating: 5,
    title: "",
    body: "",
    size: "",
    photoUrl: "",
    verifiedPurchase: false,
    approved: false,
    featured: false,
    sortOrder: 0,
  };
}

function formFromReview(r: Review): ReviewForm {
  return {
    productId: r.product_id,
    customerName: r.customer_name,
    rating: r.rating,
    title: r.title || "",
    body: r.body || "",
    size: r.size || "",
    photoUrl: r.photo_url || "",
    verifiedPurchase: r.verified_purchase,
    approved: r.approved,
    featured: r.featured,
    sortOrder: r.sort_order,
  };
}

/** Estrella única para el selector de rating (rellena o vacía). */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-7 h-7 ${
        filled ? "text-gold-500 fill-gold-500" : "text-bone-300 fill-bone-300"
      }`}
      aria-hidden="true"
    >
      <path d="M12 2l2.939 6.318 6.933.849-5.144 4.734 1.359 6.859L12 17.278 5.913 20.76l1.359-6.859L2.128 9.167l6.933-.849L12 2z" />
    </svg>
  );
}

export function AdminReviewFormModal({
  isOpen,
  onClose,
  initialReview,
  onSaved,
}: AdminReviewFormModalProps) {
  const { products } = useStore();

  const [form, setForm] = useState<ReviewForm>(() =>
    emptyForm(products[0]?.id || "")
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset del formulario cada vez que se abre (nuevo o edición).
  useEffect(() => {
    if (!isOpen) return;
    setError("");
    setSaving(false);
    setUploading(false);
    setForm(
      initialReview
        ? formFromReview(initialReview)
        : emptyForm(products[0]?.id || "")
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [isOpen, initialReview, products]);

  if (!isOpen) return null;

  const set = <K extends keyof ReviewForm>(key: K, value: ReviewForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImageToCloudinary(file, "genuinos/reviews");
      set("photoUrl", url);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      setError(
        "No se pudo subir la foto a Cloudinary. Revisá tu conexión y probá de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.productId) {
      setError("Elegí un producto para la reseña.");
      return;
    }
    if (!form.customerName.trim()) {
      setError("Ingresá el nombre del cliente.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        productId: form.productId,
        customerName: form.customerName.trim(),
        rating: form.rating,
        title: form.title.trim(),
        body: form.body.trim(),
        size: form.size.trim(),
        photoUrl: form.photoUrl.trim(),
        verifiedPurchase: form.verifiedPurchase,
        approved: form.approved,
        featured: form.featured,
        sortOrder: form.sortOrder,
      };
      const saved = initialReview
        ? await updateReview(initialReview.id, payload)
        : await createReview(payload);
      onSaved?.(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la reseña.");
    } finally {
      setSaving(false);
    }
  };

  const shownImage = form.photoUrl ? resolveImageUrl(form.photoUrl) : "";

  return (
    <div className="fixed inset-0 bg-obsidian/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-up">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1 bg-bone-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-bone-300 flex items-center justify-between bg-obsidian text-bone shrink-0">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
              {initialReview ? "Edición de Reseña" : "Nueva Reseña"}
            </span>
            <h2 className="text-lg font-bold">
              {initialReview ? "Editar Reseña" : "Crear Reseña"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-smoke hover:text-white rounded-xl bg-ink/60 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Producto */}
          <div>
            <label className={labelCls}>
              Producto <span className="text-rose-600">*</span>
            </label>
            <select
              value={form.productId}
              onChange={(e) => set("productId", e.target.value)}
              className={inputCls}
            >
              {products.length === 0 && (
                <option value="">Sin productos cargados</option>
              )}
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.brand ? `· ${p.brand}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className={labelCls}>
              Calificación <span className="text-rose-600">*</span>
            </label>
            <div className="flex items-center gap-1.5 min-h-[44px]">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("rating", n)}
                  className="p-1 rounded-lg transition-transform active:scale-90"
                  title={`${n} estrella${n > 1 ? "s" : ""}`}
                  aria-label={`Calificación ${n} de 5`}
                >
                  <StarIcon filled={n <= form.rating} />
                </button>
              ))}
            </div>
          </div>

          {/* Nombre del cliente */}
          <div>
            <label className={labelCls}>
              Nombre del cliente <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              placeholder="Ej: María Fernández"
              className={inputCls}
            />
          </div>

          {/* Título + Talle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Título (opcional)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ej: Muy cómodos"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Talle (opcional)</label>
              <input
                type="text"
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="Ej: 42"
                className={inputCls}
              />
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className={labelCls}>Comentario (opcional)</label>
            <textarea
              rows={3}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              placeholder="Contá la experiencia del cliente con el producto…"
              className={inputCls}
            />
          </div>

          {/* Foto */}
          <div className="space-y-3 pt-1">
            <div className="border-b border-bone-300 pb-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600">
                Foto del cliente (opcional)
              </h3>
            </div>

            {/* Preview */}
            {shownImage ? (
              <img
                src={shownImage}
                alt="Preview reseña"
                className="w-full h-40 object-cover rounded-xl border border-bone-300 bg-bone-200"
              />
            ) : (
              <div className="w-full h-32 rounded-xl bg-bone-200 border border-dashed border-bone-300 flex items-center justify-center text-[11px] text-smoke">
                Sin foto cargada
              </div>
            )}

            {/* Upload / remove */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
              />
              {form.photoUrl ? (
                <>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border border-dashed border-gold-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-gold-600 hover:bg-gold-500/5 transition-all min-h-[44px] disabled:opacity-60"
                  >
                    {uploading ? "Subiendo…" : "↺ Reemplazar foto"}
                  </button>
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => set("photoUrl", "")}
                    className="flex-1 border border-rose-300 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all min-h-[44px] disabled:opacity-60"
                  >
                    Quitar foto
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border border-dashed border-gold-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-gold-600 hover:bg-gold-500/5 transition-all min-h-[44px] disabled:opacity-60"
                >
                  {uploading
                    ? "Subiendo a Cloudinary…"
                    : "⬆ Subir foto (se guarda en webp)"}
                </button>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 bg-bone-200/50 p-3 rounded-xl border border-bone-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">Compra verificada</p>
                <p className="text-[10px] text-smoke">
                  Muestra el badge "Compra verificada"
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("verifiedPurchase", !form.verifiedPurchase)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  form.verifiedPurchase ? "bg-emerald-500" : "bg-bone-300"
                }`}
                aria-label="Toggle compra verificada"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    form.verifiedPurchase ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">Aprobada</p>
                <p className="text-[10px] text-smoke">
                  Visible en el storefront solo si está aprobada
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("approved", !form.approved)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  form.approved ? "bg-emerald-500" : "bg-bone-300"
                }`}
                aria-label="Toggle aprobada"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    form.approved ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">Destacada</p>
                <p className="text-[10px] text-smoke">
                  Entra al carrusel de reseñas de la home
                </p>
              </div>
              <button
                type="button"
                onClick={() => set("featured", !form.featured)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  form.featured ? "bg-gold-500" : "bg-bone-300"
                }`}
                aria-label="Toggle destacada"
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    form.featured ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* sort_order */}
          <div>
            <label className={labelCls}>Orden (sort_order)</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                set("sortOrder", Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)
              }
              className={inputCls}
            />
            <p className="mt-1 text-[10px] text-smoke">
              Menor número = aparece primero (carrusel y lista).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-bone-300 bg-bone-200/40 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-bold text-xs text-smoke hover:text-ink transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-gold-500 hover:bg-gold-400 text-obsidian font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 transition-all min-h-[44px] disabled:opacity-60"
          >
            {saving ? "Guardando…" : initialReview ? "Guardar Cambios" : "Crear Reseña"}
          </button>
        </div>
      </div>
    </div>
  );
}
