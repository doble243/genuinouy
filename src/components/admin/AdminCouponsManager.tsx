import { useEffect, useState } from "react";
import {
  listAdminCoupons,
  saveAdminCoupon,
  type Coupon,
} from "../../lib/coupons";
import { uy } from "../../lib/data";

export function AdminCouponsManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCoupons = async () => {
    const list = await listAdminCoupons();
    setCoupons(list);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Vuelve el formulario al modo de creación (valores por defecto).
  const resetForm = () => {
    setCode("");
    setType("percentage");
    setValue(10);
    setMinPurchase(0);
    setEditingId(null);
  };

  // Carga los valores del cupón seleccionado en el formulario para editarlo.
  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setType(coupon.discount_type);
    setValue(coupon.discount_value);
    setMinPurchase(coupon.min_purchase ?? 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || value <= 0) return;
    setSaving(true);

    if (editingId) {
      // Modo edición: se actualiza el cupón existente y se reemplaza en su
      // misma posición (sin reordenar la lista). Si era un fallback local
      // ("fb-") el servicio lo materializa en la DB con un id real, así que
      // también matcheamos por código para no perder la fila en la lista.
      const existing = coupons.find((c) => c.id === editingId);
      const updated = await saveAdminCoupon({
        id: editingId,
        code: code.trim().toUpperCase(),
        discount_type: type,
        discount_value: value,
        active: existing ? existing.active : true,
        min_purchase: minPurchase > 0 ? minPurchase : undefined,
      });
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingId || c.code === updated.code ? updated : c
        )
      );
    } else {
      // Modo creación: el nuevo cupón se agrega al principio.
      const created = await saveAdminCoupon({
        code: code.trim().toUpperCase(),
        discount_type: type,
        discount_value: value,
        active: true,
        min_purchase: minPurchase > 0 ? minPurchase : undefined,
      });
      setCoupons((prev) => [created, ...prev]);
    }

    resetForm();
    setSaving(false);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    const updated = await saveAdminCoupon({
      ...coupon,
      active: !coupon.active,
    });
    // Match por id o código: si el cupón era un fallback local ("fb-") el
    // servicio lo materializa con un id real y hay que actualizar por código.
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === coupon.id || c.code === updated.code ? updated : c
      )
    );
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-[24px] font-bold text-ink">Motor de Cupones y Descuentos</h1>
        <p className="text-[13px] text-smoke">
          Creá y administrá los códigos promocionales para aplicar descuentos en el checkout.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario de Creación / Edición */}
        <div className="lg:col-span-1 border border-ink/10 bg-white p-6 shadow-sm rounded-sm">
          <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-ink">
            {editingId ? "Editar Cupón" : "Nuevo Cupón"}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-smoke mb-1">
                Código del Cupón
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ej: VERANO2026"
                className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] font-bold uppercase outline-none focus:border-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-smoke mb-1">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "percentage" | "fixed")}
                  className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
                >
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed">Monto Fijo ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-smoke mb-1">
                  Valor
                </label>
                <input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-smoke mb-1">
                Compra Mínima (Opcional)
              </label>
              <input
                type="number"
                min="0"
                value={minPurchase}
                onChange={(e) => setMinPurchase(Number(e.target.value))}
                placeholder="0 para sin mínimo"
                className="w-full border border-ink/15 bg-bone px-3 py-2 text-[13px] outline-none focus:border-ink"
              />
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={saving || !code.trim() || value <= 0}
                className="w-full bg-ink py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-bone hover:bg-obsidian disabled:opacity-50"
              >
                {editingId ? "Guardar Cambios" : "Crear Cupón"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="w-full border border-ink/20 py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink hover:bg-bone disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de Cupones */}
        <div className="lg:col-span-2 border border-ink/10 bg-white p-6 shadow-sm rounded-sm">
          <h2 className="text-[16px] font-bold uppercase tracking-[0.12em] text-ink mb-4">
            Cupones Activos
          </h2>

          <div className="divide-y divide-ink/8 border-y border-ink/8">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="font-bold text-[15px] tracking-wider text-ink">
                    {c.code}
                  </span>
                  <p className="text-[12px] text-smoke">
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}% de descuento`
                      : `${uy(c.discount_value)} de descuento`}
                    {c.min_purchase ? ` · Mínimo: ${uy(c.min_purchase)}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      c.active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {c.active ? "Activo" : "Inactivo"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    disabled={saving}
                    className="text-[11px] font-bold text-ink underline underline-offset-2 hover:text-gold-600 disabled:opacity-40"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCouponStatus(c)}
                    disabled={saving}
                    className="text-[11px] font-bold text-ink underline underline-offset-2 hover:text-gold-600 disabled:opacity-40"
                  >
                    {c.active ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
