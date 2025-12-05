import React, { useState, useEffect } from 'react';
import { Search, Star, User } from 'lucide-react';
import type { Customer } from '../types';
import { getCustomers, toggleManualVip } from '../services/storage';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const handleToggleVip = (phone: string) => {
    toggleManualVip(phone);
    setCustomers(getCustomers());
  };

  const filtered = customers.filter(c => 
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="搜尋客群..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:border-ikea-blue focus:ring-2 outline-none"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="grid gap-3 pb-20">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                customer.isVip ? 'bg-ikea-yellow text-ikea-blue' : 'bg-gray-100 text-gray-500'
              }`}>
                {customer.isVip ? <Star fill="#0051ba" size={20}/> : <User size={20}/>}
              </div>
              <div>
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {customer.name}
                  {customer.isVip && <span className="text-[10px] bg-ikea-blue text-white px-1.5 py-0.5 rounded">VIP</span>}
                </div>
                <div className="text-sm text-gray-500 font-mono">{customer.phone}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-400">消費次數</div>
              <div className="font-bold text-lg">{customer.visitCount}</div>
              <button 
                onClick={() => handleToggleVip(customer.phone)}
                className="text-xs text-ikea-blue underline mt-1"
              >
                {customer.isVip ? '取消VIP' : '設為VIP'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};