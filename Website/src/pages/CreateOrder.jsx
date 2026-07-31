import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase, fetchCatalogProducts } from '../lib/supabase';
import { addLocalOrder } from '../lib/orderStore';
import { 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Search, 
  Plus, 
  Minus, 
  ShoppingCart,
  Receipt,
  Building
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);

  // Step 1 State
  const [poNumber, setPoNumber] = useState(`PO-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customerName, setCustomerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2 State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadProducts();

    if (location.state?.prefilledItems) {
      const initialCart = {};
      location.state.prefilledItems.forEach(item => {
        if (item.itemId) initialCart[item.itemId] = item.quantity || 1;
      });
      setCart(initialCart);
      if (location.state?.customerName) {
        setCustomerName(location.state.customerName);
      }
      setStep(2);
    }
  }, [location.state]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    const data = await fetchCatalogProducts();
    setProducts(data);
    setLoadingProducts(false);
  };

  const updateCartQty = (productId, change) => {
    setCart(prev => {
      const current = prev[productId] || 0;
      const updated = Math.max(0, current + change);
      if (updated === 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: updated };
    });
  };

  const calculateTotal = () => {
    let total = 0;
    products.forEach(p => {
      const qty = cart[p.id] || 0;
      total += qty * (p.price_per_kg || p.price || 0);
    });
    return total;
  };

  const getCartItemsList = () => {
    return products.filter(p => (cart[p.id] || 0) > 0).map(p => ({
      product: p,
      quantity: cart[p.id],
      unitPrice: p.price_per_kg || p.price || 0,
      total: cart[p.id] * (p.price_per_kg || p.price || 0)
    }));
  };

  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault();
    const totalAmount = calculateTotal();
    const cartItems = getCartItemsList();

    if (cartItems.length === 0) {
      alert("Please select at least one product before submitting.");
      return;
    }

    setSubmitting(true);
    const orderId = crypto.randomUUID ? crypto.randomUUID() : `ord_${Date.now()}`;

    const itemsPayload = cartItems.map((item, idx) => ({
      id: `it_${Date.now()}_${idx}`,
      order_id: orderId,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.total,
      unit: item.product.unit || 'pcs'
    }));

    const newOrderObj = {
      id: orderId,
      order_number: poNumber,
      customer_name: customerName,
      company_name: companyName || 'SmartPO Industrial Corp',
      customer_phone: customerPhone,
      customer_address: customerAddress,
      total_amount: totalAmount,
      notes: notes,
      created_at: new Date().toISOString(),
      status: 'completed',
      items: itemsPayload
    };

    // Save to local storage first for 100% immediate reliability
    addLocalOrder(newOrderObj);

    // Also attempt Supabase sync
    try {
      await supabase.from('orders').insert([
        {
          id: orderId,
          order_number: poNumber,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          total_amount: totalAmount,
          notes: notes
        }
      ]);

      await supabase.from('order_items').insert(itemsPayload.map(it => ({
        order_id: it.order_id,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.total_price,
        unit: it.unit
      })));
    } catch (err) {
      console.warn("Cloud sync deferred; local order saved cleanly", err);
    }

    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      navigate('/orders');
    }, 1200);
  };

  if (success) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '3.5rem', maxWidth: '500px' }}>
          <CheckCircle size={64} color="var(--secondary)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Order Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Purchase Order <strong>{poNumber}</strong> has been saved and created successfully.
          </p>
          <span className="badge badge-success">Redirecting to Order History...</span>
        </div>
      </div>
    );
  }

  const selectedItemsCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in">
        
        {/* Wizard Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Create Purchase Order</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Build a new purchase order for your customer.</p>
          </div>

          {/* Steps Indicator */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {['1. Customer Details', '2. Select Products', '3. Review & Submit'].map((label, idx) => {
              const currentStep = idx + 1;
              const active = step === currentStep;
              const done = step > currentStep;
              return (
                <div key={label} style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: active ? 700 : 500,
                  backgroundColor: active ? 'rgba(79, 70, 229, 0.25)' : done ? 'rgba(16, 185, 129, 0.15)' : 'var(--surface)',
                  color: active ? '#818CF8' : done ? '#34D399' : 'var(--text-muted)',
                  border: active ? '1px solid var(--primary)' : '1px solid var(--border)'
                }}>
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: Customer Details */}
        {step === 1 && (
          <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="var(--primary)" />
              <span>Step 1: Customer & Order Details</span>
            </h3>

            <div className="form-group">
              <label className="form-label">PO Number (Auto-Generated)</label>
              <div style={{ position: 'relative' }}>
                <Receipt size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="text" className="form-input" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} style={{ paddingLeft: '2.75rem', fontWeight: 700 }} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="text" className="form-input" placeholder="e.g. Ramesh Kumar" style={{ paddingLeft: '2.75rem' }} value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="text" className="form-input" placeholder="e.g. Ramesh Trading Corp" style={{ paddingLeft: '2.75rem' }} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="tel" className="form-input" placeholder="+91 98765 43210" style={{ paddingLeft: '2.75rem' }} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
                <textarea className="form-input" rows="2" placeholder="Warehouse address..." style={{ paddingLeft: '2.75rem' }} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Order Notes</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-dim)' }} />
                <textarea className="form-input" rows="2" placeholder="Special delivery instructions..." style={{ paddingLeft: '2.75rem' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}
              onClick={() => {
                if (!customerName.trim()) {
                  alert('Please enter a Customer Name.');
                  return;
                }
                setStep(2);
              }}
            >
              <span>Next: Select Items</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: Item Selection */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
            
            {/* Catalog Selector */}
            <div>
              <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search catalog items to add..." 
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Select Products from Catalog</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={() => navigate('/ai-assistant')}>
                    <Sparkles size={14} color="#818CF8" />
                    <span>Auto-Parse with AI</span>
                  </button>
                </div>

                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {products
                    .filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((p) => {
                      const qty = cart[p.id] || 0;
                      return (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.name}</h4>
                            <span style={{ fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 700 }}>
                              ₹{Number(p.price_per_kg || p.price || 0).toLocaleString()} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {p.unit || 'pcs'}</span>
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button className="btn btn-icon" style={{ background: 'var(--surface-hover)', width: '32px', height: '32px' }} onClick={() => updateCartQty(p.id, -1)}>
                              <Minus size={14} />
                            </button>
                            <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
                            <button className="btn btn-icon" style={{ background: 'var(--primary-light)', color: '#818CF8', width: '32px', height: '32px' }} onClick={() => updateCartQty(p.id, 1)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Sidebar Summary */}
            <div>
              <div className="card" style={{ position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingCart size={20} color="var(--primary)" />
                  <span>Order Summary</span>
                </h3>

                <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer: </span>
                  <strong style={{ color: 'white' }}>{customerName}</strong>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '1rem 0', margin: '1rem 0', maxHeight: '200px', overflowY: 'auto' }}>
                  {getCartItemsList().length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No items selected yet.</p>
                  ) : (
                    getCartItemsList().map(item => (
                      <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x {item.product.name}</span>
                        <strong style={{ color: 'var(--text)' }}>₹{item.total.toLocaleString()}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontWeight: 600 }}>Total Payable</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary)' }}>₹{calculateTotal().toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} />
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} disabled={selectedItemsCount === 0} onClick={() => setStep(3)}>
                    <span>Review Order</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Review & Submit */}
        {step === 3 && (
          <div className="card" style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={24} color="var(--primary)" />
              <span>Step 3: Review & Confirm Purchase Order</span>
            </h3>

            {/* PO Details Grid */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PO Number</span>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>{poNumber}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Name</span>
                <p style={{ fontWeight: 700, fontSize: '1rem' }}>{customerName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Company Name</span>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: '#F97316' }}>{companyName || 'SmartPO Industrial Corp'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Phone</span>
                <p style={{ fontSize: '0.9rem' }}>{customerPhone || 'N/A'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Address</span>
                <p style={{ fontSize: '0.9rem' }}>{customerAddress || 'N/A'}</p>
              </div>
            </div>

            {/* Items Breakdown Table */}
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Itemized Breakdown</h4>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface-hover)' }}>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Qty</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Unit Price</th>
                    <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {getCartItemsList().map(item => (
                    <tr key={item.product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{item.product.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{item.quantity} {item.product.unit || 'pcs'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Grand Total</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--secondary)' }}>
                ₹{calculateTotal().toLocaleString()}
              </span>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                <ArrowLeft size={18} />
                <span>Modify Items</span>
              </button>
              <button className="btn btn-success" style={{ flex: 2, padding: '0.9rem', fontSize: '1rem' }} onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? 'Submitting Order...' : 'Confirm & Submit Purchase Order'}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
