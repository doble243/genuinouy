import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type CustomerRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  customer_type: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export function AdminCustomersList() {
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<string>("minorista");
  const [editActive, setEditActive] = useState<boolean>(true);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from("customers")
        .select(
          "id,name,phone,email,address,notes,customer_type,active,created_at,updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(200);
      if (typeFilter) q = q.eq("customer_type", typeFilter);
      const { data, error: err } = await q;
      if (err) throw err;
      setRows((data || []) as CustomerRow[]);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const beginEdit = (r: CustomerRow) => {
    setEditingId(r.id);
    setEditType(r.customer_type);
    setEditActive(r.active);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error: err } = await supabase
      .from("customers")
      .update({ customer_type: editType, active: editActive })
      .eq("id", editingId);
    if (err) {
      setError(err.message);
      return;
    }
    setEditingId(null);
    refresh();
  };

  return (
    <section className="space-y-5">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight">Clientes</h2>
          <p className="text-[13px] text-smoke">
            {loading
              ? "Cargando..."
              : `${rows.length} cliente${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-ink/15 bg-bone px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] outline-none focus:border-ink"
          >
            <option value="">Todos</option>
            <option value="minorista">Minoristas</option>
            <option value="mayorista">Mayoristas</option>
          </select>
          <button
            onClick={refresh}
            className="border border-ink/15 bg-bone px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-ink"
          >
            Refrescar
          </button>
        </div>
      </header>

      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="border border-dashed border-ink/20 px-6 py-12 text-center text-[13px] text-smoke">
          Todavía no hay clientes.
        </div>
      )}

      <div className="overflow-x-auto border border-ink/12 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-ink/12 bg-ink/[0.03] text-[10px] font-bold uppercase tracking-[0.18em] text-smoke">
            <tr>
              <th className="px-3 py-2">Nombre</th>
              <th className="px-3 py-2">WhatsApp</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-ink/8 last:border-b-0 align-top"
              >
                <td className="px-3 py-2">
                  <p className="font-semibold">{r.name}</p>
                  {r.address && (
                    <p className="mt-0.5 text-[11px] text-smoke">
                      {r.address}
                    </p>
                  )}
                </td>
                <td className="px-3 py-2 text-smoke">{r.phone}</td>
                <td className="px-3 py-2 text-smoke">{r.email || "—"}</td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="border border-ink/15 bg-bone px-2 py-1 text-[12px] outline-none focus:border-ink"
                    >
                      <option value="minorista">Minorista</option>
                      <option value="mayorista">Mayorista</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                        r.customer_type === "mayorista"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-ink/5 text-ink/70"
                      }`}
                    >
                      {r.customer_type}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {editingId === r.id ? (
                    <label className="flex items-center gap-2 text-[12px]">
                      <input
                        type="checkbox"
                        checked={editActive}
                        onChange={(e) => setEditActive(e.target.checked)}
                        className="h-4 w-4"
                      />
                      activo
                    </label>
                  ) : (
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        r.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {r.active ? "✓" : "×"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {editingId === r.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke hover:text-ink"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={saveEdit}
                        className="bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-bone hover:bg-obsidian"
                      >
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => beginEdit(r)}
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
