import type { Order, Customer } from '../types';

const ORDERS_KEY = 'monkey_shoe_orders';
const CUSTOMERS_KEY = 'monkey_shoe_customers';

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  const newOrders = [order, ...orders];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
  updateCustomerStats(order);
};

export const updateOrder = (updatedOrder: Order): void => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === updatedOrder.id);
  if (index !== -1) {
    orders[index] = updatedOrder;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }
};

export const deleteOrder = (orderId: string): void => {
  const orders = getOrders();
  const orderToDelete = orders.find(o => o.id === orderId);

  // 同步更新客群資料：扣除次數與金額
  if (orderToDelete) {
    const customers = getCustomers();
    const customerIndex = customers.findIndex(c => c.phone === orderToDelete.customerPhone);
    
    if (customerIndex !== -1) {
      // 確保不會變成負數
      const newVisitCount = Math.max(0, customers[customerIndex].visitCount - 1);
      const newTotalSpent = Math.max(0, customers[customerIndex].totalSpent - orderToDelete.totalAmount);

      customers[customerIndex] = {
        ...customers[customerIndex],
        visitCount: newVisitCount,
        totalSpent: newTotalSpent
      };
      
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
    }
  }

  // 刪除訂單
  const newOrders = orders.filter(o => o.id !== orderId);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
};

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to auto-update customer stats/VIP status
const updateCustomerStats = (order: Order) => {
  let customers = getCustomers();
  let customer = customers.find(c => c.phone === order.customerPhone);

  if (!customer) {
    customer = {
      id: Date.now().toString(),
      name: order.customerName,
      phone: order.customerPhone,
      isVip: false,
      totalSpent: 0,
      visitCount: 0
    };
    customers.push(customer);
  } else {
    // Update name if changed
    customer.name = order.customerName;
  }

  customer.visitCount += 1;
  customer.totalSpent += order.totalAmount;
  
  // Auto VIP logic: More than 5 visits
  if (customer.visitCount >= 5) {
    customer.isVip = true;
  }

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const toggleManualVip = (phone: string) => {
  const customers = getCustomers();
  const customer = customers.find(c => c.phone === phone);
  if (customer) {
    customer.isVip = !customer.isVip;
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }
};

export const exportData = () => {
  const data = {
    orders: getOrders(),
    customers: getCustomers(),
    backupDate: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `monkey_shoe_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (jsonData: string) => {
  try {
    const data = JSON.parse(jsonData);
    if (data.orders) localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
    if (data.customers) localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(data.customers));
    alert('資料還原成功！請重新整理頁面。');
    window.location.reload();
  } catch (e) {
    alert('資料格式錯誤，無法還原');
  }
};