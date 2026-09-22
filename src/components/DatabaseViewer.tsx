import React, { useState } from 'react';
import { Product, User, Order } from '../types';
import { Database, Play, Terminal, Table, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface DatabaseViewerProps {
  products: Product[];
  users: User[];
  orders: Order[];
}

export const DatabaseViewer: React.FC<DatabaseViewerProps> = ({
  products,
  users,
  orders,
}) => {
  const [activeTable, setActiveTable] = useState<'products' | 'users' | 'orders'>('products');
  const [customQuery, setCustomQuery] = useState('SELECT * FROM products WHERE stock_quantity <= 15;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[]; executionTime: string } | null>(null);

  const sampleQueries = [
    {
      title: 'Low Stock Sensors & IoT Boards',
      sql: 'SELECT product_id, sku, name, stock_quantity, price FROM products WHERE stock_quantity <= 15 ORDER BY stock_quantity ASC;',
    },
    {
      title: 'All Registered Users & Roles',
      sql: 'SELECT id, email, full_name, role, created_at FROM users ORDER BY id ASC;',
    },
    {
      title: 'Catalog Aggregation by Category',
      sql: 'SELECT category, COUNT(*) AS total_skus, AVG(price) AS avg_price, SUM(stock_quantity) AS total_inventory FROM products GROUP BY category;',
    },
    {
      title: 'Recent Customer Orders',
      sql: 'SELECT order_id, user_email, total_amount, status, created_at FROM orders ORDER BY order_id DESC;',
    },
  ];

  const executeQuery = (queryToRun: string = customQuery) => {
    const q = queryToRun.trim().toLowerCase();
    const startTime = performance.now();

    if (q.includes('from users')) {
      const rows = users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        password_hash: 'PBKDF2-HMAC-SHA256:65536:salt...',
        created_at: u.createdAt || '2026-03-01',
      }));
      const endTime = performance.now();
      setQueryResult({
        columns: ['id', 'email', 'full_name', 'role', 'password_hash', 'created_at'],
        rows,
        executionTime: `${(endTime - startTime + 1.2).toFixed(2)} ms`,
      });
    } else if (q.includes('group by category')) {
      const categoryMap: Record<string, { count: number; sumPrice: number; sumStock: number }> = {};
      products.forEach(p => {
        if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, sumPrice: 0, sumStock: 0 };
        categoryMap[p.category].count += 1;
        categoryMap[p.category].sumPrice += p.price;
        categoryMap[p.category].sumStock += p.stock_quantity;
      });

      const rows = Object.entries(categoryMap).map(([cat, val]) => ({
        category: cat,
        total_skus: val.count,
        avg_price: `$${(val.sumPrice / val.count).toFixed(2)}`,
        total_inventory: `${val.sumStock} units`,
      }));

      const endTime = performance.now();
      setQueryResult({
        columns: ['category', 'total_skus', 'avg_price', 'total_inventory'],
        rows,
        executionTime: `${(endTime - startTime + 0.9).toFixed(2)} ms`,
      });
    } else if (q.includes('from orders')) {
      const rows = orders.map(o => ({
        order_id: o.order_id,
        user_email: o.user_email,
        total_amount: `$${o.total_amount.toFixed(2)}`,
        items_count: o.items_count,
        status: o.status,
        created_at: o.created_at,
      }));
      const endTime = performance.now();
      setQueryResult({
        columns: ['order_id', 'user_email', 'total_amount', 'items_count', 'status', 'created_at'],
        rows,
        executionTime: `${(endTime - startTime + 1.1).toFixed(2)} ms`,
      });
    } else {
      // Default products query with filter if <= 15
      let filtered = products;
      if (q.includes('stock_quantity <= 15') || q.includes('stock_quantity <=')) {
        filtered = products.filter(p => p.stock_quantity <= 15);
      }
      const rows = filtered.map(p => ({
        product_id: p.product_id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        price: `$${p.price.toFixed(2)}`,
        stock_quantity: p.stock_quantity,
      }));
      const endTime = performance.now();
      setQueryResult({
        columns: ['product_id', 'sku', 'name', 'category', 'price', 'stock_quantity'],
        rows,
        executionTime: `${(endTime - startTime + 1.4).toFixed(2)} ms`,
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Database className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs text-sky-400 font-bold uppercase tracking-wider">
              MySQL 8.0 Engine • InnoDB
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
              Database: magamart_db
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">magamart_db Schema & Query Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time representation of tables accessed by <code>DBUtil.java</code>, <code>UserDAO.java</code>, and <code>ProductDAO.java</code>.
          </p>
        </div>
      </div>

      {/* SQL Interactive Query Runner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>Interactive SQL Console</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">JDBC Connection: ACTIVE</span>
        </div>

        {/* Quick query templates */}
        <div className="flex flex-wrap gap-2">
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomQuery(sq.sql);
                executeQuery(sq.sql);
              }}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
            >
              {sq.title}
            </button>
          ))}
        </div>

        {/* Textarea for SQL */}
        <div className="relative">
          <textarea
            rows={2}
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Bound with PreparedStatement parameters
          </span>
          <button
            onClick={() => executeQuery(customQuery)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Execute Query
          </button>
        </div>

        {/* Query Output Display */}
        {queryResult && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="text-emerald-400 font-bold">✓ {queryResult.rows.length} rows returned</span>
              <span>Query Time: {queryResult.executionTime}</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    {queryResult.columns.map((col) => (
                      <th key={col} className="py-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#0b0f19]">
                  {queryResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      {queryResult.columns.map((col) => (
                        <td key={col} className="py-2 px-3 truncate max-w-xs">{String(row[col])}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Raw Table Browsers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Browse Table Data
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTable('products')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTable === 'products'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              products ({products.length})
            </button>
            <button
              onClick={() => setActiveTable('users')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTable === 'users'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              users ({users.length})
            </button>
            <button
              onClick={() => setActiveTable('orders')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                activeTable === 'orders'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              orders ({orders.length})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTable === 'products' && (
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">product_id</th>
                  <th className="py-3 px-3.5">sku</th>
                  <th className="py-3 px-3.5">name</th>
                  <th className="py-3 px-3.5">category</th>
                  <th className="py-3 px-3.5">price</th>
                  <th className="py-3 px-3.5">stock_quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3.5 text-slate-500">#{p.product_id}</td>
                    <td className="py-2.5 px-3.5 text-sky-400">{p.sku}</td>
                    <td className="py-2.5 px-3.5 font-sans font-medium text-white">{p.name}</td>
                    <td className="py-2.5 px-3.5 text-slate-400">{p.category}</td>
                    <td className="py-2.5 px-3.5 text-emerald-400">${p.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3.5 font-bold text-white">{p.stock_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'users' && (
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">id</th>
                  <th className="py-3 px-3.5">email</th>
                  <th className="py-3 px-3.5">password</th>
                  <th className="py-3 px-3.5">full_name</th>
                  <th className="py-3 px-3.5">role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3.5 text-slate-500">#{u.id}</td>
                    <td className="py-2.5 px-3.5 text-sky-300">{u.email}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 text-[11px] truncate max-w-xs">
                      $pbkdf2-sha256$65536$salt_xyz$...
                    </td>
                    <td className="py-2.5 px-3.5 font-sans font-medium text-white">{u.fullName}</td>
                    <td className="py-2.5 px-3.5">
                      <span className={u.role === 'ADMIN' ? 'text-amber-400 font-bold' : 'text-sky-400'}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'orders' && (
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">order_id</th>
                  <th className="py-3 px-3.5">user_id</th>
                  <th className="py-3 px-3.5">customer_email</th>
                  <th className="py-3 px-3.5">total_amount</th>
                  <th className="py-3 px-3.5">status</th>
                  <th className="py-3 px-3.5">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3.5 text-sky-400 font-bold">#{o.order_id}</td>
                    <td className="py-2.5 px-3.5 text-slate-500">#{o.user_id}</td>
                    <td className="py-2.5 px-3.5 text-slate-200">{o.user_email}</td>
                    <td className="py-2.5 px-3.5 text-emerald-400">${o.total_amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="text-emerald-400 font-bold">{o.status}</span>
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500">{o.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
