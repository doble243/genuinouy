import { useState, useEffect, useRef, type ChangeEvent } from "react";
import type { AdminProduct } from "../../types/admin";
import { brands as brandOptions } from "../../lib/data";
import type { ProductVariant } from "../../lib/data";
import { cdnUrl, uploadImageToCloudinary } from "../../lib/cloudinary";
import {
  isDuplicateColor,
  buildColorVariant,
  updateVariantImage,
} from "../../lib/variantUtils";

const FALLBACK_IMG = cdnUrl("genuinos/assets/cat_shoes", "f_auto,q_auto");

interface AdminProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<AdminProduct>) => void;
  initialProduct?: AdminProduct | null;
}

const COMMON_SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];
const COMMON_APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORY_OPTIONS = [
  "Calzado",
  "Indumentaria",
  "Nuevos Ingresos",
  "Mas Vendidos",
  "Ofertas",
  "Retro Running",
  "Accesorios",
];
const GENDER_OPTIONS = ["Unisex", "Hombre", "Mujer", "Niños"];

export function AdminProductFormModal({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}: AdminProductFormModalProps) {
  // Form State
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Nike");
  const [customBrand, setCustomBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState<string>("");
  const [compareAt, setCompareAt] = useState<string>("");
  const [category, setCategory] = useState("Calzado");
  const [gender, setGender] = useState("Unisex");
  const [stockQty, setStockQty] = useState<number>(10);
  const [inStock, setInStock] = useState<boolean>(true);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["39", "40", "41", "42"]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants state — quick-add color editor. The editor stays visible across
  // additions so the admin can drop several colors in a row without clicking
  // an "Agregar variante" button to reopen it.
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colorInput, setColorInput] = useState<string>("");
  const [variantStockInput, setVariantStockInput] = useState<number>(1);
  const [variantImageInput, setVariantImageInput] = useState<string | null>(null);
  const [variantImagePicker, setVariantImagePicker] = useState<"gallery" | "upload">("gallery");
  const [variantError, setVariantError] = useState<string | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  // Per-existing-row photo picker. Only one variant row can have its picker
  // expanded at a time; the activePhotoVariantId identifies it, and the picker
  // is reset on modal init / close.
  const [activePhotoVariantId, setActivePhotoVariantId] = useState<string | null>(null);
  const [existingVariantPickerMode, setExistingVariantPickerMode] = useState<
    "gallery" | "upload"
  >("gallery");
  const existingVariantFileInputRef = useRef<HTMLInputElement>(null);
  const [existingVariantUploading, setExistingVariantUploading] = useState(false);

  const isEditing = Boolean(initialProduct);

  // Initialize form when opened or initialProduct changes
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || "");
      setBrand(initialProduct.brand || "Nike");
      setSku(initialProduct.sku || `SKU-${initialProduct.id}`);
      setPrice(initialProduct.price ? String(initialProduct.price) : "");
      setCompareAt(initialProduct.compareAt ? String(initialProduct.compareAt) : "");
      setCategory(initialProduct.category || "Calzado");
      setGender(initialProduct.gender || "Unisex");
      setStockQty(initialProduct.stock ?? 10);
      setInStock(initialProduct.inStock !== false);
      setSelectedSizes(initialProduct.sizes || ["39", "40", "41", "42"]);

      const imgList = initialProduct.images || [initialProduct.image];
      if (initialProduct.hover && !imgList.includes(initialProduct.hover)) {
        imgList.push(initialProduct.hover);
      }
      setImages(imgList.filter(Boolean));

      setVariants(
        Array.isArray(initialProduct.variants) ? initialProduct.variants : [],
      );
      setColorInput("");
      setVariantStockInput(1);
      setVariantImageInput(null);
      setVariantImagePicker("gallery");
      setVariantError(null);
      setActivePhotoVariantId(null);
      setExistingVariantPickerMode("gallery");
      setExistingVariantUploading(false);
    } else {
      // Default reset for new product
      setName("");
      setBrand("Nike");
      setCustomBrand("");
      setSku(`GEN-${Math.floor(100000 + Math.random() * 900000)}`);
      setPrice("");
      setCompareAt("");
      setCategory("Calzado");
      setGender("Unisex");
      setStockQty(10);
      setInStock(true);
      setSelectedSizes(["39", "40", "41", "42"]);
      setImages([]);
      setVariants([]);
      setColorInput("");
      setVariantStockInput(1);
      setVariantImageInput(null);
      setVariantImagePicker("gallery");
      setVariantError(null);
      setActivePhotoVariantId(null);
      setExistingVariantPickerMode("gallery");
      setExistingVariantUploading(false);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  // Auto-generate SKU Helper
  const handleAutoGenerateSku = () => {
    const brandPrefix = (brand === "Otro" ? customBrand : brand)
      .slice(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, "X");
    const namePrefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "P") || "PRD";
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSku(`${brandPrefix}-${namePrefix}-${randomNum}`);
  };

  // Size toggle helper
  const handleToggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Upload a file directly to Cloudinary (unsigned preset, forces webp).
  const handleFileUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setImages((prev) => [...prev, url]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      alert("No se pudo subir la imagen a Cloudinary. Revisá tu conexión y probá de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  // Image remove helper
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Make primary image
  const handleMakePrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [target] = copy.splice(index, 1);
      return [target, ...copy];
    });
  };

  // Variants — quick-add helpers (color is the initial variant type).
  const resetVariantEditor = () => {
    setColorInput("");
    setVariantStockInput(1);
    setVariantImageInput(null);
    setVariantImagePicker("gallery");
    setVariantError(null);
  };

  const handleAddColor = () => {
    const trimmed = colorInput.trim();
    if (!trimmed) {
      setVariantError("Escribí el nombre del color para agregarlo.");
      return;
    }
    if (isDuplicateColor(variants, trimmed)) {
      setVariantError(`Ya cargaste "${trimmed}". Elegí un color distinto.`);
      return;
    }
    const newVariant = buildColorVariant({
      color: trimmed,
      productSku: sku,
      image: variantImageInput,
      stock: variantStockInput,
    });
    setVariants((prev) => [...prev, newVariant]);
    // Reset the quick-add editor to a fresh blank color so another color can
    // be added without closing/reopening the editor.
    resetVariantEditor();
  };

  const handleVariantColorInputChange = (value: string) => {
    setColorInput(value);
    if (variantError) setVariantError(null);
  };

  const handleUpdateVariantStock = (variantId: string, stock: number) => {
    const clamped = Math.max(0, Math.floor(stock || 0));
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, stock: clamped, in_stock: clamped > 0 ? v.in_stock !== false : false }
          : v,
      ),
    );
  };

  // Per-existing-row photo picker handlers. Only one row can be expanded at a
  // time; clicking the same row's toggle closes the picker, clicking another
  // row's toggle switches to that row. While an upload is in flight we MUST
  // not let another row's picker open or switch — the original row's input
  // element is captured by the upload handler so cleanup never hits the
  // wrong file input.
  const handleTogglePhotoPicker = (variantId: string) => {
    if (existingVariantUploading) return;
    if (activePhotoVariantId === variantId) {
      setActivePhotoVariantId(null);
      setExistingVariantPickerMode("gallery");
    } else {
      setActivePhotoVariantId(variantId);
      setExistingVariantPickerMode("gallery");
    }
  };

  const handlePickExistingVariantGalleryImage = (
    variantId: string,
    url: string,
  ) => {
    setVariants((prev) => updateVariantImage(prev, variantId, url));
    setActivePhotoVariantId(null);
    setExistingVariantPickerMode("gallery");
  };

  const handleUploadExistingVariantImage = async (
    variantId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    // Capture the originating input element BEFORE awaiting. The shared
    // existingVariantFileInputRef can re-point at a different row's input
    // while the upload is in flight (the ref is only attached to the
    // currently-open row's input), so reading the ref in `finally` would
    // clear the wrong file input. The captured element is the one that
    // actually held the file the user selected.
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setExistingVariantUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setVariants((prev) => updateVariantImage(prev, variantId, url));
      // Reuse: add the uploaded URL to the product gallery so the admin can
      // assign it to other variants later.
      setImages((prev) => (prev.includes(url) ? prev : [url, ...prev]));
      // Only close the active row's picker if THIS row is still the active
      // one — a different row's picker may have been opened mid-upload
      // (defense in depth: the toggle is guarded, but the state updater
      // here also refuses to close a different row).
      setActivePhotoVariantId((current) =>
        current === variantId ? null : current,
      );
      setExistingVariantPickerMode("gallery");
    } catch (err) {
      console.error("Existing variant image upload failed:", err);
      alert("No se pudo subir la imagen a Cloudinary.");
    } finally {
      input.value = "";
      setExistingVariantUploading(false);
    }
  };

  const handleRemoveExistingVariantImage = (variantId: string) => {
    setVariants((prev) => updateVariantImage(prev, variantId, null));
    setActivePhotoVariantId(null);
    setExistingVariantPickerMode("gallery");
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericPrice = parseFloat(price) || 0;
    const numericCompareAt = compareAt ? parseFloat(compareAt) : undefined;
    const finalBrand = brand === "Otro" ? customBrand || "Marca GENUINOS" : brand;

    const primaryImg = images[0] || FALLBACK_IMG;
    const hoverImg = images[1] || primaryImg;

    const productPayload: Partial<AdminProduct> = {
      ...(initialProduct ? { id: initialProduct.id } : {}),
      name: name.trim() || "Producto Sin Nombre",
      brand: finalBrand,
      sku: sku.trim(),
      price: numericPrice,
      compareAt: numericCompareAt,
      category,
      gender,
      stock: stockQty,
      inStock,
      sizes: selectedSizes,
      image: primaryImg,
      hover: hoverImg,
      images,
      variants,
    };

    onSave(productPayload);
    onClose();
  };

  const activeSizeList = category === "Indumentaria" ? COMMON_APPAREL_SIZES : COMMON_SHOE_SIZES;

  return (
    <div className="fixed inset-0 bg-obsidian/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Mobile Drawer / Desktop Centered Card */}
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden animate-slide-up sm:animate-scale-up">
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden w-12 h-1 bg-bone-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-bone-300 flex items-center justify-between bg-obsidian text-bone shrink-0">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold-400">
              {isEditing ? "Edición de Catálogo" : "Nuevo Ingreso"}
            </span>
            <h2 className="text-lg font-bold">
              {isEditing ? `Editar: ${initialProduct?.name}` : "Crear Producto"}
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

        {/* Form Body Scrollable */}
        <form id="admin-product-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600 border-b border-bone-300 pb-1">
              1. Información Principal
            </h3>

            {/* Name */}
            <div>
              <label className="block font-bold text-ink mb-1">
                Nombre del Producto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Air Jordan 1 Retro Low OG"
                className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
              />
            </div>

            {/* Brand & Custom Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink mb-1">Marca</label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                >
                  {brandOptions.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Otro">Otra Marca Custom...</option>
                </select>
              </div>

              {brand === "Otro" && (
                <div>
                  <label className="block font-bold text-ink mb-1">Especifique Marca</label>
                  <input
                    type="text"
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    placeholder="Ej: Yeezy / Off-White"
                    className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                  />
                </div>
              )}

              {/* SKU */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-ink">Código SKU</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSku}
                    className="text-[10px] font-bold text-gold-600 hover:underline"
                  >
                    Auto-Generar
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="Ej: JOR-AJ1-8392"
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-mono font-bold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600 border-b border-bone-300 pb-1">
              2. Precios e Inventario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Price */}
              <div>
                <label className="block font-bold text-ink mb-1">
                  Precio ($ UYU) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="8990"
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-extrabold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                />
              </div>

              {/* CompareAt */}
              <div>
                <label className="block font-bold text-ink mb-1">
                  Precio Oferta/Tachado ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={compareAt}
                  onChange={(e) => setCompareAt(e.target.value)}
                  placeholder="10990"
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-bold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block font-bold text-ink mb-1">Cantidad Stock</label>
                <input
                  type="number"
                  min="0"
                  value={stockQty}
                  onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-bold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* In Stock Switch */}
            <div className="flex items-center justify-between bg-bone-200/50 p-3 rounded-xl border border-bone-300">
              <div>
                <p className="font-bold text-ink">Disponible en Tienda</p>
                <p className="text-[10px] text-smoke">Determina si los clientes pueden comprar este ítem</p>
              </div>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
                  inStock ? "bg-emerald-500" : "bg-bone-300"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    inStock ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Categories & Gender */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600 border-b border-bone-300 pb-1">
              3. Categoría & Clasificación
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-ink mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bone-200/60 border border-bone-300 rounded-xl px-3.5 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-gold-500 focus:bg-white transition-all min-h-[44px]"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">Género</label>
                <div className="flex items-center gap-1 bg-bone-200 p-1 rounded-xl min-h-[44px]">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                        gender === g
                          ? "bg-obsidian text-bone shadow-sm"
                          : "text-smoke hover:text-ink"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Sizes Multi-Select */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-bone-300 pb-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600">
                4. Talles Disponibles
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSizes([...activeSizeList])}
                  className="text-[10px] font-bold text-gold-600 hover:underline"
                >
                  Seleccionar Todos
                </button>
                <span className="text-smoke">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedSizes([])}
                  className="text-[10px] font-bold text-smoke hover:underline"
                >
                  Limpiar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeSizeList.map((sz) => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => handleToggleSize(sz)}
                    className={`min-w-[44px] min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                      isSelected
                        ? "bg-obsidian text-gold-400 border-obsidian shadow-sm scale-105"
                        : "bg-bone-200/70 text-ink border-bone-300 hover:bg-bone-300"
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Image URLs Manager */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600 border-b border-bone-300 pb-1">
              5. Galería de Imágenes
            </h3>

            {/* Image URLs list & thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-bone-200 border border-bone-300 aspect-square">
                  <img
                    src={imgUrl}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-gold-500 text-obsidian text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                      Principal
                    </span>
                  )}
                  <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-1">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleMakePrimaryImage(idx)}
                        className="bg-gold-500 text-obsidian p-1.5 rounded-lg text-[10px] font-bold"
                        title="Hacer Principal"
                      >
                        ★
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="bg-rose-600 text-white p-1.5 rounded-lg text-[10px] font-bold"
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload directo a Cloudinary (webp automático) — única vía de subida */} 
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
                {uploading ? "Subiendo a Cloudinary…" : "⬆ Subir imagen (se guarda en webp)"}
              </button>
            </div>
          </div>

          {/* Section 6: Variantes — quick-add color editor. The editor stays
              visible across additions so the admin can drop several colors in
              a row without reopening the form. Type is always "color"; label
              and SKU are derived from the trimmed color value. */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-bone-300 pb-1">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-600">
                6. Variantes
              </h3>
              <span className="text-[10px] text-smoke">
                {variants.length} cargada{variants.length === 1 ? "" : "s"}
              </span>
            </div>

            {variants.length === 0 && (
              <div className="border border-dashed border-bone-300 px-4 py-6 text-center text-[12px] text-smoke">
                Sin variantes todavía. Escribí un color abajo y presioná
                <span className="font-bold"> + Agregar color </span>
                para sumar uno a la vez. Si el producto tiene una sola
                presentación, podés dejar la lista vacía y trabajar solo con la
                galería.
              </div>
            )}

            {variants.length > 0 && (
              <ul className="space-y-2">
                {variants.map((v) => {
                  const hasImage = Boolean(v.image);
                  const isPhotoPickerOpen = activePhotoVariantId === v.id;
                  return (
                    <li
                      key={v.id}
                      className="border border-bone-300 bg-bone-200/40 p-3 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-14 shrink-0 bg-bone-300 overflow-hidden rounded-lg border border-bone-300">
                          {v.image ? (
                            <img
                              src={v.image}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[10px] text-smoke">
                              sin foto
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center bg-ink text-bone px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em]">
                              {v.type === "size"
                                ? "Talle"
                                : v.type === "color"
                                  ? "Color"
                                  : "Otro"}
                            </span>
                            <span className="truncate text-[13px] font-bold">{v.label}</span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-smoke">
                            valor: <span className="font-mono">{v.value}</span>
                            {v.sku ? <> · SKU: <span className="font-mono">{v.sku}</span></> : null}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-smoke">
                              stock
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={v.stock ?? 0}
                              onChange={(e) =>
                                handleUpdateVariantStock(v.id, parseInt(e.target.value) || 0)
                              }
                              aria-label={`Stock de ${v.label}`}
                              className="w-16 border border-bone-300 rounded-md px-2 py-1 text-[11px] font-bold bg-white text-ink"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setVariants((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? { ...x, in_stock: !(x.in_stock ?? true) }
                                    : x,
                                ),
                              );
                            }}
                            title={v.in_stock === false ? "Reactivar" : "Marcar agotado"}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                              (v.in_stock ?? true)
                                ? "bg-emerald-500"
                                : "bg-bone-300"
                            }`}
                          >
                            <span
                              className={`block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform ${
                                (v.in_stock ?? true) ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            disabled={existingVariantUploading}
                            onClick={() => handleTogglePhotoPicker(v.id)}
                            aria-label={hasImage ? "Cambiar foto" : "Asignar foto"}
                            className="bg-obsidian text-bone px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-ink disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {hasImage ? "Cambiar foto" : "Asignar foto"}
                          </button>
                          {hasImage && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingVariantImage(v.id)}
                              aria-label="Quitar foto"
                              className="bg-rose-600 text-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-rose-700"
                            >
                              Quitar foto
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setVariants((prev) => prev.filter((x) => x.id !== v.id))
                            }
                            aria-label="Quitar variante"
                            className="bg-rose-600 text-white px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] hover:bg-rose-700"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>

                      {/* Inline photo picker — only expanded for the active row. */}
                      {isPhotoPickerOpen && (
                        <div className="border-t border-bone-300 pt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExistingVariantPickerMode("gallery")}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                existingVariantPickerMode === "gallery"
                                  ? "bg-obsidian text-bone"
                                  : "bg-bone-200 text-ink hover:bg-bone-300"
                              }`}
                            >
                              De la galería
                            </button>
                            <button
                              type="button"
                              onClick={() => setExistingVariantPickerMode("upload")}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                                existingVariantPickerMode === "upload"
                                  ? "bg-obsidian text-bone"
                                  : "bg-bone-200 text-ink hover:bg-bone-300"
                              }`}
                            >
                              Subir nueva
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePhotoPicker(v.id)}
                              className="ml-auto text-[10px] font-bold text-smoke hover:text-ink uppercase tracking-[0.14em]"
                            >
                              Cerrar
                            </button>
                          </div>

                          {existingVariantPickerMode === "gallery" ? (
                            images.length > 0 ? (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {images.map((imgUrl, idx) => (
                                  <button
                                    key={`${v.id}-${imgUrl}-${idx}`}
                                    type="button"
                                    onClick={() =>
                                      handlePickExistingVariantGalleryImage(v.id, imgUrl)
                                    }
                                    className="relative aspect-square overflow-hidden rounded-lg border-2 border-bone-300 hover:border-ink/40 transition-all"
                                    title="Usar como foto de variante"
                                  >
                                    <img
                                      src={imgUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="border border-dashed border-bone-300 px-3 py-3 text-center text-[11px] text-smoke">
                                Subí primero imágenes en la sección 5 (galería) y volvé acá.
                              </div>
                            )
                          ) : (
                            <div>
                              <input
                                ref={existingVariantFileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/avif"
                                onChange={(e) =>
                                  handleUploadExistingVariantImage(v.id, e)
                                }
                                className="hidden"
                              />
                              <button
                                type="button"
                                disabled={existingVariantUploading}
                                onClick={() => existingVariantFileInputRef.current?.click()}
                                className="w-full border border-dashed border-gold-500/50 rounded-lg px-3 py-2 text-[11px] font-bold text-gold-600 hover:bg-gold-500/5 disabled:opacity-60"
                              >
                                {existingVariantUploading
                                  ? "Subiendo a Cloudinary…"
                                  : "⬆ Subir foto de la variante (webp automático)"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Quick-add color editor — always visible, resets to blank after
                each successful addition so multiple colors can be added in a
                row without reopening anything. */}
            <div className="border border-gold-500/40 bg-gold-50/40 p-3 space-y-3 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr,140px] gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-smoke mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => handleVariantColorInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="Ej: Negro mate"
                    aria-label="Nuevo color"
                    className="w-full border border-bone-300 rounded-lg px-2.5 py-2 text-[12px] font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-smoke mb-1">
                    Stock (opcional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variantStockInput}
                    onChange={(e) =>
                      setVariantStockInput(Math.max(0, parseInt(e.target.value) || 0))
                    }
                    className="w-full border border-bone-300 rounded-lg px-2.5 py-2 text-[12px] font-bold bg-white"
                  />
                </div>
              </div>

              {/* Image picker for the variant */}
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVariantImagePicker("gallery")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      variantImagePicker === "gallery"
                        ? "bg-obsidian text-bone"
                        : "bg-bone-200 text-ink hover:bg-bone-300"
                    }`}
                  >
                    De la galería
                  </button>
                  <button
                    type="button"
                    onClick={() => setVariantImagePicker("upload")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      variantImagePicker === "upload"
                        ? "bg-obsidian text-bone"
                        : "bg-bone-200 text-ink hover:bg-bone-300"
                    }`}
                  >
                    Subir nueva
                  </button>
                  {variantImageInput && (
                    <button
                      type="button"
                      onClick={() => setVariantImageInput(null)}
                      className="ml-auto text-[10px] font-bold text-rose-600 hover:underline"
                    >
                      Quitar imagen
                    </button>
                  )}
                </div>

                {variantImageInput && (
                  <div className="mb-2 flex items-center gap-2 rounded-lg border border-bone-300 bg-white p-2">
                    <img
                      src={variantImageInput}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover border border-bone-300"
                      loading="lazy"
                    />
                    <span className="truncate text-[11px] text-smoke">
                      {variantImageInput}
                    </span>
                  </div>
                )}

                {variantImagePicker === "gallery" ? (
                  images.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {images.map((imgUrl, idx) => {
                        const selected = variantImageInput === imgUrl;
                        return (
                          <button
                            key={`${imgUrl}-${idx}`}
                            type="button"
                            onClick={() => setVariantImageInput(imgUrl)}
                            className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                              selected
                                ? "border-gold-500 ring-2 ring-gold-500/40"
                                : "border-bone-300 hover:border-ink/40"
                            }`}
                            title="Usar como foto de variante"
                          >
                            <img
                              src={imgUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            {selected && (
                              <span className="absolute inset-0 grid place-items-center bg-gold-500/30 text-[18px] text-obsidian font-black">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-bone-300 px-3 py-3 text-center text-[11px] text-smoke">
                      Subí primero imágenes en la sección 5 (galería) y volvé acá.
                    </div>
                  )
                ) : (
                  <div>
                    <input
                      ref={variantFileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const url = await uploadImageToCloudinary(file);
                          setVariantImageInput(url);
                          // also add to the gallery so the user can reuse it
                          setImages((prev) =>
                            prev.includes(url) ? prev : [url, ...prev],
                          );
                        } catch (err) {
                          console.error("Variant image upload failed:", err);
                          alert("No se pudo subir la imagen a Cloudinary.");
                        } finally {
                          if (variantFileInputRef.current)
                            variantFileInputRef.current.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => variantFileInputRef.current?.click()}
                      className="w-full border border-dashed border-gold-500/50 rounded-lg px-3 py-2 text-[11px] font-bold text-gold-600 hover:bg-gold-500/5"
                    >
                      ⬆ Subir foto de la variante (webp automático)
                    </button>
                  </div>
                )}
              </div>

              {variantError && (
                <p
                  role="alert"
                  className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5"
                >
                  {variantError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetVariantEditor}
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-smoke hover:text-ink"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="bg-gold-500 hover:bg-gold-400 text-obsidian text-[10px] font-bold uppercase tracking-[0.14em] px-4 py-2 rounded-lg"
                >
                  + Agregar color
                </button>
              </div>
            </div>

            <p className="text-[10.5px] text-smoke leading-relaxed">
              Las variantes conviven con los talles generales. El SKU del color
              se arma solo a partir del SKU del producto y del nombre del color
              (por ejemplo <span className="font-mono">GEN-123456-NEGRO-MATE</span>).
              Si no elegís foto, la tienda usa la del producto como fallback.
            </p>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-4 border-t border-bone-300 bg-bone-200/40 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-bold text-xs text-smoke hover:text-ink transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="admin-product-form"
            className="bg-gold-500 hover:bg-gold-400 text-obsidian font-extrabold text-xs px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20 active:scale-95 transition-all min-h-[44px]"
          >
            {isEditing ? "Guardar Cambios" : "Crear Producto"}
          </button>
        </div>
      </div>
    </div>
  );
}
