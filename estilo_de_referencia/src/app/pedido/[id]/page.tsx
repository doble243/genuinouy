import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatUyu } from "@/lib/catalog";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const PAYMENT_LABELS: Record<string, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia bancaria",
  mercadopago: "Mercado Pago",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) notFound();

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  const whatsappText = encodeURIComponent(
    `¡Hola GENUINOS UY! Confirmé el pedido #${order.id} a nombre de ${order.customerName} por ${formatUyu(order.totalUyu)}. ¿Cómo seguimos?`,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="rounded-3xl border border-brand/10 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="mt-4 font-serif text-3xl font-bold text-stone-900">
          ¡Gracias por tu compra, {order.customerName.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-stone-600">
          Tu pedido <span className="font-bold text-brand">#{order.id}</span>{" "}
          fue recibido. Te vamos a contactar al{" "}
          <span className="font-semibold">{order.phone}</span> para coordinar{" "}
          {order.deliveryMethod === "envio"
            ? "el envío"
            : "el retiro en el local de Pando"}{" "}
          y el pago por {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}.
        </p>

        <div className="mt-8 rounded-2xl bg-cream p-6 text-left">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            Detalle del pedido
          </h2>
          <ul className="mt-3 divide-y divide-stone-200">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span>
                  {item.productName}{" "}
                  <span className="text-stone-500">
                    (Talle {item.size} × {item.quantity})
                  </span>
                </span>
                <span className="font-semibold">
                  {formatUyu(item.unitPriceUyu * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-stone-300 pt-3 font-bold">
            <span>Total</span>
            <span className="text-brand">{formatUyu(order.totalUyu)}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/59899123456?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Confirmar por WhatsApp 💬
          </a>
          <Link
            href="/productos"
            className="rounded-full border-2 border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand/5"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
