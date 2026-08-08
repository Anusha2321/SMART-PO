import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase, fetchCatalogProducts } from '../lib/supabase';
import { addLocalOrder } from '../lib/orderStore';
import { 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle, 
  RefreshCw,
  Search,
  Sparkles,
  Building
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exportOrderToPdf, exportOrderToExcel, formatRupee } from '../lib/exportHelper';

export default function CreateOrder() {
  const navigate = useNavigate();
  const location = useLocation();

  // PO Details State
  const [poNumber, setPoNumber] = useState(`VMNR/PO/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);

  // Supplier State
  const [supplierName, setSupplierName] = useState('ABC Industries Pvt. Ltd.');
  const [contactPerson, setContactPerson] = useState('Ramesh Kumar');
  const [supplierPhone, setSupplierPhone] = useState('9876543210');
  const [supplierEmail, setSupplierEmail] = useState('ramesh@abc.com');

  // Items State
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [items, setItems] = useState([
    { id: '1', product_name: 'PTFE Sheet', category: 'PTFE / Polymer Items', unit: 'kg', quantity: 20, unit_price: 500, total_price: 10000 },
    { id: '2', product_name: 'MS Valve', category: 'Valves & Fittings', unit: 'piece', quantity: 10, unit_price: 800, total_price: 8000 },
    { id: '3', product_name: 'Stainless Steel Rod', category: 'Metal Items', unit: 'kg', quantity: 5, unit_price: 1200, total_price: 6000 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderNotes, setOrderNotes] = useState('Please deliver the items on or before the delivery date.');

  // UI Status
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    const data = await fetchCatalogProducts();
    setCatalogProducts(data);
  };

  const handleAddItem = (product) => {
    const existingIndex = items.findIndex(it => it.product_name === product.name);
    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total_price = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setItems(updated);
    } else {
      const newItem = {
        id: `it_${Date.now()}_${items.length + 1}`,
        product_name: product.name,
        category: product.category || 'General Items',
        unit: product.unit || 'pcs',
        quantity: 1,
        unit_price: product.price_per_kg || product.price || 500,
        total_price: product.price_per_kg || product.price || 500
      };
      setItems([...items, newItem]);
    }
  };

  const handleUpdateItem = (id, field, value) => {
    const updated = items.map(it => {
      if (it.id === id) {
        const next = { ...it, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          const qty = field === 'quantity' ? Math.max(1, Number(value) || 1) : it.quantity;
          const price = field === 'unit_price' ? Math.max(0, Number(value) || 0) : it.unit_price;
          next.quantity = qty;
          next.unit_price = price;
          next.total_price = qty * price;
        }
        return next;
      }
      return it;
    });
    setItems(updated);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(it => it.id !== id));
  };

  // Tax calculations
  const subtotal = items.reduce((sum, it) => sum + Number(it.total_price || 0), 0);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const totalAmount = subtotal + cgst + sgst;

  const handleGeneratePo = async () => {
    if (items.length === 0) {
      alert('Please add at least one line item before creating PO.');
      return;
    }

    setSubmitting(true);
    const orderId = crypto.randomUUID ? crypto.randomUUID() : `ord_${Date.now()}`;

    const newOrderObj = {
      id: orderId,
      order_number: poNumber,
      customer_name: contactPerson,
      company_name: supplierName,
      customer_phone: supplierPhone,
      customer_email: supplierEmail,
      total_amount: totalAmount,
      subtotal: subtotal,
      cgst: cgst,
      sgst: sgst,
      notes: orderNotes,
      created_at: new Date(poDate).toISOString(),
      delivery_date: deliveryDate,
      status: 'Approved',
      items: items
    };

    // Save locally
    addLocalOrder(newOrderObj);

    // Save to Supabase
    try {
      await supabase.from('orders').insert([{
        id: orderId,
        order_number: poNumber,
        customer_name: contactPerson,
        company_name: supplierName,
        customer_phone: supplierPhone,
        total_amount: totalAmount,
        notes: orderNotes
      }]);
    } catch (e) {
      console.warn('Cloud sync deferred');
    }

    setSubmitting(false);
    setSuccess(true);

    setTimeout(() => {
      navigate('/orders');
    }, 1200);
  };

  if (success) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-wrapper" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem', maxWidth: '500px' }}>
            <CheckCircle size={64} color="#10B981" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>Purchase Order Generated!</h2>
            <p style={{ color: '#64748B', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              PO <strong>{poNumber}</strong> has been created and saved cleanly.
            </p>
            <span className="badge badge-approved">Redirecting to History...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Header title="Create Purchase Order" subtitle="Generate new PO invoices with item breakdown & tax calculations" />

        <main className="page-content">
          
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Purchase Order</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Fill in PO details, supplier info, and itemized billing</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => alert('Draft saved locally')}>
                Save Draft
              </button>
              <button className="btn btn-primary" onClick={handleGeneratePo} disabled={submitting}>
                {submitting ? 'Generating...' : 'Generate PO'}
              </button>
            </div>
          </div>

          {/* Section 1: PO Details */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>PO Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div>
                <label className="form-label">PO Number</label>
                <input type="text" className="form-input" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} style={{ fontWeight: 700, color: '#2563EB' }} />
              </div>

              <div>
                <label className="form-label">PO Date</label>
                <input type="date" className="form-input" value={poDate} onChange={(e) => setPoDate(e.target.value)} />
              </div>

              <div>
                <label className="form-label">Delivery Date</label>
                <input type="date" className="form-input" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 2: Supplier Information */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>Supplier Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Supplier Name *</label>
                <select className="form-input" value={supplierName} onChange={(e) => setSupplierName(e.target.value)}>
                  <option value="ABC Industries Pvt. Ltd.">ABC Industries Pvt. Ltd.</option>
                  <option value="XYZ Polymers Inc.">XYZ Polymers Inc.</option>
                  <option value="Metro Supplies Co.">Metro Supplies Co.</option>
                  <option value="Global Tech Corp">Global Tech Corp</option>
                </select>
              </div>

              <div>
                <label className="form-label">Contact Person</label>
                <input type="text" className="form-input" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input type="text" className="form-input" value={supplierPhone} onChange={(e) => setSupplierPhone(e.target.value)} />
              </div>

              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" value={supplierEmail} onChange={(e) => setSupplierEmail(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 3: Add Items Table */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: 0 }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Add Items</h3>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Search catalog items to add..." 
                    style={{ paddingLeft: '2.2rem', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} onClick={() => {
                  if (catalogProducts.length > 0) handleAddItem(catalogProducts[0]);
                }}>
                  <Plus size={16} />
                  <span>+ Add Item</span>
                </button>
              </div>
            </div>

            {/* Live Search Catalog Dropdown */}
            {searchTerm.trim() !== '' && (
              <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', maxHeight: '180px', overflowY: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>CLICK ITEM TO ADD TO ORDER:</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {catalogProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 6).map(p => (
                    <div 
                      key={p.id}
                      onClick={() => { handleAddItem(p); setSearchTerm(''); }}
                      style={{ padding: '0.5rem', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <strong style={{ color: '#0F172A', display: 'block' }}>{p.name}</strong>
                      <span style={{ color: '#10B981', fontWeight: 600 }}>{formatRupee(p.price_per_kg || p.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>ITEM NAME</th>
                    <th>CATEGORY</th>
                    <th>UNIT</th>
                    <th style={{ width: '100px' }}>QUANTITY</th>
                    <th style={{ width: '130px' }}>UNIT PRICE</th>
                    <th style={{ textAlign: 'right' }}>AMOUNT</th>
                    <th style={{ textAlign: 'center', width: '70px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 600, color: '#64748B' }}>{idx + 1}</td>
                      <td>
                        <input type="text" className="form-input" value={it.product_name} onChange={(e) => handleUpdateItem(it.id, 'product_name', e.target.value)} style={{ fontWeight: 600 }} />
                      </td>
                      <td style={{ color: '#475569', fontSize: '0.85rem' }}>{it.category}</td>
                      <td>
                        <input type="text" className="form-input" value={it.unit} onChange={(e) => handleUpdateItem(it.id, 'unit', e.target.value)} style={{ width: '70px', padding: '0.35rem 0.5rem' }} />
                      </td>
                      <td>
                        <input type="number" className="form-input" value={it.quantity} onChange={(e) => handleUpdateItem(it.id, 'quantity', e.target.value)} style={{ padding: '0.35rem 0.5rem', fontWeight: 700 }} />
                      </td>
                      <td>
                        <input type="number" className="form-input" value={it.unit_price} onChange={(e) => handleUpdateItem(it.id, 'unit_price', e.target.value)} style={{ padding: '0.35rem 0.5rem', fontWeight: 700 }} />
                      </td>
                      <td style={{ fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>
                        {formatRupee(it.total_price)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn btn-icon" onClick={() => handleRemoveItem(it.id)} title="Delete Item">
                          <Trash2 size={16} color="#EF4444" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Notes & Totals Calculation Block */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Left Notes */}
            <div className="card">
              <label className="form-label" style={{ marginBottom: '0.6rem' }}>Order Notes</label>
              <textarea 
                className="form-input" 
                rows="4" 
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Special delivery instructions or order notes..." 
              />
            </div>

            {/* Right Totals Box */}
            <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Subtotal</span>
                  <strong style={{ color: '#0F172A' }}>{formatRupee(subtotal)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>CGST (9%)</span>
                  <strong style={{ color: '#0F172A' }}>{formatRupee(cgst)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>SGST (9%)</span>
                  <strong style={{ color: '#0F172A' }}>{formatRupee(sgst)}</strong>
                </div>

                <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Total Amount</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>
                    {formatRupee(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Action Footer Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn" style={{ backgroundColor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' }}>
                Save Draft
              </button>
              <button className="btn" style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }} onClick={() => setItems([])}>
                Reset
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => exportOrderToPdf({ order_number: poNumber, customer_name: contactPerson, company_name: supplierName, total_amount: totalAmount, items })}>
                <FileText size={16} color="#2563EB" />
                <span>Generate PDF</span>
              </button>
              <button className="btn btn-secondary" style={{ color: '#059669', borderColor: '#A7F3D0' }} onClick={() => exportOrderToExcel({ order_number: poNumber, customer_name: contactPerson, company_name: supplierName, total_amount: totalAmount, items })}>
                <Download size={16} color="#059669" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
