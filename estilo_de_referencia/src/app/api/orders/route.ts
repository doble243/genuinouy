import { NextResponse } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { ensureSeed } from "@/lib/catalog";
import { inArray } from "drizzle-orm";

type IncomingItem = { productId: number; size: string; quantity: number };

export async function POST(request: Request) {
  try {
    await ensureSeed();
    const body = await request.json();

    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone) {
      return NextResponse.json(
        { error: "Nombre y celular son obligatorios" },
        { status: 400 },
      );
    }
    if (items.length === 0) {
      return NextResponse.json(
        { error: "El pedido no tiene productos" },
        { status: 400 },
      );
    }

    const ids = [...new Set(items.map((i) => Number(i.productId)))];
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, ids));
    const byId = new Map(dbProducts.map((p) => [p.id, p]));

    let total = 0;
    const lineItems = items.map((i) => {
      const p = byId.get(Number(i.productId));
      if (!p) {
        throw new Error("Producto no encontrado");
      }
      const quantity = Math.max(1, Math.min(20, Number(i.quantity) || 1));
      total += p.priceUyu * quantity;
      return {
        productId: p.id,
        productName: p.name,
        size: String(i.size ?? "-"),
        quantity,
        unitPriceUyu: p.priceUyu,
      };
    });

    const [order] = await db
      .insert(orders)
      .values({
        customerName,
        phone,
        email: body.email ? String(body.email) : null,
        address: String(body.address ?? "").trim() || "Retiro en local",
        city: String(body.city ?? "Pando").trim() || "Pando",
        deliveryMethod:
          body.deliveryMethod === "envio" ? "envio" : "retiro",
        paymentMethod: ["efectivo", "transferencia", "mercadopago"].includes(
          String(body.paymentMethod),
        )
          ? String(body.paymentMethod)
          : "efectivo",
        notes: body.notes ? String(body.notes) : null,
        totalUyu: total,
      })
      .returning();

    await db
      .insert(orderItems)
      .values(lineItems.map((li) => ({ ...li, orderId: order.id })));

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error("Error creating order:", err);
    return NextResponse.json(
      { error: "No se pudo procesar el pedido. Intentá de nuevo." },
      { status: 500 },
    );
  }
}
