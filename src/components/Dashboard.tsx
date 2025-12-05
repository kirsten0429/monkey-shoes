import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getOrders } from '../services/storage';

type TimeRange = 'WEEK' | 'MONTH' | 'YEAR';

export const Dashboard: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('WEEK');
  const orders = getOrders();

  const stats = useMemo(() => {
    const now = new Date();
    const data: Record<string, number> = {};
    
    orders.forEach(order => {
      const d = new Date(order.createdAt);
      let key = '';

      if (range === 'WEEK') {
        // Last 7 days logic
        key = d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
      } else if (range === 'MONTH') {
        key = `Week ${Math.ceil(d.getDate() / 7)}`;
      } else {
        key = d.toLocaleDateString('zh-TW', { month: 'short' });
      }
      
      data[key] = (data[key] || 0) + order.totalAmount;
    });

    // Transform for Recharts
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [orders, range]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-ikea-blue text-white p-5 rounded-2xl shadow-md">
          <div className="text-sm opacity-80 mb-1">總營收</div>
          <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-white text-ikea-dark border border-gray-200 p-5 rounded-2xl shadow-sm">
          <div className="text-sm text-gray-500 mb-1">總接單數</div>
          <div className="text-2xl font-bold">{totalOrders} <span className="text-sm font-normal">單</span></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800">營收趨勢</h3>
          <select 
            value={range} 
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="bg-gray-50 border border-gray-200 rounded-lg text-sm p-1 outline-none"
          >
            <option value="WEEK">本週</option>
            <option value="MONTH">本月</option>
            <option value="YEAR">年度</option>
          </select>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                cursor={{fill: '#f5f5f5'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {stats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0051ba' : '#ffda1a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};