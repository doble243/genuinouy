import { useEffect, useMemo, useState } from "react";
import {
  fetchCategories,
  fetchBrands,
  saveCategory,
  saveBrand,
  type CategoryItem,
  type BrandItem,
} from "../../lib/categoriesService";
import { useStore } from "../../lib/store";

export function AdminCategoriesManager() {
  const { products } = useStore();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [brandName, setBrandName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

  // Marcas reales: valores únicos no vacíos de `brand` en los productos cargados.
  const catalogBrands = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))
    ).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Categorías reales (modelos): valores únicos no vacíos de `category` en los
  // productos cargados, excluyendo el flag "Nuevos Ingresos". Se conservan TODOS
  // los demás valores (incluso si coinciden con marcas, ej. "Adidas") — esta es
  // la vista admin del catálogo real, no el filtro de la tienda.
  const catalogCategories = useMemo(() => {
    return Array.from(
      new Set(
        products.map((p) => p.category).filter((c): c is string => Boolean(c))
      )
    )
      .filter((c) => c !== "Nuevos Ingresos")
      .sort((a, b) => a.localeCompare(b));
  }, [products]);

  const loadData = async () => {
    const cats = await fetchCategories();
    const brs = await fetchBrands();
    setCategories(cats);
    setBrands(brs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    const created = await saveCategory({ name: catName.trim(), description: catDesc.trim() });
    setCategories((prev) => [...prev, created]);
    setCatName("");
    setCatDesc("");
    setSavingCat(false);
  };

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setSavingBrand(true);
    const created = await saveBrand({ name: brandName.trim(), slug: brandName.toLowerCase().replace(/\s+/g, "-") });
    setBrands((prev) => [...prev, created]);
    setBrandName("");
    setSavingBrand(false);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-[24px] font-bold text-ink">Gestión de Categorías y Marcas</h1>
        <p className="text-[13px] text-smoke">
          Administrá las categorías y marcas disponibles en el catálogo de tu tienda.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sección Categorías */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-ink">
            Categorías
          </h2>

          <form onSubmit={handleAddCategory} className="mt-4 space-y-3">
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Nombre de categoría (ej: Calzados)"
              className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Descripción corta (opcional)"
              className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={savingCat || !catName.trim()}
              className="bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-bone hover:bg-obsidian disabled:opacity-50"
            >
              Agregar Categoría
            </button>
          </form>

          <div className="mt-6 divide-y divide-ink/8 border-t border-ink/8 pt-2">
            {categories.map((c) => (
              <div key={c.id} className="py-3">
                <span className="font-semibold text-[14px]">{c.name}</span>
                {c.description && (
                  <p className="text-[12px] text-smoke">{c.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sección Marcas */}
        <div className="rounded-sm border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-ink">
            Marcas
          </h2>

          <form onSubmit={handleAddBrand} className="mt-4 flex gap-2">
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Nombre de marca (ej: Nike)"
              className="flex-1 border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={savingBrand || !brandName.trim()}
              className="bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-bone hover:bg-obsidian disabled:opacity-50"
            >
              Agregar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {brands.map((b) => (
              <span
                key={b.id}
                className="border border-ink/15 bg-bone px-3 py-1.5 text-[12px] font-semibold"
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Catálogo real derivado de los productos cargados en la tienda */}
      <div className="rounded-sm border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-ink">
          Catálogo real
        </h2>
        <p className="mt-1 text-[12px] text-smoke">
          Derivado de los productos cargados — no editable acá.
        </p>

        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-smoke">
              Categorías del catálogo ({catalogCategories.length})
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {catalogCategories.length === 0 ? (
                <p className="text-[12px] text-smoke">
                  No hay categorías en los productos cargados.
                </p>
              ) : (
                catalogCategories.map((c) => (
                  <span
                    key={c}
                    className="border border-ink/10 bg-bone-200/60 px-3 py-1.5 text-[12px] font-semibold text-smoke"
                  >
                    {c}
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-smoke">
              Marcas del catálogo ({catalogBrands.length})
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {catalogBrands.length === 0 ? (
                <p className="text-[12px] text-smoke">
                  No hay marcas en los productos cargados.
                </p>
              ) : (
                catalogBrands.map((b) => (
                  <span
                    key={b}
                    className="border border-ink/10 bg-bone-200/60 px-3 py-1.5 text-[12px] font-semibold text-smoke"
                  >
                    {b}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
