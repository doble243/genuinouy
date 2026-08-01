export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  gender: string;
  price: number;
  currency: string;
  formattedPrice: string;
  description: string;
  availableQuantity: number;
  inStock: boolean;
  status: string;
  sku: string;
  whatsappLink: string;
  sizes: number[];
  images: string[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedSize: number;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  address: string;
  city: string;
  notes?: string;
  deliveryMethod?: 'envio' | 'retiro';
  paymentMethod?: 'whatsapp' | 'transferencia' | 'efectivo';
}

export type VisualCategory = 'Todas' | 'Lifestyle' | 'Running' | 'Básquet' | 'Skate' | 'Kids' | 'Ofertas';

export interface FilterState {
  searchQuery: string;
  selectedBrand: string;
  selectedGender: string;
  selectedCategory: VisualCategory;
  selectedSize: number | null;
  maxPrice: number;
  onlyInStock: boolean;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
}

export type AppTab = 'home' | 'catalog' | 'favorites' | 'cart' | 'profile';
