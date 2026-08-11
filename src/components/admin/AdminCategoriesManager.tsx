import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchBrands,
  saveCategory,
  saveBrand,
  type CategoryItem,
  type BrandItem,
} from "../../lib/categoriesService";

export function AdminCategoriesManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [brandName, setBrandName] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);

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
    </div>
  );
}
