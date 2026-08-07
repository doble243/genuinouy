import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  allProducts as fallbackProducts,
  newArrivals as fallbackNewArrivals,
  mostWanted as fallbackMostWanted,
  type Product,
  type ProductVariant,
} from "./data";
import {
  fetchProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  toggleStock as apiToggleStock,
  updatePrice as apiUpdatePrice,
  type CreateProductInput,
  type UpdateProductInput,
} from "./adminService";

export type CartLine = {
  key: string;
  product: Product;
  size: string;
  qty: number;
  /** When the line came from a product variant (size/color with a custom image),
   *  this carries the variant reference so the cart/checkout/order pipeline
   *  retains the per-variant context end-to-end. */
  variant?: ProductVariant;
};

/** Build a stable, unique key for a cart line. Variant-aware so two variants
 *  of the same product (e.g. Negro vs Azul) don't collapse into one line. */
export function makeCartLineKey(
  productId: string,
  size: string,
  variantId?: string,
): string {
  return variantId ? `${productId}-${size}-${variantId}` : `${productId}-${size}`;
}

export type ToastNotification = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  title?: string;
};

type Ctx = {
  products: Product[];
  newArrivals: Product[];
  mostWanted: Product[];
  allProducts: Product[];
  lines: CartLine[];
  add: (p: Product, size: string, variant?: ProductVariant) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  count: number;
  total: number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  wish: string[];
  wishProducts: Product[];
  toggleWish: (id: string) => void;
  clearWish: () => void;
  wishOpen: boolean;
  setWishOpen: (v: boolean) => void;

  // Modal de detalle de producto y filtro por marca
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  brandFilter: string | null;
  setBrandFilter: (b: string | null) => void;

  // Métodos CRUD de Administración con actualizaciones optimistas
  createProduct: (input: CreateProductInput) => Promise<Product | null>;
  updateProduct: (id: string, input: UpdateProductInput) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleStock: (id: string, targetInStock?: boolean) => Promise<Product | null>;
  updatePrice: (id: string, newPrice: number) => Promise<Product | null>;

  // Toasts / Notificaciones
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, "id">) => void;
  removeToast: (id: string) => void;
  notify: (message: string, type?: "success" | "error" | "info", title?: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

const WISH_KEY = "genuinos:wish";

function readStoredWish(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(WISH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [wishOpen, setWishOpen] = useState(false);
  const [wish, setWish] = useState<string[]>(readStoredWish);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);

  // Notificaciones Toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastNotification, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastNotification = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const notify = useCallback(
    (message: string, type: "success" | "error" | "info" = "info", title?: string) => {
      addToast({ message, type, title });
    },
    [addToast]
  );

  // Carga inicial desde Supabase
  useEffect(() => {
    async function loadProducts() {
      try {
        console.log("[GENUINOS] Fetching products from Supabase...");
        const data = await fetchProducts();
        console.log(`[GENUINOS] Loaded ${data.length} products from Supabase`);
        if (data && data.length > 0) {
          setProducts(data);
        }
      } catch (err: any) {
        console.warn("[GENUINOS] Falling back to local data:", err);
      }
    }
    loadProducts();
  }, []);

  // Recién llegados: todos los productos (los más recientes primero, ya vienen ordenados por created_at desc)
  const newArrivals = useMemo(() => products.slice(0, 12), [products]);
  // Los más buscados: segunda tanda de productos para no repetir
  const mostWanted = useMemo(
    () => (products.length > 8 ? products.slice(8, 16) : products.slice(0, 8)),
    [products]
  );

  const add = useCallback(
    (p: Product, size: string, variant?: ProductVariant) => {
      const key = makeCartLineKey(p.id, size, variant?.id);
      setLines((prev) => {
        const found = prev.find((l) => l.key === key);
        if (found)
          return prev.map((l) =>
            l.key === key ? { ...l, qty: l.qty + 1 } : l,
          );
        return [...prev, { key, product: p, size, qty: 1, variant }];
      });
      setCartOpen(true);
    },
    [],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }, []);

  const remove = useCallback(
    (key: string) => setLines((p) => p.filter((l) => l.key !== key)),
    []
  );

  const toggleWish = useCallback(
    (id: string) =>
      setWish((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])),
    []
  );

  const clearWish = useCallback(() => setWish([]), []);

  // Persistencia local de favoritos
  useEffect(() => {
    try {
      window.localStorage.setItem(WISH_KEY, JSON.stringify(wish));
    } catch {
      /* almacenamiento no disponible (modo privado / cuota) */
    }
  }, [wish]);

  // Productos favoritos, en el orden en que fueron guardados
  const wishProducts = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]));
    return wish
      .map((id) => byId.get(id))
      .filter((p): p is Product => p !== undefined);
  }, [wish, products]);

  // Métodos Admin CRUD con optimización de interfaz y manejo de errores con toasts
  const createProduct = useCallback(
    async (input: CreateProductInput): Promise<Product | null> => {
      const tempId = `temp-${Date.now()}`;
      const tempProduct: Product = {
        id: tempId,
        brand: input.brand,
        name: input.name,
        price: input.price,
        image:
          input.images && input.images[0]
            ? input.images[0]
            : "https://images.pexels.com/photos/24702077/pexels-photo-24702077.jpeg",
        hover:
          input.images && input.images[1]
            ? input.images[1]
            : input.images?.[0] ||
              "https://images.pexels.com/photos/4296075/pexels-photo-4296075.jpeg",
        isNew: input.category === "Nuevos Ingresos" || Boolean(input.featured),
        sizes: (input.sizes || [38, 39, 40, 41, 42, 43, 44]).map(String),
        inStock: input.in_stock !== undefined ? input.in_stock : true,
        category: input.category,
        gender: input.gender,
        description: input.description,
        sku: input.sku,
        availableQuantity: input.available_quantity,
        images: input.images,
        featured: input.featured,
      };

      setProducts((prev) => [tempProduct, ...prev]);

      try {
        const created = await apiCreateProduct(input);
        setProducts((prev) =>
          prev.map((p) => (p.id === tempId ? created : p))
        );
        notify(`Producto "${created.name}" creado con éxito`, "success", "Éxito");
        return created;
      } catch (err: any) {
        setProducts((prev) => prev.filter((p) => p.id !== tempId));
        notify(err.message || "Error al crear producto", "error", "Error");
        return null;
      }
    },
    [notify]
  );

  const updateProduct = useCallback(
    async (id: string, input: UpdateProductInput): Promise<Product | null> => {
      let snapshot: Product[] = [];
      setProducts((prev) => {
        snapshot = prev;
        return prev.map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...input,
            price: input.price !== undefined ? input.price : p.price,
            inStock: input.in_stock !== undefined ? input.in_stock : p.inStock,
            sizes: input.sizes ? input.sizes.map(String) : p.sizes,
          };
        });
      });

      try {
        const updated = await apiUpdateProduct(id, input);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
        notify(`Producto "${updated.name}" actualizado`, "success", "Éxito");
        return updated;
      } catch (err: any) {
        setProducts(snapshot);
        notify(err.message || "Error al actualizar producto", "error", "Error");
        return null;
      }
    },
    [notify]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      let snapshot: Product[] = [];
      setProducts((prev) => {
        snapshot = prev;
        return prev.filter((p) => p.id !== id);
      });

      try {
        await apiDeleteProduct(id);
        notify("Producto eliminado correctamente", "success", "Eliminado");
        return true;
      } catch (err: any) {
        setProducts(snapshot);
        notify(err.message || "Error al eliminar producto", "error", "Error");
        return false;
      }
    },
    [notify]
  );

  const toggleStock = useCallback(
    async (id: string, targetInStock?: boolean): Promise<Product | null> => {
      let snapshot: Product[] = [];
      let targetState = targetInStock;

      setProducts((prev) => {
        snapshot = prev;
        const current = prev.find((p) => p.id === id);
        if (targetState === undefined && current) {
          targetState = !current.inStock;
        }
        const nextState = targetState ?? false;
        return prev.map((p) =>
          p.id === id ? { ...p, inStock: nextState } : p
        );
      });

      try {
        const updated = await apiToggleStock(id, targetInStock);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
        const statusMsg = updated.inStock ? "Disponible" : "Sin Stock";
        notify(`Stock de "${updated.name}": ${statusMsg}`, "success", "Stock Actualizado");
        return updated;
      } catch (err: any) {
        setProducts(snapshot);
        notify(err.message || "Error al cambiar stock", "error", "Error");
        return null;
      }
    },
    [notify]
  );

  const updatePrice = useCallback(
    async (id: string, newPrice: number): Promise<Product | null> => {
      let snapshot: Product[] = [];
      setProducts((prev) => {
        snapshot = prev;
        return prev.map((p) =>
          p.id === id ? { ...p, price: newPrice } : p
        );
      });

      try {
        const updated = await apiUpdatePrice(id, newPrice);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? updated : p))
        );
        notify(
          `Precio de "${updated.name}" actualizado a $ ${newPrice.toLocaleString("es-UY")}`,
          "success",
          "Precio Actualizado"
        );
        return updated;
      } catch (err: any) {
        setProducts(snapshot);
        notify(err.message || "Error al actualizar precio", "error", "Error");
        return null;
      }
    },
    [notify]
  );

  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.qty * l.product.price, 0);

  const anyOpen =
    cartOpen || searchOpen || menuOpen || wishOpen || selectedProduct !== null;
  useEffect(() => {
    document.body.style.overflow = anyOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [anyOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCartOpen(false);
        setSearchOpen(false);
        setMenuOpen(false);
        setWishOpen(false);
        setSelectedProduct(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({
      products,
      newArrivals: newArrivals.length > 0 ? newArrivals : fallbackNewArrivals,
      mostWanted: mostWanted.length > 0 ? mostWanted : fallbackMostWanted,
      allProducts: products,
      lines,
      add,
      setQty,
      remove,
      count,
      total,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      wishOpen,
      setWishOpen,
      wish,
      wishProducts,
      toggleWish,
      clearWish,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleStock,
      updatePrice,
      toasts,
      addToast,
      removeToast,
      notify,
      selectedProduct,
      setSelectedProduct,
      brandFilter,
      setBrandFilter,
    }),
    [
      products,
      newArrivals,
      mostWanted,
      lines,
      add,
      setQty,
      remove,
      count,
      total,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      menuOpen,
      setMenuOpen,
      wishOpen,
      setWishOpen,
      wish,
      wishProducts,
      toggleWish,
      clearWish,
      createProduct,
      updateProduct,
      deleteProduct,
      toggleStock,
      updatePrice,
      toasts,
      addToast,
      removeToast,
      notify,
      selectedProduct,
      setSelectedProduct,
      brandFilter,
      setBrandFilter,
    ]
  );

  return (
    <StoreCtx.Provider value={value}>
      {children}
      <ToastContainer />
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore fuera del provider");
  return c;
}

/* Toast Container Component */
function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-[360px] w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        const isSuccess = toast.type === "success";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-lg shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              isError
                ? "bg-red-950/90 border-red-800 text-red-100"
                : isSuccess
                ? "bg-obsidian/95 border-gold-600/40 text-bone"
                : "bg-obsidian/90 border-ink/20 text-bone"
            }`}
          >
            <div className="flex-1 min-w-0">
              {toast.title && (
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-0.5 ${
                    isError ? "text-red-300" : isSuccess ? "text-gold-500" : "text-smoke"
                  }`}
                >
                  {toast.title}
                </p>
              )}
              <p className="text-[13px] font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-smoke hover:text-bone text-xs font-semibold p-1 shrink-0"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* Reveal on scroll — un solo observer compartido */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
