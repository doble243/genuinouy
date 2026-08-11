import { useState, useMemo } from "react";
import type { AdminProduct } from "../../types/admin";
import { uy } from "../../lib/data";

interface AdminProductListProps {
  products: AdminProduct[];
  onEditProduct: (product: AdminProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleStock: (productId: string) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onOpenNewProductModal: () => void;
}

export function AdminProductList({
  products,
  onEditProduct,
  onDeleteProduct,
  onToggleStock,
  onUpdatePrice,
  onOpenNewProductModal,
}: AdminProductListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock" | "lowStock">("all");
  
  // Inline Price Editing State: productId -> price value string
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");

  // Delete modal state
  const [deleteCandidate, setDeleteCandidate] = useState<AdminProduct | null>(null);

  // Extract unique brands list
  const brandList = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Filtered Products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search term matching (Name, Brand, main SKU, Variant SKUs and color names)
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.variants?.some(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            (v.sku && v.sku.toLowerCase().includes(q))
        );

      // Brand matching
      const matchesBrand =
        selectedBrand === "all" || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      // Stock status matching
      const isAvailable = p.inStock !== false && (p.stock === undefined || p.stock > 0);
      const isLowStock = (p.availableQuantity !== undefined && p.availableQuantity > 0 && p.availableQuantity <= 3) ||
        p.variants?.some((v) => v.stock !== undefined && v.stock > 0 && v.stock <= 3);

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "inStock" && isAvailable) ||
        (stockFilter === "outOfStock" && !isAvailable) ||
        (stockFilter === "lowStock" && Boolean(isLowStock));

      return matchesSearch && matchesBrand && matchesStock;
    });
  }, [products, searchTerm, selectedBrand, stockFilter]);

  // Start Inline Price Editing
  const handleStartEditPrice = (p: AdminProduct) => {
    setEditingPriceId(p.id);
    setTempPrice(String(p.price));
  };

  // Save Inline Price Edit
  const handleSavePrice = (id: string) => {
    const numericPrice = parseFloat(tempPrice);
    if (!isNaN(numericPrice) && numericPrice >= 0) {
      onUpdatePrice(id, numericPrice);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Controls Section */}
      <div className="bg-white border border-bone-300 p-4 md:p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-ink tracking-tight">
              Gestión de Catálogo
            </h1>
            <p className="text-xs text-smoke">
              {filteredProducts.length} de {products.length} productos mostrados
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewProductModal}
            className="bg-gold-500 hover:bg-gold-400 text-obsidian font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-gold-500/20 active:scale-95 transition-all self-start sm:self-auto min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Producto
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, marca o SKU..."
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
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-ink p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Stock Filter Tabs */}
          <div className="md:col-span-6 flex items-center gap-1 bg-bone-200 p-1 rounded-xl min-h-[44px]">
            <button
              type="button"
              onClick={() => setStockFilter("all")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                stockFilter === "all"
                  ? "bg-white text-ink shadow-sm"
                  : "text-smoke hover:text-ink"
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("inStock")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                stockFilter === "inStock"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-smoke hover:text-ink"
              }`}
            >
              En Stock
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("outOfStock")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                stockFilter === "outOfStock"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-smoke hover:text-ink"
              }`}
            >
              Agotados
            </button>
            <button
              type="button"
              onClick={() => setStockFilter("lowStock")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                stockFilter === "lowStock"
                  ? "bg-white text-amber-700 shadow-sm"
                  : "text-smoke hover:text-ink"
              }`}
            >
              Bajo Stock
            </button>
          </div>
        </div>

        {/* Brand Horizontal Carousel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-bone-200">
          <button
            type="button"
            onClick={() => setSelectedBrand("all")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
              selectedBrand === "all"
                ? "bg-obsidian text-bone"
                : "bg-bone-200 text-smoke hover:text-ink hover:bg-bone-300"
            }`}
          >
            Todas las Marcas
          </button>
          {brandList.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                selectedBrand.toLowerCase() === brand.toLowerCase()
                  ? "bg-obsidian text-bone"
                  : "bg-bone-200 text-smoke hover:text-ink hover:bg-bone-300"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Content */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-bone-300 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-bone-200 text-smoke flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-ink">No se encontraron productos</h3>
          <p className="text-xs text-smoke max-w-sm mx-auto">
            No hay elementos que coincidan con la búsqueda o filtro seleccionado. Intenta cambiar los criterios de búsqueda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedBrand("all");
              setStockFilter("all");
            }}
            className="text-xs font-bold text-gold-600 hover:underline pt-2 inline-block"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <>
          {/* Mobile Touch-Optimized Cards List (Visible on Mobile < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredProducts.map((p) => {
              const isAvailable = p.inStock !== false && (p.stock === undefined || p.stock > 0);
              const isEditingThisPrice = editingPriceId === p.id;

              return (
                <div
                  key={p.id}
                  className="bg-white border border-bone-300 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative"
                >
                  {/* Top Row: Thumbnail + Details + Stock Switch */}
                  <div className="flex items-start gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover bg-bone-200 shrink-0 border border-bone-300"
                    />

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded">
                          {p.brand}
                        </span>
                        {p.sku && (
                          <span className="text-[10px] text-smoke font-mono bg-bone-200 px-1.5 py-0.5 rounded">
                            {p.sku}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-ink leading-snug line-clamp-2">
                        {p.name}
                      </h3>

                      {/* Talles Preview */}
                      {p.sizes && p.sizes.length > 0 && (
                        <p className="text-[10px] text-smoke">
                          Talles: <span className="font-semibold text-ink">{p.sizes.join(", ")}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle Row: Price Editor & Stock Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-bone-200 bg-bone-200/30 p-2.5 rounded-xl">
                    {/* Inline Price Editor */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-smoke uppercase">Precio:</span>
                      {isEditingThisPrice ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-20 bg-white border border-gold-500 rounded-lg px-2 py-1 text-xs font-bold text-ink focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePrice(p.id)}
                            className="bg-emerald-600 text-white p-1 rounded-lg hover:bg-emerald-700"
                            title="Guardar Precio"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPriceId(null)}
                            className="bg-bone-300 text-smoke p-1 rounded-lg hover:bg-bone-400"
                            title="Cancelar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditPrice(p)}
                          className="flex items-center gap-1 group text-xs font-black text-ink hover:text-gold-600 transition-colors"
                          title="Click para editar precio"
                        >
                          <span>{uy(p.price)}</span>
                          <svg className="w-3 h-3 text-smoke group-hover:text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Stock Switch Toggle */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${isAvailable ? "text-emerald-700" : "text-rose-600"}`}>
                        {isAvailable ? "Disponible" : "Agotado"}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleStock(p.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none min-h-[44px] min-w-[44px] justify-center ${
                          isAvailable ? "bg-emerald-500" : "bg-bone-300"
                        }`}
                        aria-label="Toggle Stock Availability"
                      >
                        <span
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                            isAvailable ? "translate-x-2.5" : "-translate-x-2.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Actions Row with Touch Targets (min 44px) */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEditProduct(p)}
                      className="flex-1 bg-obsidian text-bone hover:bg-ink text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
                    >
                      <svg className="w-4 h-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Detalle
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(p)}
                      className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Eliminar Producto"
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

          {/* Desktop Data Table (Visible on Desktop >= md) */}
          <div className="hidden md:block bg-white border border-bone-300 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bone-200/80 border-b border-bone-300 text-[10px] font-extrabold uppercase tracking-wider text-smoke">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Marca</th>
                  <th className="py-3.5 px-4">Talles</th>
                  <th className="py-3.5 px-4">Precio ($ UYU)</th>
                  <th className="py-3.5 px-4 text-center">Estado Stock</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-200 text-xs">
                {filteredProducts.map((p) => {
                  const isAvailable = p.inStock !== false && (p.stock === undefined || p.stock > 0);
                  const isEditingThisPrice = editingPriceId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-bone-200/40 transition-colors group">
                      {/* Producto Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-lg object-cover bg-bone-200 shrink-0 border border-bone-300"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-ink truncate group-hover:text-gold-600 transition-colors">
                              {p.name}
                            </h4>
                            <p className="text-[10px] text-smoke font-mono">
                              SKU: {p.sku || p.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Marca Column */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded text-[11px]">
                          {p.brand}
                        </span>
                      </td>

                      {/* Talles Column */}
                      <td className="py-3 px-4 text-smoke max-w-[160px] truncate">
                        {p.sizes && p.sizes.length > 0 ? (
                          <span className="font-semibold text-ink">{p.sizes.join(", ")}</span>
                        ) : (
                          "-"
                        )}
                      </td>

                      {/* Precio Column with Inline Editor */}
                      <td className="py-3 px-4 font-bold">
                        {isEditingThisPrice ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(e.target.value)}
                              className="w-24 bg-white border border-gold-500 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSavePrice(p.id)}
                              className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700"
                              title="Guardar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="bg-bone-300 text-smoke p-1 rounded hover:bg-bone-400"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEditPrice(p)}
                            className="flex items-center gap-1 text-ink hover:text-gold-600 transition-colors"
                            title="Click para editar precio rápido"
                          >
                            <span>{uy(p.price)}</span>
                            <svg className="w-3 h-3 text-smoke opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </td>

                      {/* Stock Switch Toggle Column */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleStock(p.id)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                              isAvailable ? "bg-emerald-500" : "bg-bone-300"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                                isAvailable ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold ${isAvailable ? "text-emerald-700" : "text-rose-600"}`}>
                            {isAvailable ? "En Stock" : "Agotado"}
                          </span>
                        </div>
                      </td>

                      {/* Acciones Column */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-smoke hover:text-ink hover:bg-bone-200 rounded-lg transition-colors"
                            title="Editar Producto"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar Producto"
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
              <h3 className="text-base font-extrabold text-ink">Eliminar Producto</h3>
            </div>

            <p className="text-xs text-smoke leading-relaxed">
              ¿Estás seguro de que deseas eliminar{" "}
              <strong className="text-ink">{deleteCandidate.name}</strong> del catálogo? Esta acción no se puede deshacer.
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
                onClick={() => {
                  onDeleteProduct(deleteCandidate.id);
                  setDeleteCandidate(null);
                }}
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
