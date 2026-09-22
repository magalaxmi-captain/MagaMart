import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { CartItem, User } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onCheckoutSuccess: (orderId: number, total: number) => void;
  onOpenAuth: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onCheckoutSuccess,
  onOpenAuth,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: number; total: number } | null>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shipping = subtotal > 40 || cart.length === 0 ? 0.00 : 4.50;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const newOrderId = Math.floor(5000 + Math.random() * 4900);
      onCheckoutSuccess(newOrderId, grandTotal);
      setCompletedOrder({ id: newOrderId, total: grandTotal });
      setIsProcessing(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Hardware Order Cart</h2>
                <div className="text-xs text-slate-400">
                  {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Completed Order Notification */}
            {completedOrder ? (
              <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-6 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">IoT Order Confirmed!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Order <strong>#{completedOrder.id}</strong> recorded in <code>magamart_db.orders</code>.
                  </p>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 text-left border border-slate-800 space-y-1">
                  <div>Status: <span className="text-emerald-400 font-bold">PAID (Processing)</span></div>
                  <div>Charged: <span className="text-white font-bold">${completedOrder.total.toFixed(2)}</span></div>
                  <div>Dispatched To: <span className="text-sky-300">{currentUser?.email}</span></div>
                  <div>Inventory: <span className="text-amber-300">Deducted in database</span></div>
                </div>
                <button
                  onClick={() => {
                    setCompletedOrder(null);
                    onClearCart();
                    onClose();
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Cpu className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="font-semibold text-slate-300 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Select IoT sensors, microcontrollers, or breakout boards from the catalog to build your order.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const maxStock = item.product.stock_quantity;
                return (
                  <div
                    key={item.product.product_id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-900/60">
                          {item.product.sku}
                        </span>
                        <span className="text-xs text-slate-400">{item.product.category}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-slate-400 mt-1">
                        ${item.product.price.toFixed(2)} / unit
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.product.product_id, -1)}
                            className="px-2 py-1 text-slate-300 hover:bg-slate-800 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-xs font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= maxStock}
                            onClick={() => onUpdateQuantity(item.product.product_id, 1)}
                            className={`px-2 py-1 text-xs font-bold ${
                              item.quantity >= maxStock
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          (Max {maxStock})
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <button
                        onClick={() => onRemoveItem(item.product.product_id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-sm font-bold text-white">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Drawer Footer / Summary */}
          {!completedOrder && cart.length > 0 && (
            <div className="p-5 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-200 font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Hardware Dispatch</span>
                  <span className="text-slate-200 font-mono">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-slate-200 font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-sky-400 font-mono">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {currentUser ? (
                <button
                  disabled={isProcessing}
                  onClick={handleCheckout}
                  className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
                >
                  {isProcessing ? (
                    'Executing JDBC Transaction...'
                  ) : (
                    <>
                      <span>Place Hardware Order (${grandTotal.toFixed(2)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Place Order
                </button>
              )}

              <div className="text-[10px] text-center text-slate-500 font-mono">
                Safe JDBC Transaction: Atomic INSERT into orders & UPDATE stock
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
