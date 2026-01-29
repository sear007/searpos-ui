import React, { useState, useEffect, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Login from './components/Login';
import ProductList from './components/ProductList';
import CartView from './components/CartView';
import AlertContainer from './components/ui/Alert';
import { ShoppingCart, LogOut, Filter, X, Loader2, ArrowDown } from 'lucide-react';
import { getProducts } from './services/api';
import { Product } from './types';

const AuthenticatedLayout: React.FC = () => {
  const { logout, cartCount } = useStore();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  
  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Fetch Data Function
  const loadProducts = async (page: number, isRefresh = false) => {
    if (isRefresh) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const { products: newProducts, lastPage: maxPage } = await getProducts(page);
      
      if (isRefresh) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setLastPage(maxPage);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadProducts(1, true);
  }, []);

  const handleLoadMore = () => {
    if (currentPage < lastPage && !isLoadingMore) {
      loadProducts(currentPage + 1, false);
    }
  };

  // Derived State
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <>
      {/* Floating Logout Button (Top Right) */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={logout}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth pt-16 w-full relative">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {selectedCategory || 'All Products'}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {filteredProducts.length} items available
          </p>
        </div>
        
        <ProductList products={filteredProducts} isLoading={isLoading} />

        {/* Pagination / Load More */}
        {!isLoading && !selectedCategory && currentPage < lastPage && (
          <div className="pb-32 pt-4 flex justify-center">
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="bg-white border border-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
              {isLoadingMore ? 'Loading...' : 'Load More Products'}
            </button>
          </div>
        )}

        {/* Loading More Spinner (if using infinite scroll logic later, currently using button) */}
        {isLoadingMore && currentPage > 1 && !selectedCategory && (
            <div className="h-20" /> // Spacer
        )}
      </main>

      {/* Floating Action Buttons Container (Bottom Right Stack) */}
      {/* Only show FABs if cart/modal is NOT open */}
      {!isCartOpen && (
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-none z-[50]">
            
            {/* Filter FAB */}
            <div className="pointer-events-auto">
            <div className="relative">
                {/* Filter Menu Popup - Opens to the LEFT of the button */}
                {isFilterOpen && (
                <div className="absolute bottom-0 right-full mr-3 mb-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[160px] animate-[slideUp_0.2s_ease-out] origin-right">
                    <div className="flex justify-between items-center px-3 py-2 border-b border-gray-100 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase">Categories</span>
                    <button onClick={() => setFilterOpen(false)}><X className="w-3 h-3 text-gray-400" /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                    <button
                        onClick={() => { setSelectedCategory(null); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setFilterOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                        {cat}
                        </button>
                    ))}
                    </div>
                </div>
                )}

                <button
                onClick={() => setFilterOpen(!isFilterOpen)}
                className={`w-12 h-12 rounded-2xl shadow-lg transition-all active:scale-90 flex items-center justify-center ${isFilterOpen || selectedCategory ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                >
                <Filter className="w-5 h-5" />
                </button>
            </div>
            </div>

            {/* Cart FAB */}
            <button 
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto bg-primary text-white w-14 h-14 rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 relative flex items-center justify-center"
            >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full border-2 border-gray-50 shadow-sm px-1">
                {cartCount}
                </span>
            )}
            </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && <CartView isOpen={isCartOpen} onClose={() => setCartOpen(false)} />}
    </>
  );
};

const MainContent: React.FC = () => {
  const { userPhone } = useStore();

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-200 flex justify-center overflow-hidden">
      {/* Mobile Frame */}
      <div className="w-full max-w-md h-full bg-gray-50 shadow-2xl relative flex flex-col overflow-hidden">
        {/* Alerts scoped to mobile frame */}
        <AlertContainer />
        
        {userPhone ? <AuthenticatedLayout /> : <Login />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;