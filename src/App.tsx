import React from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { VisualCategoryBar } from './components/VisualCategoryBar';
import { ProductGrid } from './components/ProductGrid';
import { FavoritesView } from './components/FavoritesView';
import { ProfileView } from './components/ProfileView';
import { QuickViewModal } from './components/QuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SplashScreen } from './components/SplashScreen';
import { Toast } from './components/Toast';
import { SizeGuideModal } from './components/SizeGuideModal';

const AppContent: React.FC = () => {
  const { activeTab } = useCatalog();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col selection:bg-[#1b3b2b] selection:text-white pb-16 md:pb-0">
      <SplashScreen />
      <Toast />
      <SizeGuideModal />

      <Header />

      {activeTab === 'home' && (
        <>
          <HeroBanner />
          <VisualCategoryBar />
          <main className="flex-1">
            <ProductGrid />
          </main>
        </>
      )}

      {activeTab === 'catalog' && (
        <>
          <FilterBar />
          <VisualCategoryBar />
          <main className="flex-1">
            <ProductGrid />
          </main>
        </>
      )}

      {activeTab === 'favorites' && (
        <main className="flex-1">
          <FavoritesView />
        </main>
      )}

      {activeTab === 'profile' && (
        <main className="flex-1">
          <ProfileView />
        </main>
      )}

      <QuickViewModal />
      <CartDrawer />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CatalogProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </CatalogProvider>
  );
};

export default App;
