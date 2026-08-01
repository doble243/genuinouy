import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Product, FilterState, VisualCategory, AppTab } from '../types';
import productsData from '../data/products.json';
import { supabase } from '../lib/supabase';

interface CatalogContextType {
  products: Product[];
  filteredProducts: Product[];
  filterState: FilterState;
  brands: string[];
  genders: string[];
  visualCategories: VisualCategory[];
  favorites: string[];
  activeTab: AppTab;
  showSplash: boolean;
  showSizeGuide: boolean;
  toastMessage: string | null;
  setActiveTab: (tab: AppTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedBrand: (brand: string) => void;
  setSelectedGender: (gender: string) => void;
  setSelectedCategory: (category: VisualCategory) => void;
  setSelectedSize: (size: number | null) => void;
  setMaxPrice: (price: number) => void;
  setOnlyInStock: (inStock: boolean) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  setShowSplash: (show: boolean) => void;
  setShowSizeGuide: (show: boolean) => void;
  showToast: (msg: string) => void;
  resetFilters: () => void;
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

const initialFilterState: FilterState = {
  searchQuery: '',
  selectedBrand: 'Todos',
  selectedGender: 'Todos',
  selectedCategory: 'Todas',
  selectedSize: null,
  maxPrice: 10000,
  onlyInStock: false,
  sortBy: 'featured',
};

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(productsData as Product[]);
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch live products from Supabase
  useEffect(() => {
    async function loadSupabaseProducts() {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (!error && data && data.length > 0) {
          const formatted: Product[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            brand: item.brand,
            category: item.category,
            gender: item.gender,
            price: Number(item.price),
            description: item.description,
            sku: item.sku,
            inStock: item.in_stock,
            availableQuantity: item.available_quantity,
            sizes: item.sizes || [],
            images: item.images || [],
            featured: item.featured,
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.warn('Using local catalog fallback:', err);
      }
    }
    loadSupabaseProducts();
  }, []);

  // Load initial favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('genuinos_favorites');
      return saved ? JSON.parse(saved) : ['2f3f575a-3bb7-4553-a2b2-dc4384b3d118', '64d54a7b-890f-49ac-8025-ed625b4de4c4'];
    } catch {
      return [];
    }
  });

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('genuinos_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  // Hide splash screen after 1.8s
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Eliminado de tus Favoritos');
        return prev.filter(id => id !== productId);
      } else {
        showToast('Guardado en tus Favoritos ❤️');
        return [...prev, productId];
      }
    });
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.brand) set.add(p.brand.trim());
    });
    return ['Todos', ...Array.from(set).sort()];
  }, [products]);

  const genders = ['Todos', 'Hombre', 'Mujer', 'Niños'];
  const visualCategories: VisualCategory[] = ['Todas', 'Lifestyle', 'Running', 'Básquet', 'Skate', 'Kids', 'Ofertas'];

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const setSelectedBrand = (brand: string) => {
    setFilterState(prev => ({ ...prev, selectedBrand: brand }));
  };

  const setSelectedGender = (gender: string) => {
    setFilterState(prev => ({ ...prev, selectedGender: gender }));
  };

  const setSelectedCategory = (category: VisualCategory) => {
    setFilterState(prev => ({ ...prev, selectedCategory: category }));
  };

  const setSelectedSize = (size: number | null) => {
    setFilterState(prev => ({ ...prev, selectedSize: size }));
  };

  const setMaxPrice = (price: number) => {
    setFilterState(prev => ({ ...prev, maxPrice: price }));
  };

  const setOnlyInStock = (inStock: boolean) => {
    setFilterState(prev => ({ ...prev, onlyInStock: inStock }));
  };

  const setSortBy = (sort: FilterState['sortBy']) => {
    setFilterState(prev => ({ ...prev, sortBy: sort }));
  };

  const resetFilters = () => {
    setFilterState(initialFilterState);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Search Query Filter
      if (filterState.searchQuery.trim()) {
        const q = filterState.searchQuery.toLowerCase().trim();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category ? product.category.toLowerCase().includes(q) : false;
        const matchesDesc = product.description ? product.description.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // 2. Brand Filter
      if (filterState.selectedBrand !== 'Todos') {
        if (product.brand.toLowerCase() !== filterState.selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // 3. Gender Filter
      if (filterState.selectedGender !== 'Todos') {
        const targetGender = filterState.selectedGender;
        const prodGender = product.gender ? product.gender.trim() : '';

        if (targetGender === 'Niños') {
          if (!prodGender.toLowerCase().includes('infantil') && !prodGender.toLowerCase().includes('kids') && !prodGender.toLowerCase().includes('niño')) {
            return false;
          }
        } else if (targetGender === 'Hombre' || targetGender === 'Mujer') {
          const isUnisex = prodGender.toLowerCase() === 'unisex';
          const isDirectMatch = prodGender.toLowerCase() === targetGender.toLowerCase();
          if (!isUnisex && !isDirectMatch) {
            return false;
          }
        }
      }

      // 4. Visual Category Filter
      if (filterState.selectedCategory !== 'Todas') {
        const cat = filterState.selectedCategory;
        if (cat === 'Kids') {
          const prodGender = product.gender ? product.gender.toLowerCase() : '';
          if (!prodGender.includes('infantil') && !prodGender.includes('kids') && !product.name.toLowerCase().includes('kids')) {
            return false;
          }
        } else if (cat === 'Ofertas') {
          if (product.price > 2400) return false;
        } else if (cat === 'Skate') {
          if (!product.brand.toLowerCase().includes('vans') && !product.name.toLowerCase().includes('skool') && !product.name.toLowerCase().includes('dunk')) {
            return false;
          }
        } else if (cat === 'Running') {
          if (!product.name.toLowerCase().includes('530') && !product.name.toLowerCase().includes('180') && !product.name.toLowerCase().includes('2000')) {
            return false;
          }
        }
      }

      // 5. Size Filter
      if (filterState.selectedSize) {
        if (!product.sizes || !product.sizes.includes(filterState.selectedSize)) {
          return false;
        }
      }

      // 6. Price Filter
      if (product.price > filterState.maxPrice) {
        return false;
      }

      // 7. Stock Filter
      if (filterState.onlyInStock && (!product.inStock || product.availableQuantity <= 0)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (filterState.sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (filterState.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [products, filterState]);

  return (
    <CatalogContext.Provider
      value={{
        products,
        filteredProducts,
        filterState,
        brands,
        genders,
        visualCategories,
        favorites,
        activeTab,
        showSplash,
        showSizeGuide,
        toastMessage,
        setActiveTab,
        setSearchQuery,
        setSelectedBrand,
        setSelectedGender,
        setSelectedCategory,
        setSelectedSize,
        setMaxPrice,
        setOnlyInStock,
        setSortBy,
        toggleFavorite,
        isFavorite,
        setShowSplash,
        setShowSizeGuide,
        showToast,
        resetFilters,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogContextType => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
