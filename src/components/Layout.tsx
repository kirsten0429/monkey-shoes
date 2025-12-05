import React from 'react';
import { ClipboardList, PlusCircle, Users, BarChart3, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  
  const navItems = [
    { id: 'form', icon: PlusCircle, label: '接單' },
    { id: 'list', icon: ClipboardList, label: '訂單' },
    { id: 'customers', icon: Users, label: '客群' },
    { id: 'stats', icon: BarChart3, label: '報表' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header */}
      <header className="bg-ikea-blue text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-ikea-yellow text-2xl">●</span> 猴子洗鞋
        </h1>
        <button 
          onClick={() => onTabChange('settings')}
          className="p-2 rounded-full hover:bg-blue-700 transition"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-20">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center py-3 px-2 w-full transition-colors ${
                  isActive ? 'text-ikea-blue' : 'text-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};