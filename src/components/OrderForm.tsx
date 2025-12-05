import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Trash2, Save } from 'lucide-react';
import { OrderItem, PaymentMethod } from '../types';
import { saveOrder, getCustomers } from '../services/storage';

// 常見品牌與顏色清單
const BRANDS = ['Nike', 'Adidas', 'New Balance', 'Jordan', 'Converse', 'Puma', 'Asics', 'Mizuno', 'Skechers', 'Crocs', 'Birkenstock', 'Timberland'];
const COLORS = ['白', '黑', '灰', '紅', '藍', '綠', '黃', '粉', '全白', '全黑', '多色'];

export const OrderForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState<OrderItem[]>([{ id: '1', name: '', price: 250 }]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isPaid, setIsPaid] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{name: string, phone: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone autocomplete logic
  useEffect(() => {
    if (phone.length > 2) {
      const allCustomers = getCustomers();
      const matches = allCustomers.filter(c => c.phone.includes(phone)).slice(0, 3);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [phone]);

  const handleSelectCustomer = (c: {name: string, phone: string}) => {
    setName(c.name);
    setPhone(c.phone);
    setSuggestions([]);
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 250 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof OrderItem, value: string | number) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // 處理快捷選單選擇，將文字附加到名稱後
  const handleQuickSelect = (id: string, value: string) => {
    if (!value) return;
    setItems(items.map(i => {
      if (i.id === id) {
        // 如果原本是空的，直接填入；如果有字，則加空白後填入
        const newName = i.name ? `${i.name} ${value}` : value;
        return { ...i, name: newName };
      }
      return i;
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalCount = items.length;

  const handleSubmit = () => {
    if (!name || !phone) {
      alert('請填寫顧客姓名與電話');
      return;
    }

    const order = {
      id: Date.now().toString(),
      customerName: name,
      customerPhone: phone,
      items,
      totalAmount,
      isPaid,
      paymentMethod,
      createdAt: Date.now(),
      photoPreview: photoPreview || undefined
    };

    saveOrder(order);
    alert('接單成功！');
    
    // Reset form
    setName('');
    setPhone('');
    setItems([{ id: Date.now().toString(), name: '', price: 250 }]);
    setIsPaid(false);
    setPhotoPreview(null);
    onSuccess();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-ikea-dark border-b pb-2">新增接單</h2>
      
      {/* Customer Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼</label>
          <div className="relative">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ikea-blue focus:border-ikea-blue outline-none transition"
              placeholder="0912345678"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                {suggestions.map(s => (
                  <div 
                    key={s.phone} 
                    onClick={() => handleSelectCustomer(s)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 flex justify-between"
                  >
                    <span>{s.name}</span>
                    <span className="text-gray-500 text-sm">{s.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">顧客姓名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ikea-blue outline-none"
            placeholder="王小明"
          />
        </div>
      </div>

      {/* Items */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">清洗項目 ({items.length})</label>
          <button onClick={addItem} className="text-ikea-blue text-sm font-bold flex items-center bg-blue-50 px-3 py-1 rounded-full">
            <Plus size={16} className="mr-1" /> 新增鞋子
          </button>
        </div>
        
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-100">#{index + 1}</span>
                <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* 快捷選單 Row */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select 
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-ikea-blue outline-none"
                  value="" 
                  onChange={(e) => handleQuickSelect(item.id, e.target.value)}
                >
                  <option value="" disabled>選擇品牌...</option>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <select 
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-ikea-blue outline-none"
                  value=""
                  onChange={(e) => handleQuickSelect(item.id, e.target.value)}
                >
                  <option value="" disabled>選擇顏色...</option>
                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              {/* 主要輸入區 Row */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg text-base focus:ring-1 focus:ring-ikea-blue outline-none"
                    placeholder="品項名稱 (可手動輸入)"
                  />
                </div>
                <div className="w-24 relative">
                  <span className="absolute left-2 top-2.5 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))}
                    className="w-full p-2.5 pl-6 border border-gray-300 rounded-lg text-base text-right font-medium focus:ring-1 focus:ring-ikea-blue outline-none"
                    placeholder="250"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo & Payment */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition h-32 relative overflow-hidden"
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <Camera className="text-gray-400 mb-2" size={24} />
              <span className="text-xs text-gray-500">上傳照片</span>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">總金額 ({totalCount}雙)</label>
            <div className="text-2xl font-bold text-ikea-blue">${totalAmount}</div>
          </div>
          
          <div className="mt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">付款狀態</label>
             <button
              onClick={() => setIsPaid(!isPaid)}
              className={`w-full mt-1 py-1 px-2 rounded text-sm font-medium border ${
                isPaid 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {isPaid ? '已付款' : '未付款'}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">付款方式</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('CASH')}
            className={`p-3 rounded-lg border font-medium transition ${
              paymentMethod === 'CASH' 
                ? 'bg-ikea-blue text-white border-ikea-blue shadow-md' 
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            現金
          </button>
          <button
            onClick={() => setPaymentMethod('LINE_PAY')}
            className={`p-3 rounded-lg border font-medium transition ${
              paymentMethod === 'LINE_PAY' 
                ? 'bg-[#00c300] text-white border-[#00c300] shadow-md' 
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            Line Pay
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-ikea-yellow text-ikea-blue font-bold text-lg py-4 rounded-xl shadow-lg hover:brightness-105 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
      >
        <Save size={24} />
        確認接單
      </button>
    </div>
  );
};