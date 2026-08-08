import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import OrderDetailModal from '../components/OrderDetailModal';
import { supabase } from '../lib/supabase';
import { getLocalOrders, deleteLocalOrder, getDeletedOrderIds } from '../lib/orderStore';
import { FileText, Search, PlusCircle, ChevronRight, FileSpreadsheet, Download, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportOrderToPdf, exportOrderToExcel } from '../lib/exportHelper';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const local = getLocalOrders();
    const deletedSet = getDeletedOrderIds();
    const activeLocal = local.filter(o => !deletedSet.has(String(o.id)) && !deletedSet.has(String(o.order_number)));
    setOrders(activeLocal);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const localIds = new Set(activeLocal.map(o => String(o.id)));
        const localPos = new Set(activeLocal.map(o => String(o.order_number)));
        const merged = [...activeLocal];
        data.forEach(dbOrd => {
          const dbId = String(dbOrd.id);
          const dbPo = String(dbOrd.order_number);
          if (!deletedSet.has(dbId) && !deletedSet.has(dbPo) && !localIds.has(dbId) && !localPos.has(dbPo)) {
            merged.push(dbOrd);
          }
        });
        setOrders(merged);
      }
    } catch (err) {
      console.warn('Orders fetch fallback to local store');
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (o.order_number || '').toLowerCase().includes(term) ||
           (o.customer_name || '').toLowerCase().includes(term) ||
           (o.company_name || '').toLowerCase().includes(term);
  });

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in">
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <FileText size={24} color="var(--primary)" />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Purchase Orders</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>View, search, edit prices, export PDF/Excel invoices, and manage purchase orders.</p>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/create-order')}>
            <PlusCircle size={18} />
            <span>Create New Order</span>
          </button>
        </header>

        {/* Filter / Search Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '360px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by PO, Customer, or Company..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>PO Number</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Customer Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Company Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total (Rupees)</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading purchase orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No purchase orders found.{' '}
                      <a href="#create" onClick={(e) => { e.preventDefault(); navigate('/create-order'); }} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Create a new order
                      </a>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {o.order_number || o.id.substring(0, 8)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{o.customer_name || 'N/A'}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#F97316' }}>{o.company_name || 'SmartPO Industrial Corp'}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {new Date(o.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span className="badge badge-success">Completed</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={(e) => { e.stopPropagation(); exportOrderToPdf(o); }}
                            title="Export PDF Invoice"
                          >
                            <FileText size={14} color="#818CF8" />
                            <span>PDF</span>
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                            onClick={(e) => { e.stopPropagation(); exportOrderToExcel(o); }}
                            title="Export Excel File"
                          >
                            <FileSpreadsheet size={14} color="#34D399" />
                            <span style={{ color: '#34D399' }}>Excel</span>
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                            title="Edit Price & Details"
                          >
                            <Edit size={14} color="#38BDF8" />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              const poStr = o.order_number || o.id;
                              if (window.confirm(`Are you sure you want to delete Purchase Order ${poStr}?`)) {
                                deleteLocalOrder(o.id);
                                if (o.order_number) deleteLocalOrder(o.order_number);
                                try {
                                  await supabase.from('orders').delete().eq('id', o.id);
                                  if (o.order_number) {
                                    await supabase.from('orders').delete().eq('order_number', o.order_number);
                                  }
                                } catch (err) {}
                                loadOrders();
                              }
                            }}
                            title="Delete Order"
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Order Detail & Edit Modal */}
      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
        onRefresh={loadOrders}
      />
    </div>
  );
}
