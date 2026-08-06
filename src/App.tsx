import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { CartDrawer, SearchOverlay, WishDrawer } from "./components/Overlays";
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
import { AllProducts } from "./components/AllProducts";
import { ProductDetail } from "./components/ProductDetail";
import { AdminGate } from "./components/admin/AdminGate";
import { Checkout } from "./components/Checkout";
import { StoreProvider } from "./lib/store";

type Route = "home" | "admin" | "checkout" | "cuenta";

function getRoute(): Route {
  if (typeof window === "undefined") return "home";
  const h = window.location.hash;
  if (h === "#admin" || window.location.search.includes("admin=true")) return "admin";
  if (h === "#checkout") return "checkout";
  if (h === "#cuenta" || h.startsWith("#cuenta")) return "cuenta";
  return "home";
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => getRoute());

  useEffect(() => {
    const handle = () => setRoute(getRoute());
    window.addEventListener("hashchange", handle);
    window.addEventListener("popstate", handle);
    return () => {
      window.removeEventListener("hashchange", handle);
      window.removeEventListener("popstate", handle);
    };
  }, []);

  const isAdmin = route === "admin";
  const isCheckout = route === "checkout";

  const handleExitAdmin = () => {
    window.location.hash = "";
    setRoute("home");
  };

  return (
    <StoreProvider>
      {isAdmin ? (
        <AdminGate onExitAdmin={handleExitAdmin} />
      ) : isCheckout ? (
        <Checkout onExit={() => { window.location.hash = ""; setRoute("home"); }} />
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
          <WishDrawer />
          <SearchOverlay />
          <ProductDetail />
        </div>
      )}
    </StoreProvider>
  );
}
