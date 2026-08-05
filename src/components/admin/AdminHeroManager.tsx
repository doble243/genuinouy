import { useEffect, useRef, useState } from "react";
import type { HeroSlide } from "../../types/admin";
import { resolveImageUrl, uploadImageToCloudinary } from "../../lib/cloudinary";
import {
  createHeroSlide,
  deleteHeroSlide,
  fetchHeroSlides,
  updateHeroSlide,
} from "../../lib/heroService";

const ALIGN_OPTIONS: { value: HeroSlide["align"]; label: string }[] = [
  { value: "left", label: "Izquierda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Derecha" },
];

type HeroSlideForm = {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  imageUrl: string;
  align: HeroSlide["align"];
  active: boolean;
};

const EMPTY_FORM: HeroSlideForm = {
  eyebrow: "",
  title: "",
  subtitle: "",
  buttonText: "",
  buttonHref: "#nuevos",
  imageUrl: "",
  align: "left",
  active: true,
};

const inputCls =
  "w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]";

export function AdminHeroManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState<HeroSlideForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm state
  const [deleteCandidate, setDeleteCandidate] = useState<HeroSlide | null>(null);

  const loadSlides = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchHeroSlides();
      setSlides(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los slides del hero."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  // Auto-limpiar el aviso de éxito.
  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(t);
  }, [notice]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setNewImageUrl("");
    setModalOpen(true);
  };

  const openEdit = (s: HeroSlide) => {
    setEditing(s);
    setForm({
      eyebrow: s.eyebrow,
      title: s.title,
      subtitle: s.subtitle,
      buttonText: s.buttonText,
      buttonHref: s.buttonHref || "#nuevos",
      imageUrl: s.imageUrl,
      align: s.align || "left",
      active: s.active,
    });
    setNewImageUrl("");
    setModalOpen(true);
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setForm((f) => ({ ...f, imageUrl: newImageUrl.trim() }));
    setNewImageUrl("");
  };

  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert(
        "No se pudo subir la imagen a Cloudinary. Revisá tu conexión y probá de nuevo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl.trim()) {
      alert("El slide necesita una imagen de fondo (URL o subida directa).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        eyebrow: form.eyebrow.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        buttonText: form.buttonText.trim(),
        buttonHref: form.buttonHref.trim() || "#nuevos",
        imageUrl: form.imageUrl.trim(),
        align: form.align,
        active: form.active,
      };
      if (editing) {
        const updated = await updateHeroSlide(editing.id, payload);
        setSlides((prev) =>
          prev.map((s) => (s.id === updated.id ? updated : s))
        );
        setNotice("Slide actualizado correctamente.");
      } else {
        const created = await createHeroSlide(payload);
        setSlides((prev) => [...prev, created]);
        setNotice("Slide creado correctamente.");
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el slide.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: HeroSlide) => {
    try {
      const updated = await updateHeroSlide(s.id, { active: !s.active });
      setSlides((prev) =>
        prev.map((x) => (x.id === updated.id ? updated : x))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar el estado del slide."
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await deleteHeroSlide(deleteCandidate.id);
      setSlides((prev) => prev.filter((s) => s.id !== deleteCandidate.id));
      setNotice("Slide eliminado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar el slide."
      );
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Reordenar: intercambia sort_order con el slide vecino.
  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const a = slides[index];
    const b = slides[target];
    try {
      await Promise.all([
        updateHeroSlide(a.id, { sortOrder: b.sortOrder }),
        updateHeroSlide(b.id, { sortOrder: a.sortOrder }),
      ]);
      const next = [...slides];
      next[index] = b;
      next[target] = a;
      setSlides(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al reordenar el slide."
      );
    }
  };

  const shownImage = form.imageUrl ? resolveImageUrl(form.imageUrl) : "";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Controls */}
      <div className="bg-white border border-bone-300 p-4 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
              Hero / Carrusel
            </h1>
            <p className="text-xs text-smoke">
              {slides.length} slide(s) — ordená y editá los banners de la portada
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
            Agregar slide
          </button>
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
          <p className="mt-4 text-xs text-smoke font-semibold">Cargando slides…</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white border border-bone-300 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-bone-200 text-smoke flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-2-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-ink">Todavía no hay slides</h3>
          <p className="text-xs text-smoke max-w-sm mx-auto">
            Agregá tu primer slide para personalizar el carrusel de la portada.
            Mientras tanto, el sitio sigue mostrando el hero estático por defecto.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="text-xs font-bold text-gold-600 hover:underline pt-2 inline-block"
          >
            + Agregar slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {slides.map((s, index) => (
            <div
              key={s.id}
              className="bg-white border border-bone-300 rounded-2xl p-4 shadow-sm flex items-center gap-3"
            >
              {/* Reorder controls */}
              <div className="flex flex-col items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  title="Subir"
                  className="p-1 text-smoke hover:text-gold-600 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === slides.length - 1}
                  title="Bajar"
                  className="p-1 text-smoke hover:text-gold-600 disabled:opacity-30"
                >
                  ↓
                </button>
              </div>

              {/* Thumbnail */}
              {resolveImageUrl(s.imageUrl) ? (
                <img
                  src={resolveImageUrl(s.imageUrl)}
                  alt={s.eyebrow || "Slide del hero"}
                  className="w-24 h-16 rounded-xl object-cover bg-bone-200 shrink-0 border border-bone-300"
                />
              ) : (
                <div className="w-24 h-16 rounded-xl bg-bone-200 border border-bone-300 shrink-0 flex items-center justify-center text-[10px] text-smoke">
                  Sin imagen
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded">
                    {s.align}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      s.active
                        ? "text-emerald-700 bg-emerald-500/10"
                        : "text-smoke bg-bone-200"
                    }`}
                  >
                    {s.active ? "Activo" : "Oculto"}
                  </span>
                  <span className="text-[10px] text-smoke font-mono bg-bone-200 px-1.5 py-0.5 rounded">
                    #{s.sortOrder}
                  </span>
                </div>
                {s.eyebrow && (
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink">
                    {s.eyebrow}
                  </p>
                )}
                <h3 className="text-xs font-bold text-ink leading-snug line-clamp-1">
                  {s.title || "Sin título"}
                </h3>
                <p className="text-[10px] text-smoke truncate line-clamp-1">
                  {s.buttonText ? `Botón: ${s.buttonText}` : "Sin botón"}
                </p>
              </div>

              {/* Active switch */}
              <button
                type="button"
                onClick={() => handleToggleActive(s)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                  s.active ? "bg-emerald-500" : "bg-bone-300"
                }`}
                title={s.active ? "Ocultar slide" : "Activar slide"}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    s.active ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="p-2.5 text-smoke hover:text-ink hover:bg-bone-200 rounded-lg transition-colors"
                  title="Editar slide"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(s)}
                  className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                  title="Eliminar slide"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-obsidian/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-up">
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden w-12 h-1 bg-bone-300 rounded-full mx-auto my-2 shrink-0" />

            {/* Header */}
            <div className="px-6 py-4 border-b border-bone-300 flex items-center justify-between bg-obsidian text-bone shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
                  {editing ? "Edición de Slide" : "Nuevo Slide"}
                </span>
                <h2 className="text-lg font-bold">
                  {editing ? "Editar Slide del Hero" : "Crear Slide del Hero"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 text-smoke hover:text-white rounded-xl bg-ink/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Eyebrow */}
              <div>
                <label className="block font-bold text-ink mb-1">
                  Línea superior (eyebrow / badge)
                </label>
                <input
                  type="text"
                  value={form.eyebrow}
                  onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                  placeholder="Ej: Nuevos ingresos"
                  className={inputCls}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-ink mb-1">Título (multi-línea)</label>
                <textarea
                  rows={3}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={"Ej: Los pares que no\npasan desapercibidos."}
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all"
                />
                <p className="mt-1 text-[10px] text-smoke">Usá Enter para saltar de línea.</p>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block font-bold text-ink mb-1">Subtítulo</label>
                <textarea
                  rows={2}
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Texto corto bajo el título"
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all"
                />
              </div>

              {/* Button text + href */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">Texto del botón</label>
                  <input
                    type="text"
                    value={form.buttonText}
                    onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                    placeholder="Ej: Ver nuevos ingresos"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-bold text-ink mb-1">Link del botón (href)</label>
                  <input
                    type="text"
                    value={form.buttonHref}
                    onChange={(e) => setForm({ ...form, buttonHref: e.target.value })}
                    placeholder="#nuevos"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Align segmented */}
              <div>
                <label className="block font-bold text-ink mb-1">Alineación del texto</label>
                <div className="flex items-center gap-1 bg-bone-200 p-1 rounded-xl min-h-[44px]">
                  {ALIGN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, align: opt.value })}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        form.align === opt.value
                          ? "bg-obsidian text-bone shadow-sm"
                          : "text-smoke hover:text-ink"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active switch */}
              <div className="flex items-center justify-between bg-bone-200/50 p-3 rounded-xl border border-bone-300">
                <div>
                  <p className="font-bold text-ink">Activo en el carrusel</p>
                  <p className="text-[10px] text-smoke">
                    Si está activo, se muestra en la portada
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                    form.active ? "bg-emerald-500" : "bg-bone-300"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                      form.active ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Image */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-bone-300 pb-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600">
                    Imagen de fondo
                  </h3>
                </div>

                {/* Preview */}
                {shownImage ? (
                  <img
                    src={shownImage}
                    alt="Preview slide"
                    className="w-full h-40 object-cover rounded-xl border border-bone-300 bg-bone-200"
                  />
                ) : (
                  <div className="w-full h-32 rounded-xl bg-bone-200 border border-dashed border-bone-300 flex items-center justify-center text-[11px] text-smoke">
                    Sin imagen cargada
                  </div>
                )}

                {/* URL input */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/... o URL externa"
                    className="flex-1 bg-bone-200/60 border border-bone-300 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold-500 transition-all min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-obsidian text-bone hover:bg-ink px-4 py-2 rounded-xl font-bold text-xs shrink-0 min-h-[44px]"
                  >
                    + Agregar URL
                  </button>
                </div>

                {/* Upload directo */}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 border border-dashed border-gold-500/50 rounded-xl px-3 py-2.5 text-xs font-bold text-gold-600 hover:bg-gold-500/5 transition-all min-h-[44px] disabled:opacity-60"
                  >
                    <span>
                      {uploading
                        ? "Subiendo a Cloudinary…"
                        : "⬆ Subir imagen (se guarda en webp)"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-bone-300 bg-bone-200/40 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-3 rounded-xl font-bold text-xs text-smoke hover:text-ink transition-colors min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-gold-500 hover:bg-gold-400 text-obsidian font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 transition-all min-h-[44px] disabled:opacity-60"
              >
                {saving ? "Guardando…" : editing ? "Guardar Cambios" : "Crear Slide"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <h3 className="text-base font-extrabold text-ink">Eliminar Slide</h3>
            </div>

            <p className="text-xs text-smoke leading-relaxed">
              ¿Estás seguro de que deseas eliminar este slide del hero? Esta acción no se puede deshacer.
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