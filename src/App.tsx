import React, { useState } from 'react';
import { INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_ORDERS } from './data/initialData';
import { Product, User, CartItem, Order } from './types';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { CartDrawer } from './components/CartDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { CodeViewer } from './components/CodeViewer';
import { DatabaseViewer } from './components/DatabaseViewer';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // State management
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Default logged in user (starts with Sarah Chen, easily toggleable)
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[1]);
  
  const [currentView, setCurrentView] = useState<'store' | 'admin' | 'code' | 'database'>('store');
  
  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'user-login' | 'register' | 'admin-login'>('user-login');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.product_id === product.product_id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prevCart; // Enforce stock ceiling
        return prevCart.map((item) =>
          item.product.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.product_id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock_quantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.product_id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Transactional Checkout simulation (updates products stock + creates order)
  const handleCheckoutSuccess = (orderId: number, total: number) => {
    // 1. Deduct stock in products (simulates ProductDAO.deductStock)
    setProducts((prevProducts) => {
      return prevProducts.map((prod) => {
        const cartItem = cart.find((c) => c.product.product_id === prod.product_id);
        if (cartItem) {
          return {
            ...prod,
            stock_quantity: Math.max(0, prod.stock_quantity - cartItem.quantity),
          };
        }
        return prod;
      });
    });

    // 2. Insert into orders table (simulates OrderDAO.insert)
    const newOrder: Order = {
      order_id: orderId,
      user_id: currentUser?.id || 99,
      user_email: currentUser?.email || 'guest@magamart.com',
      total_amount: total,
      items_count: cart.reduce((acc, c) => acc + c.quantity, 0),
      status: 'PAID',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setOrders((prev) => [newOrder, ...prev]);

    // 3. Reset cart
    setCart([]);
  };

  // Admin Catalog CRUD
  const handleAddProduct = (newProd: Omit<Product, 'product_id'>) => {
    const created: Product = {
      ...newProd,
      product_id: Math.max(...products.map((p) => p.product_id), 100) + 1,
    };
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.product_id === updated.product_id ? updated : p))
    );
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.product_id !== productId));
    // Also remove from cart if present
    setCart((prev) => prev.filter((item) => item.product.product_id !== productId));
  };

  // Auth Handling
  const handleOpenAuth = (tab: 'user-login' | 'register' | 'admin-login' = 'user-login') => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setCurrentView('admin');
    }
  };

  const handleRegisterSuccess = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (currentView === 'admin') {
      setCurrentView('store');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartItemCounts: Record<number, number> = {};
  cart.forEach((item) => {
    cartItemCounts[item.product.product_id] = item.quantity;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      
      {/* Platform Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'store' && (
          <ProductCatalog
            products={products}
            onAddToCart={handleAddToCart}
            cartItemCounts={cartItemCounts}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            products={products}
            users={users}
            orders={orders}
            currentUser={currentUser}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentView === 'code' && <CodeViewer />}

        {currentView === 'database' && (
          <DatabaseViewer
            products={products}
            users={users}
            orders={orders}
          />
        )}
      </main>

      {/* Split-Screen Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authDefaultTab}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onCheckoutSuccess={handleCheckoutSuccess}
        onOpenAuth={() => {
          setIsCartOpen(false);
          handleOpenAuth('user-login');
        }}
      />

      {/* Platform Architecture Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">⚡ MagaMart</span>
            <span>— IoT Components, Sensors & Prototyping Hardware</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Java Servlet 4.0 / JSP MVC</span>
            <span>•</span>
            <span>magamart_db (MySQL JDBC)</span>
            <span>•</span>
            <span>DAO Pattern</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
