import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { CartDrawer, SearchOverlay } from "./components/Overlays";
import { AllProducts } from "./components/AllProducts";
import { ProductDetail } from "./components/ProductDetail";
import {
  Brands,
  Categories,
  Editorial,
  Footer,
  Hero,
  MostWanted,
  NewArrivals,
  Trust,
} from "./components/Sections";
import { AdminPanel } from "./components/admin/AdminPanel";
import { StoreProvider } from "./lib/store";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.location.hash === "#admin" ||
      window.location.search.includes("admin=true") ||
      window.location.pathname.startsWith("/admin")
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdmin(
        window.location.hash === "#admin" ||
        window.location.search.includes("admin=true") ||
        window.location.pathname.startsWith("/admin")
      );
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const handleExitAdmin = () => {
    if (window.location.hash === "#admin") {
      window.location.hash = "";
    } else {
      window.history.pushState({}, "", "/");
    }
    setIsAdmin(false);
  };

  return (
    <StoreProvider>
      {isAdmin ? (
        <AdminPanel onExitAdmin={handleExitAdmin} />
      ) : (
        <div className="min-h-screen bg-bone">
          <Header />
          <main>
            <Hero />
            <Categories />
            <AllProducts />
            <NewArrivals />
            <div className="h-10 md:h-16" />
            <Brands />
            <Editorial />
            <MostWanted />
            <Trust />
          </main>
          <Footer />
          <CartDrawer />
          <SearchOverlay />
          <ProductDetail />
        </div>
      )}
    </StoreProvider>
  );
}
