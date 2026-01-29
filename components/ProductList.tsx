import React from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
}

const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
    <div className="space-y-2 px-1">
      <div className="h-3 bg-gray-200 rounded-full w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded-full w-full"></div>
      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
      <div className="flex justify-between items-center mt-3 pt-2">
        <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, cart } = useStore();
  
  const cartItem = cart.find(item => item.id === product.id);

  return (
    <div className="group bg-white rounded-3xl p-3 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      
      {/* In Cart Indicator */}
      {cartItem && (
        <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex flex-col items-end leading-tight">
          <span className="flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            {cartItem.quantity}
          </span>
        </div>
      )}

      <div className="relative aspect-square mb-3 overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      
      <div className="px-1 flex flex-col flex-1 gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
          {product.category}
        </span>
        
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>
        
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-400 font-bold uppercase">List Price</span>
             <span className="text-lg font-extrabold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all active:scale-90 shadow-lg ${
              cartItem ? 'bg-green-600 shadow-green-600/20' : 'bg-black shadow-black/20'
            } text-white hover:opacity-90`}
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC<ProductListProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 pb-44">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
        <p>No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 pb-44">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;