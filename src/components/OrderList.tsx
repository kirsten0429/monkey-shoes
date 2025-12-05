import type { Order, PaymentMethod } from '../types';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, CheckCircle, XCircle, DollarSign, Image as ImageIcon, ShoppingBag, CalendarCheck, Wallet, Trash2 } from 'lucide-react';
import { getOrders, updateOrder, deleteOrder } from '../services/storage';

export const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'UNPAID' | 'UNPICKED'>('ALL');
  
  // Swipe Logic States
  const [swipedOrderId, setSwipedOrderId] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const togglePayment = (order: Order) => {
    const updated = { ...order, isPaid: !order.isPaid };
    updateOrder(updated);
    setOrders(getOrders()); // Refresh
  };

  const togglePaymentMethod = (order: Order) => {
    const newMethod: PaymentMethod = order.paymentMethod === 'CASH' ? 'LINE_PAY' : 'CASH';
    const updated = { ...order, paymentMethod: newMethod };
    updateOrder(updated);
    setOrders(getOrders());
  };

  const togglePickup = (order: Order) => {
    const updated = {
      ...order,
      pickupDate: order.pickupDate ? undefined : Date.now() // Toggle: Set date or remove it
    };
    updateOrder(updated);
    setOrders(getOrders());
  };

  const handleDelete = (id: string) => {
    if (window.confirm('確定要刪除此筆訂單嗎？刪除後無法復原。')) {
      deleteOrder(id);
      setOrders(getOrders());
      setSwipedOrderId(null);
    }
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, id: string) => {
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;

    // 左滑超過 50px 視為開啟刪除
    if (distance > 50) {
      setSwipedOrderId(id);
    } 
    // 右滑超過 50px 視為關閉
    else if (distance < -50) {
      if (swipedOrderId === id) {
        setSwipedOrderId(null);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchSearch = 
      order.customerName.includes(searchTerm) || 
      order.customerPhone.includes(searchTerm);
      
    let matchFilter = true;
    if (filter === 'UNPAID') matchFilter = !order.isPaid;
    if (filter === 'UNPICKED') matchFilter = !order.pickupDate;
    
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        <div className="relative shadow-sm mb-3">
          <input
            type="text"
            placeholder="搜尋姓名或電話..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-ikea-blue focus:ring-2 focus:ring-ikea-blue/20 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === 'ALL' ? 'bg-ikea-dark text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('UNPAID')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === 'UNPAID' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            未付款
          </button>
          <button
            onClick={() => setFilter('UNPICKED')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              filter === 'UNPICKED' ? 'bg-ikea-blue text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            未取件
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3 pb-20 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-50" />
            <p>沒有找到訂單</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="relative group">
              {/* Delete Button Layer (Behind) */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-xl flex items-center justify-center z-0">
                <button 
                  onClick={() => handleDelete(order.id)}
                  className="w-full h-full flex items-center justify-center text-white"
                >
                  <Trash2 size={24} />
                </button>
              </div>

              {/* Card Content Layer (Foreground) */}
              <div 
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, order.id)}
                className={`bg-white rounded-xl p-4 shadow-sm border relative z-10 transition-transform duration-300 ease-out ${
                  order.pickupDate ? 'border-gray-200 opacity-75' : 'border-gray-100'
                }`}
                style={{
                  transform: swipedOrderId === order.id ? 'translateX(-5rem)' : 'translateX(0)'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg text-ikea-dark">{order.customerName}</div>
                    <div className="text-gray-500 text-sm font-mono">{order.customerPhone}</div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <CalendarCheck size={12} />
                      接單: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     {/* 付款狀態按鈕 */}
                     <button
                      onClick={(e) => { e.stopPropagation(); togglePayment(order); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
                        order.isPaid 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-red-100 text-red-600 border border-red-200'
                      }`}
                    >
                      {order.isPaid ? <CheckCircle size={12}/> : <XCircle size={12}/>}
                      {order.isPaid ? '已付款' : '未付款'}
                    </button>
                    
                    {/* 取件狀態按鈕 */}
                    <button
                      onClick={(e) => { e.stopPropagation(); togglePickup(order); }}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
                        order.pickupDate
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-ikea-yellow text-ikea-blue'
                      }`}
                    >
                      <ShoppingBag size={12} />
                      {order.pickupDate ? '已取件' : '待取件'}
                    </button>
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
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                       {order.photoPreview && (
                         <div className="relative group">
                            <ImageIcon size={20} className="text-gray-400" />
                         </div>
                       )}
                       
                       {/* 可切換的付款方式按鈕 */}
                       <button 
                         onClick={(e) => { e.stopPropagation(); togglePaymentMethod(order); }}
                         className={`text-xs px-2 py-0.5 rounded h-fit flex items-center gap-1 border transition hover:bg-gray-200 ${
                           order.paymentMethod === 'LINE_PAY' 
                             ? 'bg-[#00c300]/10 text-[#00c300] border-[#00c300]/30' 
                             : 'bg-gray-100 text-gray-600 border-gray-200'
                         }`}
                       >
                          <Wallet size={10} />
                          {order.paymentMethod === 'CASH' ? '現金' : 'LinePay'}
                       </button>
                    </div>
                    {order.pickupDate && (
                      <span className="text-[10px] text-gray-400">
                        取件日: {new Date(order.pickupDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-ikea-blue font-bold text-xl">
                    <DollarSign size={18} />
                    {order.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};