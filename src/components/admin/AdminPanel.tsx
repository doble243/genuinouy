import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AdminProductList } from "./AdminProductList";
import { AdminProductFormModal } from "./AdminProductFormModal";
import { AdminHeroManager } from "./AdminHeroManager";
import { AdminOrdersList } from "./AdminOrdersList";
import { AdminCustomersList } from "./AdminCustomersList";
import type { AdminProduct, AdminTab } from "../../types/admin";
import { useStore } from "../../lib/store";
import { mapProductToAdminProduct } from "../../lib/adminProductMapper";

export function AdminPanel({ onExitAdmin }: { onExitAdmin?: () => void }) {
  const {
    products: storeProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleStock,
    updatePrice,
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  // Map store products from Supabase to AdminProduct format. Using a pure
  // mapper so the variants array is preserved on edit (previously this
  // mapping dropped `variants` and saving an existing product wiped them).
  const products: AdminProduct[] = storeProducts.map((p, index) =>
    mapProductToAdminProduct(p, index),
  );

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProduct(productId);
  };

  const handleToggleStock = async (productId: string) => {
    await toggleStock(productId);
  };

  const handleUpdatePrice = async (productId: string, newPrice: number) => {
    await updatePrice(productId, newPrice);
  };

  const handleSaveProduct = async (productData: Partial<AdminProduct>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: productData.name,
        brand: productData.brand,
        price: productData.price,
        compareAt: productData.compareAt,
        category: productData.category,
        gender: productData.gender,
        description: productData.description,
        sku: productData.sku,
        in_stock: productData.inStock,
        available_quantity: productData.stock,
        sizes: productData.sizes ? productData.sizes.map(Number).filter((n) => !isNaN(n)) : undefined,
        images: productData.images,
        featured: productData.featured,
        variants: productData.variants,
      });
    } else {
      await createProduct({
        name: productData.name || "Nuevo Producto",
        brand: productData.brand || "Nike",
        price: productData.price || 0,
        compareAt: productData.compareAt,
        category: productData.category || "Calzado",
        gender: productData.gender || "Unisex",
        description: productData.description || "",
        sku: productData.sku || `GEN-${Math.floor(100 + Math.random() * 900)}`,
        in_stock: productData.inStock !== false,
        available_quantity: productData.stock ?? 5,
        sizes: productData.sizes ? productData.sizes.map(Number).filter((n) => !isNaN(n)) : [38, 39, 40, 41, 42],
        images: productData.images && productData.images.length > 0 ? productData.images : [productData.image || ""],
        featured: Boolean(productData.featured),
        variants: productData.variants ?? [],
      });
    }
    setIsModalOpen(false);
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenNewProductModal={handleOpenNewModal}
      onExitAdmin={onExitAdmin}
    >
      {activeTab === "dashboard" ? (
        <AdminDashboard
          products={products}
          onOpenNewProductModal={handleOpenNewModal}
          onSelectProductForEdit={handleEditProduct}
          onToggleStock={handleToggleStock}
          onViewAllProducts={() => setActiveTab("products")}
          onNavigateToTab={setActiveTab}
        />
      ) : activeTab === "orders" ? (
        <AdminOrdersList />
      ) : activeTab === "customers" ? (
        <AdminCustomersList />
      ) : activeTab === "hero" ? (
        <AdminHeroManager />
      ) : (
        <AdminProductList
          products={products}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onToggleStock={handleToggleStock}
          onUpdatePrice={handleUpdatePrice}
          onOpenNewProductModal={handleOpenNewModal}
        />
      )}

      {/* Product Creator & Editor Modal */}
      <AdminProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </AdminLayout>
  );
}
