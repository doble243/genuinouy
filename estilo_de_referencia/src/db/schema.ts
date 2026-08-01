import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  category: text("category").notNull(), // zapatillas | botas | mocasines | tacos
  gender: text("gender").notNull().default("unisex"), // mujer | hombre | unisex
  priceUyu: integer("price_uyu").notNull(),
  oldPriceUyu: integer("old_price_uyu"),
  sizes: text("sizes").notNull(), // csv, ej: "36,37,38,39,40"
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").notNull().default(false),
  stock: integer("stock").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull().default("Pando"),
  deliveryMethod: text("delivery_method").notNull().default("retiro"), // retiro | envio
  paymentMethod: text("payment_method").notNull().default("efectivo"), // efectivo | transferencia | mercadopago
  notes: text("notes"),
  totalUyu: integer("total_uyu").notNull(),
  status: text("status").notNull().default("pendiente"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  productName: text("product_name").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPriceUyu: integer("unit_price_uyu").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
