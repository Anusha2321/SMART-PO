import React, { useEffect, useState } from 'react';
import { X, Printer, FileSpreadsheet, FileText, CheckCircle2, User, Phone, MapPin, Building, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { exportOrderToPdf, exportOrderToExcel } from '../lib/exportHelper';
import { updateLocalOrder, deleteLocalOrder } from '../lib/orderStore';

export default function OrderDetailModal({ isOpen, onClose, order, onRefresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editTotalAmount, setEditTotalAmount] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order?.id) {
      loadOrderItems();
      setEditCustomerName(order.customer_name || '');
      setEditCompanyName(order.company_name || '');
      setEditTotalAmount(order.total_amount || 0);
      setEditPhone(order.customer_phone || '');
      setEditAddress(order.customer_address || '');
      setIsEditing(false);
    }
  }, [order]);

  const loadOrderItems = async () => {
    if (order?.items && Array.isArray(order.items) && order.items.length > 0) {
      setItems(order.items);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (!error && data && data.length > 0) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.warn('Fallback order items read');
    }
    setLoading(false);
  };

  if (!isOpen || !order) return null;

  const handleExportPdf = () => {
    exportOrderToPdf(order, items);
  };

  const handleExportExcel = () => {
    exportOrderToExcel(order, items);
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    const updated = {
      ...order,
      customer_name: editCustomerName,
      company_name: editCompanyName,
      total_amount: Number(editTotalAmount) || order.total_amount,
      customer_phone: editPhone,
      customer_address: editAddress
    };

    // Update local storage
    updateLocalOrder(updated);

    // Try cloud sync update
    try {
      await supabase.from('orders').update({
        customer_name: editCustomerName,
        customer_phone: editPhone,
        customer_address: editAddress,
        total_amount: Number(editTotalAmount) || order.total_amount
      }).eq('id', order.id);
    } catch (err) {
      console.warn('Supabase update fallback to local store');
    }

    setSaving(false);
    setIsEditing(false);
    if (onRefresh) onRefresh();
  };

  const handleDeleteOrder = async () => {
    const poNum = order.order_number || order.id?.substring(0, 8);
    if (!window.confirm(`Are you sure you want to permanently delete Purchase Order ${poNum}?`)) {
      return;
    }

    // Delete local
    deleteLocalOrder(order.id);

    // Delete cloud
    try {
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
    } catch (err) {
      console.warn('Supabase delete fallback');
    }

    onClose();
    if (onRefresh) onRefresh();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Purchase Order Invoice</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
              {order.order_number || order.id.substring(0, 8)}
            </h2>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!isEditing ? (
              <>
                <button className="btn btn-secondary" onClick={() => setIsEditing(true)} title="Edit Order Details & Price" style={{ gap: '0.4rem' }}>
                  <Edit size={16} color="#38BDF8" />
                  <span>Edit</span>
                </button>
                <button className="btn btn-secondary" onClick={handleExportPdf} title="Export Order as PDF Invoice" style={{ gap: '0.4rem' }}>
                  <FileText size={16} color="#818CF8" />
                  <span>PDF</span>
                </button>
                <button className="btn btn-secondary" onClick={handleExportExcel} title="Export Order as Excel File" style={{ gap: '0.4rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                  <FileSpreadsheet size={16} color="#34D399" />
                  <span style={{ color: '#34D399' }}>Excel</span>
                </button>
                <button className="btn btn-secondary" onClick={handleDeleteOrder} title="Delete Purchase Order" style={{ gap: '0.4rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                  <Trash2 size={16} color="#EF4444" />
                  <span style={{ color: '#EF4444' }}>Delete</span>
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleSaveChanges} disabled={saving} style={{ gap: '0.4rem' }}>
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            )}

            <button className="btn btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Customer & Company Info Card (View vs Edit) */}
        {!isEditing ? (
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={13} color="var(--primary)" /> Customer Name
              </span>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#F8FAFC' }}>{order.customer_name || 'N/A'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building size={13} color="var(--secondary)" /> Company Name
              </span>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: '#F97316' }}>{order.company_name || 'SmartPO Industrial Corp'}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date Placed</span>
              <p style={{ fontSize: '0.95rem' }}>{new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contact Phone</span>
              <p style={{ fontSize: '0.9rem' }}>{order.customer_phone || 'N/A'}</p>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery Address</span>
              <p style={{ fontSize: '0.9rem' }}>{order.customer_address || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Customer Name</label>
              <input type="text" className="form-input" value={editCustomerName} onChange={(e) => setEditCustomerName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Company Name</label>
              <input type="text" className="form-input" value={editCompanyName} onChange={(e) => setEditCompanyName(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Total Price (Rupees ₹)</label>
              <input type="number" className="form-input" value={editTotalAmount} onChange={(e) => setEditTotalAmount(e.target.value)} style={{ fontWeight: 700, color: 'var(--secondary)' }} />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Contact Phone</label>
              <input type="text" className="form-input" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>Delivery Address</label>
              <input type="text" className="form-input" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
            </div>
          </div>
        )}

        {/* Items Table */}
        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Order Line Items</h4>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-hover)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Product Name</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Unit Price (Rupees)</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Total (Rupees)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No line items recorded.</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={it.id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{it.product_name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{it.quantity} {it.unit || 'pcs'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>₹{Number(it.unit_price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--secondary)' }}>
                      ₹{Number(it.total_price || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total Footer in Rupees */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(26, 60, 110, 0.4)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(26, 60, 110, 0.8)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', display: 'block' }}>Grand Total Amount (INR)</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prices calculated in Indian Rupees (₹)</span>
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>
            ₹{Number(isEditing ? (editTotalAmount || 0) : (order.total_amount || 0)).toLocaleString('en-IN')}
          </span>
        </div>

      </div>
    </div>
  );
}
