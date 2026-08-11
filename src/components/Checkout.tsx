import { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { uy } from "../lib/data";
import { submitOrder, type SubmitOrderResult } from "../lib/orders";
import {
  writeCustomerSession,
  type CustomerSnapshot,
} from "../lib/customerSession";
import { sendCustomerMagicLink } from "../lib/auth-customer";
import { validateCoupon, calculateDiscount, type Coupon } from "../lib/coupons";
import { OrderSuccess } from "./OrderSuccess";
import { Arrow, Close, Minus, Plus } from "./ui";

type FieldKey = "name" | "phone" | "email" | "address" | "notes";
type FormState = Record<FieldKey, string>;

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

const PHONE_REGEX = /^[+()\d\s-]{8,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildLineInputs(
  lines: ReturnType<typeof useStore>["lines"],
) {
  const groups = new Map<
    string,
    {
      productId: string;
      quantity: number;
      unitType: string;
      variant?: { id: string; label: string; image?: string };
    }
  >();
  for (const l of lines) {
    const productId = l.product.id;
    const groupKey = l.variant
      ? `${productId}::v:${l.variant.id}`
      : `${productId}::s:${l.size}`;
    const existing = groups.get(groupKey);
    if (existing) {
      existing.quantity += l.qty;
    } else {
      groups.set(groupKey, {
        productId,
        quantity: l.qty,
        unitType: l.variant ? l.variant.label : `talle ${l.size}`,
        variant: l.variant
          ? {
              id: l.variant.id,
              label: l.variant.label,
              image: l.variant.image || undefined,
            }
          : undefined,
      });
    }
  }
  return Array.from(groups.values());
}

export function Checkout({ onExit }: { onExit: () => void }) {
  const { lines, setQty, remove, total, notify } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitOrderResult | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Cupón de descuento
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const discountAmount = calculateDiscount(total, appliedCoupon);
  const finalTotal = Math.max(0, total - discountAmount);

  const lineInputs = useMemo(() => buildLineInputs(lines), [lines]);

  // Autofill email si el cliente ya está autenticado
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { getCustomerAuthEmail } = await import("../lib/auth-customer");
      const email = await getCustomerAuthEmail();
      if (email && !cancelled) {
        setForm((prev) => (prev.email ? prev : { ...prev, email }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (k: FieldKey, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const nameClean = form.name.trim();
  const phoneClean = form.phone.replace(/\s/g, "");
  const emailClean = form.email.trim();

  // El email es AHORA OBLIGATORIO para realizar el seguimiento del pedido
  const canSubmit =
    !!nameClean &&
    PHONE_REGEX.test(phoneClean) &&
    EMAIL_REGEX.test(emailClean) &&
    form.address.trim().length >= 5 &&
    !submitting &&
    lineInputs.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);

    const res = await submitOrder({
      customer: {
        name: nameClean,
        phone: phoneClean,
        email: emailClean,
        address: form.address.trim(),
        notes: form.notes.trim() || undefined,
      },
      lines: lineInputs,
      shippingNotes: form.notes.trim() || undefined,
    });

    if (res.ok && res.customer) {
      const customer: CustomerSnapshot = {
        ...res.customer,
        name: nameClean,
        phone: phoneClean,
        email: emailClean,
      };
      writeCustomerSession(customer);
      notify("Pedido confirmado exitosamente", "success", `Orden ${res.orderNumber}`);
    }

    setResult(res);
    setSubmitting(false);
  };

  const handleSendMagicLink = async () => {
    if (!emailClean || !EMAIL_REGEX.test(emailClean)) {
      notify("Ingresá un email válido para enviar el link de acceso", "error");
      return;
    }
    const r = await sendCustomerMagicLink(emailClean);
    if (r.ok) {
      setMagicLinkSent(true);
      notify(r.message, "success");
    } else {
      notify(r.error, "error");
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);

    const res = await validateCoupon(couponCode);
    setValidatingCoupon(false);
    if (res.ok && res.coupon) {
      setAppliedCoupon(res.coupon);
      notify(`Cupón ${res.coupon.code} aplicado con éxito`, "success");
    } else {
      setCouponError(res.error || "Cupón no válido");
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  if (result?.ok) {
    return (
      <OrderSuccess
        orderNumber={result.orderNumber}
        orderId={result.orderId}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bone text-ink">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/8 bg-bone/95 px-5 backdrop-blur">
        <span className="text-[13px] font-bold uppercase tracking-[0.18em]">
          Finalizar compra
        </span>
        <button
          aria-label="Volver"
          onClick={onExit}
          className="grid h-10 w-10 place-items-center text-ink/70 hover:text-ink"
        >
          <Close className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto max-w-[1100px] px-5 py-8 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* LEFT: form */}
          <section>
            <h1 className="text-[28px] font-bold leading-[0.95] tracking-[-0.02em] md:text-[34px]">
              Contanos cómo te enviamos
            </h1>
            <p className="mt-2 text-[13px] text-smoke md:text-[14px]">
              Te contactamos por WhatsApp para coordinar la entrega. No hay pago online.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
              <fieldset className="space-y-4">
                <legend className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-smoke">
                  Tus datos
                </legend>
                <Field
                  label="Nombre y apellido"
                  required
                  value={form.name}
                  onChange={(v) => updateField("name", v)}
                  placeholder="Como figure en la entrega"
                  autoComplete="name"
                />
                <Field
                  label="WhatsApp"
                  required
                  value={form.phone}
                  onChange={(v) => updateField("phone", v)}
                  placeholder="+598 9xx xx xx xx"
                  inputMode="tel"
                  autoComplete="tel"
                  hint="Te escribimos acá para confirmar el pedido."
                />
                <Field
                  label="Email"
                  required
                  value={form.email}
                  onChange={(v) => updateField("email", v)}
                  placeholder="tu@email.com (para seguimiento de tu pedido)"
                  type="email"
                  autoComplete="email"
                  hint="Obligatorio para que puedas consultar el estado de tu pedido en Mi Cuenta."
                  rightSlot={
                    form.email.trim() && !magicLinkSent ? (
                      <button
                        type="button"
                        onClick={handleSendMagicLink}
                        className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 underline-offset-2 hover:text-ink hover:underline"
                      >
                        Enviarme un link
                      </button>
                    ) : magicLinkSent ? (
                      <span className="shrink-0 text-[11px] text-smoke">
                        Link enviado
                      </span>
                    ) : null
                  }
                />
                <Field
                  label="Dirección de entrega"
                  required
                  value={form.address}
                  onChange={(v) => updateField("address", v)}
                  placeholder="Calle, número, ciudad, dept."
                  autoComplete="street-address"
                />
                <div>
                  <label className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/80">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={3}
                    className="mt-1.5 w-full border border-ink/15 bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink"
                    placeholder="Referencia, entre calles, horario preferido, etc."
                  />
                </div>
              </fieldset>

              {result && !result.ok && (
                <div className="border border-red-600/40 bg-red-50 px-4 py-3 text-[13px] text-red-800">
                  {result.error || "No pudimos registrar el pedido."}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="group flex w-full items-center justify-center gap-2 bg-ink py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-bone transition-colors hover:bg-obsidian disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Registrando..." : "Confirmar pedido"}
                <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <p className="text-center text-[11.5px] text-smoke">
                Al confirmar, te contactamos por WhatsApp para coordinar el pago y la entrega.
              </p>
            </form>
          </section>

          {/* RIGHT: cart summary */}
          <aside className="lg:sticky lg:top-[72px] lg:self-start">
            <div className="border border-ink/10 bg-white">
              <div className="border-b border-ink/8 px-5 py-4 text-[13px] font-bold uppercase tracking-[0.18em]">
                Tu pedido
              </div>
              {lines.length === 0 ? (
                <div className="px-5 py-10 text-center text-[13px] text-smoke">
                  No tenés productos en el carrito.
                  <button
                    onClick={onExit}
                    className="mt-4 block w-full bg-ink py-3 text-[11px] font-bold uppercase tracking-[0.16em] text-bone hover:bg-obsidian"
                  >
                    Seguir viendo
                  </button>
                </div>
              ) : (
                <>
                  <div className="max-h-[60vh] overflow-y-auto px-5">
                    {lines.map((l) => (
                      <div
                        key={l.key}
                        className="flex gap-4 border-b border-ink/8 py-4"
                      >
                        <img
                          src={l.product.image}
                          alt=""
                          className="h-20 w-16 shrink-0 bg-bone-200 object-cover"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-smoke">
                            {l.product.brand}
                          </p>
                          <h3 className="mt-0.5 truncate text-[13.5px] font-semibold">
                            {l.product.name}
                          </h3>
                          <p className="mt-0.5 text-[12px] text-smoke">
                            {l.variant
                              ? l.variant.label
                              : `Talle ${l.size}`}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border border-ink/12">
                              <button
                                type="button"
                                aria-label="Restar"
                                onClick={() => setQty(l.key, l.qty - 1)}
                                className="grid h-8 w-8 place-items-center text-ink/70 hover:text-ink"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-[12.5px] font-semibold">
                                {l.qty}
                              </span>
                              <button
                                type="button"
                                aria-label="Sumar"
                                onClick={() => setQty(l.key, l.qty + 1)}
                                className="grid h-8 w-8 place-items-center text-ink/70 hover:text-ink"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-[13.5px] font-bold">
                              {uy(l.product.price * l.qty)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(l.key)}
                            className="mt-2 text-[11px] text-smoke underline underline-offset-2 hover:text-ink"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-ink/8 px-5 py-4 space-y-3">
                    {/* Formulario de Cupón de Descuento */}
                    {!appliedCoupon ? (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="CÓDIGO DE CUPÓN"
                          className="w-full border border-ink/15 bg-bone px-3 py-2 text-[11px] uppercase tracking-[0.14em] outline-none focus:border-ink"
                        />
                        <button
                          type="submit"
                          disabled={validatingCoupon || !couponCode.trim()}
                          className="shrink-0 bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bone disabled:opacity-50"
                        >
                          Aplicar
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between rounded-sm bg-emerald-50 p-2.5 text-[12px]">
                        <div>
                          <span className="font-bold text-emerald-800">
                            Cupón {appliedCoupon.code}
                          </span>
                          <span className="ml-2 text-emerald-700">
                            (-{appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : uy(appliedCoupon.discount_value)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] font-bold text-rose-600 hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] font-medium text-rose-600">{couponError}</p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-ink/8">
                      <div className="flex items-baseline justify-between text-[13px] text-smoke">
                        <span>Subtotal</span>
                        <span>{uy(total)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex items-baseline justify-between text-[13px] font-semibold text-emerald-700">
                          <span>Descuento cupón</span>
                          <span>-{uy(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex items-baseline justify-between pt-1 text-[16px] font-extrabold text-ink">
                        <span>Total final</span>
                        <span className="text-[20px]">{uy(finalTotal)}</span>
                      </div>
                    </div>

                    <p className="pt-1 text-[11.5px] text-smoke">
                      Envío y pago coordinan por WhatsApp.
                    </p>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  hint,
  rightSlot,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "tel" | "email" | "text" | "numeric";
  autoComplete?: string;
  hint?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/80">
        <span>
          {label}
          {required && <span className="ml-1 text-smoke">*</span>}
        </span>
        {rightSlot}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="mt-1.5 w-full border border-ink/15 bg-transparent px-4 py-3 text-[14px] outline-none transition-colors focus:border-ink"
      />
      {hint && <p className="mt-1.5 text-[11.5px] text-smoke">{hint}</p>}
    </div>
  );
}

function SuccessPanel({
  orderNumber,
  total,
  onExit,
}: {
  orderNumber?: string;
  total?: number;
  onExit: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bone px-5 py-12 text-ink">
      <div className="w-full max-w-[520px] border border-ink/10 bg-white p-8 text-center md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink text-bone">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path d="M5 12.5l4.2 4.2L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="mt-6 text-[26px] font-bold leading-tight tracking-[-0.02em] md:text-[32px]">
          ¡Pedido registrado!
        </h1>
        <p className="mt-3 text-[14px] text-smoke md:text-[15px]">
          {orderNumber ? (
            <>
              Tu número de orden es{" "}
              <span className="font-semibold text-ink">{orderNumber}</span>. Te escribimos por
              WhatsApp para coordinar la entrega y el pago.
            </>
          ) : (
            <>Te escribimos por WhatsApp para coordinar la entrega y el pago.</>
          )}
        </p>
        {total != null && (
          <p className="mt-3 text-[14px]">
            Total: <span className="font-bold">{uy(total)}</span>
          </p>
        )}
        <button
          onClick={onExit}
          className="mt-8 w-full bg-ink py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-bone hover:bg-obsidian"
        >
          Seguir viendo
        </button>
      </div>
    </div>
  );
}
