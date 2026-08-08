const ORDERS_STORAGE_KEY = 'smartpo_orders';
const DELETED_ORDERS_KEY = 'smartpo_deleted_orders';

const DEFAULT_SEED_ORDERS = [
  {
    id: 'ord_demo_101',
    order_number: 'PO-784192',
    customer_name: 'Ramesh Kumar',
    company_name: 'Industrial Tech Solutions',
    customer_phone: '+91 98765 43210',
    customer_address: 'Plot 42, Industrial Area, Sector 5, New Delhi',
    total_amount: 14500,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'completed',
    items: [
      { id: 'it_1', product_name: 'Stainless Steel Bolt M10', quantity: 200, unit_price: 35, total_price: 7000, unit: 'pcs' },
      { id: 'it_2', product_name: 'Industrial Heavy Duty Washer', quantity: 500, unit_price: 15, total_price: 7500, unit: 'pcs' }
    ]
  },
  {
    id: 'ord_demo_102',
    order_number: 'PO-920415',
    customer_name: 'Anita Sharma',
    company_name: 'Apex Manufacturing Co.',
    customer_phone: '+91 91234 56789',
    customer_address: 'B-12, Electronic City, Bengaluru',
    total_amount: 28900,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'completed',
    items: [
      { id: 'it_3', product_name: 'Copper Wire Spool 2.5mm', quantity: 10, unit_price: 1890, total_price: 18900, unit: 'roll' },
      { id: 'it_4', product_name: 'High Voltage Circuit Breaker', quantity: 2, unit_price: 5000, total_price: 10000, unit: 'pcs' }
    ]
  }
];

export function getDeletedOrderIds() {
  try {
    const data = localStorage.getItem(DELETED_ORDERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to parse deleted orders list', e);
  }
  return new Set();
}

export function getOrders() {
  return getLocalOrders();
}

export function getLocalOrders() {
  const deletedSet = getDeletedOrderIds();
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (data !== null) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.filter(o => !deletedSet.has(String(o.id)) && !deletedSet.has(String(o.order_number)));
      }
    }
  } catch (e) {
    console.warn('Failed to parse local orders', e);
  }

  const initialSeed = DEFAULT_SEED_ORDERS.filter(o => !deletedSet.has(String(o.id)) && !deletedSet.has(String(o.order_number)));
  saveLocalOrders(initialSeed);
  return initialSeed;
}

export function saveLocalOrders(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('Failed to save local orders', e);
  }
}

export function addLocalOrder(newOrder) {
  const current = getLocalOrders();
  const updated = [newOrder, ...current.filter(o => o.id !== newOrder.id && o.order_number !== newOrder.order_number)];
  saveLocalOrders(updated);
  return updated;
}

export function updateLocalOrder(updatedOrder) {
  const current = getLocalOrders();
  const index = current.findIndex(o => o.id === updatedOrder.id || o.order_number === updatedOrder.order_number);
  if (index !== -1) {
    current[index] = { ...current[index], ...updatedOrder };
    saveLocalOrders(current);
  } else {
    saveLocalOrders([updatedOrder, ...current]);
  }
  return getLocalOrders();
}

export function deleteLocalOrder(orderId) {
  const deletedSet = getDeletedOrderIds();
  deletedSet.add(String(orderId));

  const current = getLocalOrders();
  const target = current.find(o => o.id === orderId || o.order_number === orderId);
  if (target) {
    if (target.id) deletedSet.add(String(target.id));
    if (target.order_number) deletedSet.add(String(target.order_number));
  }

  try {
    localStorage.setItem(DELETED_ORDERS_KEY, JSON.stringify(Array.from(deletedSet)));
  } catch (e) {
    console.warn('Failed to save deleted order id', e);
  }

  const filtered = current.filter(o => o.id !== orderId && o.order_number !== orderId);
  saveLocalOrders(filtered);
  return filtered;
}
