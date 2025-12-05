import React, { useState, useRef } from 'react';
import { Layout } from './components/Layout';
import { OrderForm } from './components/OrderForm';
import { OrderList } from './components/OrderList';
import { CustomerList } from './components/CustomerList';
import { Dashboard } from './components/Dashboard';
import { exportData, importData } from './services/storage';
import { Download, Upload, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        importData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'form':
        return <OrderForm onSuccess={() => setActiveTab('list')} />;
      case 'list':
        return <OrderList />;
      case 'customers':
        return <CustomerList />;
      case 'stats':
        return <Dashboard />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="text-ikea-yellow" />
              資料備份與還原
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              由於本系統沒有連線伺服器，所有資料皆儲存在此手機/電腦瀏覽器中。請定期下載備份檔，以免清除瀏覽器紀錄後資料遺失。
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={exportData}
                className="w-full flex items-center justify-center gap-2 bg-ikea-blue text-white py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition"
              >
                <Download size={20} />
                下載資料備份 (JSON)
              </button>

              <div className="relative">
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
                >
                  <Upload size={20} />
                  還原備份資料
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
              Monkey Shoe Cleaning App v1.0
            </div>
          </div>
        );
      default:
        return <OrderForm onSuccess={() => setActiveTab('list')} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;