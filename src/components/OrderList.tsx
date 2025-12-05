import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle, XCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import type { Order } from '../types';
import { getOrders, updateOrder } from '../services/storage';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNPAID'>('ALL');

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const togglePayment = (order: Order) => {
    const updated = { ...order, isPaid: !order.isPaid };
    updateOrder(updated);
    setOrders(getOrders()); // Refresh
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customerName.includes(searchTerm) || 
      order.customerPhone.includes(searchTerm);
    const matchFilter = filter === 'ALL' || (filter === 'UNPAID' && !order.isPaid);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        <div className="relative shadow-sm">
          <input
            type="text"
            placeholder="搜尋姓名或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-ikea-blue focus:ring-2 focus:ring-ikea-blue/20 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === 'ALL' ? 'bg-ikea-dark text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('UNPAID')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === 'UNPAID' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            未付款
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 pb-20">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>沒有找到訂單</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-lg text-ikea-dark">{order.customerName}</div>
                  <div className="text-gray-500 text-sm font-mono">{order.customerPhone}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <button
                    onClick={() => togglePayment(order)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
                      order.isPaid 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-600 border border-red-200'
                    }`}
                  >
                    {order.isPaid ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                    {order.isPaid ? '已付款' : '未付'}
                  </button>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {order.paymentMethod === 'CASH' ? '現金' : 'LinePay'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-2 pt-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>• {item.name || '未命名'}</span>
                    <span className="font-mono">${item.price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-gray-200">
                <div className="flex gap-2">
                   {order.photoPreview && (
                     <div className="relative group">
                        <ImageIcon size={20} className="text-gray-400" />
                        {/* Tooltip-ish preview for desktop, click needed for mobile really, but simple icon indicates photo exists */}
                     </div>
                   )}
                </div>
                <div className="flex items-center gap-1 text-ikea-blue font-bold text-xl">
                  <DollarSign size={18} />
                  {order.totalAmount}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};