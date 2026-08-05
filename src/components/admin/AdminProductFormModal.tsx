import { useState, useEffect, useRef } from "react";
import type { AdminProduct } from "../../types/admin";
import { brands as brandOptions } from "../../lib/data";
import { uploadImageToCloudinary } from "../../lib/cloudinary";

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
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImages([
        "https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=900",
      ]);
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

  // Image addition helper
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
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

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericPrice = parseFloat(price) || 0;
    const numericCompareAt = compareAt ? parseFloat(compareAt) : undefined;
    const finalBrand = brand === "Otro" ? customBrand || "Marca GENUINOS" : brand;

    const primaryImg = images[0] || "https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg";
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

            {/* Add New Image Input */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.pexels.com/..."
                className="flex-1 bg-bone-200/60 border border-bone-300 rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-gold-500 transition-all min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="bg-obsidian text-bone hover:bg-ink px-4 py-2 rounded-xl font-bold text-xs shrink-0 min-h-[44px]"
              >
                + Agregar URL
              </button>
            </div>

            {/* Upload directo a Cloudinary (webp automático) */}
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
