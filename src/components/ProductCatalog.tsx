import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Check, AlertTriangle, Cpu, Radio, Activity, Zap, Wrench, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartItemCounts: Record<number, number>;
}

type CategoryFilter = 'All' | 'Sensors' | 'Dev Boards' | 'Wireless & IoT' | 'Actuators & Power' | 'Prototyping Gear';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  cartItemCounts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);

  const categories: { label: CategoryFilter; icon: React.ReactNode }[] = [
    { label: 'All', icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: 'Dev Boards', icon: <Cpu className="w-3.5 h-3.5" /> },
    { label: 'Sensors', icon: <Activity className="w-3.5 h-3.5" /> },
    { label: 'Wireless & IoT', icon: <Radio className="w-3.5 h-3.5" /> },
    { label: 'Actuators & Power', icon: <Zap className="w-3.5 h-3.5" /> },
    { label: 'Prototyping Gear', icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Banner / Store Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            MagaMart IoT Hardware Exchange
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sensors, Microcontrollers & Prototyping Modules
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Directly mapped to <code>magamart_db.products</code> via <code>ProductDAO.java</code>.
            Real-time inventory levels, hardware specs, and secure transactional ordering.
          </p>
        </div>

        {/* Quick Inventory Summary Box */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex-shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-xl font-bold text-sky-400">{products.length}</div>
            <div className="text-[11px] text-slate-400">Total Items</div>
          </div>
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-xl font-bold text-emerald-400">
              {products.filter(p => p.stock_quantity > 10).length}
            </div>
            <div className="text-[11px] text-slate-400">In Stock</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xl font-bold text-amber-400">
              {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length}
            </div>
            <div className="text-[11px] text-slate-400">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.label
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 flex-shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, sensor, MCU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const inCartCount = cartItemCounts[product.product_id] || 0;
          const isOutOfStock = product.stock_quantity === 0;
          const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;
          const isMaxInCart = inCartCount >= product.stock_quantity;

          return (
            <div
              key={product.product_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all group relative"
            >
              <div>
                {/* Header info: SKU and Stock status */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800">
                    {product.sku}
                  </span>

                  {isOutOfStock ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Low: {product.stock_quantity} left
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {product.stock_quantity} in stock
                    </span>
                  )}
                </div>

                {/* Product Title */}
                <h3 className="font-bold text-slate-100 text-base group-hover:text-sky-300 transition-colors">
                  {product.name}
                </h3>
                <div className="text-xs text-slate-400 mb-3">{product.category}</div>

                {/* Technical Specs Tags */}
                {(product.voltage || product.interfaceType) && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {product.voltage && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800/80">
                        ⚡ {product.voltage}
                      </span>
                    )}
                    {product.interfaceType && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800/80">
                        🔌 {product.interfaceType}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price & Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-500">Unit Price</div>
                  <div className="text-lg font-extrabold text-white">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProductDetails(product)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Technical Specs"
                  >
                    <Info className="w-4 h-4" />
                  </button>

                  <button
                    disabled={isOutOfStock || isMaxInCart}
                    onClick={() => onAddToCart(product)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                      isOutOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : isMaxInCart
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
                    }`}
                  >
                    {isMaxInCart ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        In Cart ({inCartCount})
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add to Cart {inCartCount > 0 && `(${inCartCount})`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl p-8">
          <Cpu className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No hardware components found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All Components" to view the full inventory from <code>magamart_db</code>.
          </p>
        </div>
      )}

      {/* Technical Spec Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  {selectedProductDetails.sku}
                </span>
                <span className="text-xs text-slate-400">{selectedProductDetails.category}</span>
              </div>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mt-3 mb-2">{selectedProductDetails.name}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {selectedProductDetails.description}
            </p>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Supply Voltage:</span>
                <span className="font-mono text-slate-200">{selectedProductDetails.voltage || 'Standard 3.3V/5V'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Data Interface:</span>
                <span className="font-mono text-slate-200">{selectedProductDetails.interfaceType || 'Standard GPIO'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Database Table:</span>
                <span className="font-mono text-sky-400">magamart_db.products (ID: {selectedProductDetails.product_id})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Inventory Available:</span>
                <span className="font-bold text-emerald-400">{selectedProductDetails.stock_quantity} units</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs text-slate-400">Unit Price</div>
                <div className="text-2xl font-black text-white">${selectedProductDetails.price.toFixed(2)}</div>
              </div>
              <button
                onClick={() => {
                  onAddToCart(selectedProductDetails);
                  setSelectedProductDetails(null);
                }}
                disabled={selectedProductDetails.stock_quantity === 0}
                className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
