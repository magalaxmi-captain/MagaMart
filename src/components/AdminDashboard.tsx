import React, { useState } from 'react';
import { Product, User, Order } from '../types';
import { ShieldCheck, Plus, Trash2, Edit3, Package, AlertTriangle, CheckCircle2, TrendingUp, Users, ShoppingBag } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  users: User[];
  orders: Order[];
  currentUser: User | null;
  onAddProduct: (newProduct: Omit<Product, 'product_id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  users,
  orders,
  currentUser,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'users'>('inventory');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  // Form states for new product
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Product['category']>('Sensors');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('7.99');
  const [formStock, setFormStock] = useState('25');
  const [formDescription, setFormDescription] = useState('');
  const [formVoltage, setFormVoltage] = useState('3.3V DC');
  const [formInterface, setFormInterface] = useState('I2C / SPI');

  const showFlash = (msg: string) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(null), 3500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name: formName.trim(),
      category: formCategory,
      sku: formSku.trim().toUpperCase(),
      price: parseFloat(formPrice) || 9.99,
      stock_quantity: parseInt(formStock, 10) || 10,
      description: formDescription.trim(),
      voltage: formVoltage.trim(),
      interfaceType: formInterface.trim(),
    });

    setIsAddModalOpen(false);
    resetForm();
    showFlash(`SKU ${formSku.toUpperCase()} inserted into magamart_db.products successfully.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProduct({
      ...editingProduct,
      name: formName.trim(),
      category: formCategory,
      sku: formSku.trim().toUpperCase(),
      price: parseFloat(formPrice) || 9.99,
      stock_quantity: parseInt(formStock, 10) || 0,
      description: formDescription.trim(),
      voltage: formVoltage.trim(),
      interfaceType: formInterface.trim(),
    });

    setEditingProduct(null);
    resetForm();
    showFlash(`Product #${editingProduct.product_id} updated via ProductDAO.updateProduct().`);
  };

  const resetForm = () => {
    setFormName('');
    setFormCategory('Sensors');
    setFormSku('');
    setFormPrice('7.99');
    setFormStock('25');
    setFormDescription('');
    setFormVoltage('3.3V DC');
    setFormInterface('I2C / SPI');
  };

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormSku(p.sku);
    setFormPrice(p.price.toString());
    setFormStock(p.stock_quantity.toString());
    setFormDescription(p.description);
    setFormVoltage(p.voltage || '3.3V');
    setFormInterface(p.interfaceType || 'I2C');
    setIsAddModalOpen(true);
  };

  const lowStockCount = products.filter(p => p.stock_quantity <= 10).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock_quantity), 0);

  return (
    <div className="space-y-6">
      
      {/* Admin Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider">
              admin_dashboard.jsp (Active Session)
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              AuthFilter: VERIFIED
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">MagaMart Administrator Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected to <code>magamart_db</code> via <code>ProductDAO.java</code> and <code>UserDAO.java</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add IoT Hardware Component
          </button>
        </div>
      </div>

      {/* Flash Alert */}
      {flashMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{flashMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total SKUs in DB</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{products.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">magamart_db.products</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{lowStockCount}</div>
          <div className="text-[10px] text-slate-500 mt-1">≤ 10 items remaining</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Inventory Valuation</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            ${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">SUM(price * stock_quantity)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">magamart_db.users</div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-4 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory Management ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Roles & Access ({users.length})
        </button>
      </div>

      {/* Tab 1: Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-mono">ID</th>
                  <th className="py-3.5 px-4 font-mono">SKU</th>
                  <th className="py-3.5 px-4">Component Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4">Inventory Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{p.product_id}</td>
                    <td className="py-3 px-4 font-mono text-sky-400 font-semibold">{p.sku}</td>
                    <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-100 font-bold">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{p.stock_quantity}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              onUpdateProduct({ ...p, stock_quantity: Math.max(0, p.stock_quantity - 5) })
                            }
                            title="Decrement stock by 5"
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                          >
                            -5
                          </button>
                          <button
                            onClick={() =>
                              onUpdateProduct({ ...p, stock_quantity: p.stock_quantity + 5 })
                            }
                            title="Increment stock by 5"
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {p.stock_quantity === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Out of Stock
                        </span>
                      ) : p.stock_quantity <= 10 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Low: {p.stock_quantity}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => startEdit(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirm deletion of SKU: ${p.sku}? This executes DELETE FROM products WHERE product_id = ${p.product_id}`)) {
                              onDeleteProduct(p.product_id);
                              showFlash(`Product #${p.product_id} (${p.sku}) removed.`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders View */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-mono">Order ID</th>
                <th className="py-3.5 px-4">Customer Email</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((o) => (
                <tr key={o.order_id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono font-bold text-sky-400">#{o.order_id}</td>
                  <td className="py-3 px-4">{o.user_email}</td>
                  <td className="py-3 px-4 font-mono">{o.items_count} units</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    ${o.total_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{o.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Users View */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-mono">User ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">System Role</th>
                <th className="py-3.5 px-4">Password Hash Storage</th>
                <th className="py-3.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/50">
                  <td className="py-3 px-4 font-mono text-slate-400">#{u.id}</td>
                  <td className="py-3 px-4 font-semibold text-white">{u.fullName}</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>
                  <td className="py-3 px-4">
                    {u.role === 'ADMIN' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                        ROLE: ADMIN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono">
                        ROLE: CUSTOMER
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    PBKDF2-HMAC-SHA256 (Salted)
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{u.createdAt || '2026-03-01'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add or Edit IoT Component */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? `Edit Component #${editingProduct.product_id}` : 'Add New IoT Component / Sensor'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={editingProduct ? handleEditSubmit : handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. BMP388 Pressure Sensor"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. MM-SEN-BMP388"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Product['category'])}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Sensors">Sensors</option>
                    <option value="Dev Boards">Dev Boards</option>
                    <option value="Wireless & IoT">Wireless & IoT</option>
                    <option value="Actuators & Power">Actuators & Power</option>
                    <option value="Prototyping Gear">Prototyping Gear</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Price ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Operating Voltage</label>
                  <input
                    type="text"
                    value={formVoltage}
                    onChange={(e) => setFormVoltage(e.target.value)}
                    placeholder="e.g. 3.3V - 5.0V DC"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Data Bus / Interface</label>
                  <input
                    type="text"
                    value={formInterface}
                    onChange={(e) => setFormInterface(e.target.value)}
                    placeholder="e.g. I2C (0x76), SPI"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Hardware Description</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Technical specifications, microcontroller core, communication protocol..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  {editingProduct ? 'Update Product in DB' : 'Insert into magamart_db'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
