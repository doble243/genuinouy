import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product, CartItem, CustomerInfo } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: number, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: React.Dispatch<React.SetStateAction<CustomerInfo>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialCustomerInfo: CustomerInfo = {
  name: '',
  address: '',
  city: 'Montevideo',
  notes: '',
  deliveryMethod: 'envio',
  paymentMethod: 'whatsapp',
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial cart from localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('genuinos_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load initial customerInfo from localStorage
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(() => {
    try {
      const saved = localStorage.getItem('genuinos_customer');
      return saved ? JSON.parse(saved) : initialCustomerInfo;
    } catch {
      return initialCustomerInfo;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Save cartItems to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('genuinos_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Save customerInfo to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('genuinos_customer', JSON.stringify(customerInfo));
    } catch (e) {
      console.error('Failed to save customerInfo to localStorage:', e);
    }
  }, [customerInfo]);

  const addToCart = (product: Product, size: number, quantity: number = 1) => {
    const cartItemId = `${product.id}-${size}`;
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { cartItemId, product, selectedSize: size, quantity }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        customerInfo,
        setCustomerInfo,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
