import { Header } from "./components/Header";
import { CartDrawer, SearchOverlay } from "./components/Overlays";
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
import { StoreProvider } from "./lib/store";

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-screen bg-bone">
        <Header />
        <main>
          <Hero />
          <Categories />
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
      </div>
    </StoreProvider>
  );
}
