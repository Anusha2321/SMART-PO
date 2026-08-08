import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import OrderDetailModal from '../components/OrderDetailModal';
import { supabase } from '../lib/supabase';
import { getLocalOrders, deleteLocalOrder, getDeletedOrderIds } from '../lib/orderStore';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  FileSpreadsheet, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportOrderToPdf, exportOrderToExcel, formatRupee } from '../lib/exportHelper';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
    const matchesSearch = (o.order_number || '').toLowerCase().includes(term) ||
                          (o.customer_name || '').toLowerCase().includes(term) ||
                          (o.company_name || '').toLowerCase().includes(term);
    const st = o.status || 'Approved';
    const matchesStatus = statusFilter === 'ALL' || st.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Header title="Purchase Order History" subtitle="View, search, filter, and export purchase orders" />

        <main className="page-content">
          
          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>All Purchase Orders</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {filteredOrders.length} total orders
              </span>
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/create-order')}>
              <PlusCircle size={18} />
              <span>+ Create PO</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Search Box */}
              <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search PO number or supplier..." 
                  style={{ paddingLeft: '2.4rem' }}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* Status Filter */}
              <select 
                className="form-input" 
                style={{ width: '160px' }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="draft">Draft</option>
              </select>

              <button className="btn btn-secondary">
                <Calendar size={16} />
                <span>Select Date Range</span>
              </button>

              <button className="btn btn-secondary">
                <Filter size={16} />
                <span>Filter</span>
              </button>

            </div>
          </div>

          {/* Orders Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>PO NUMBER</th>
                    <th>SUPPLIER</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>Loading purchase orders...</td></tr>
                  ) : paginatedOrders.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>No purchase orders found.</td></tr>
                  ) : (
                    paginatedOrders.map((o) => {
                      const st = o.status || 'Approved';
                      const badgeClass = st.toLowerCase() === 'approved' || st.toLowerCase() === 'completed' ? 'badge-approved' : st.toLowerCase() === 'pending' ? 'badge-pending' : 'badge-draft';
                      return (
                        <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(o)}>
                          <td style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                            {o.order_number || o.id.substring(0, 8)}
                          </td>
                          <td style={{ fontWeight: 600, color: '#0F172A' }}>
                            {o.customer_name || o.company_name || 'ABC Industries'}
                          </td>
                          <td style={{ fontWeight: 700, color: '#0F172A' }}>
                            {formatRupee(o.total_amount)}
                          </td>
                          <td>
                            <span className={`badge ${badgeClass}`}>{st}</span>
                          </td>
                          <td style={{ color: '#64748B', fontSize: '0.85rem' }}>
                            {new Date(o.created_at || Date.now()).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-icon" 
                                onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                                title="View Details"
                              >
                                <Eye size={16} color="#64748B" />
                              </button>
                              <button 
                                className="btn btn-icon" 
                                onClick={(e) => { e.stopPropagation(); exportOrderToPdf(o); }}
                                title="Download PDF"
                              >
                                <FileText size={16} color="#2563EB" />
                              </button>
                              <button 
                                className="btn btn-icon" 
                                onClick={(e) => { e.stopPropagation(); exportOrderToExcel(o); }}
                                title="Export Excel"
                              >
                                <Download size={16} color="#10B981" />
                              </button>
                              <button 
                                className="btn btn-icon" 
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
                                <Trash2 size={16} color="#EF4444" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
              </span>

              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.6rem' }} 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      border: pNum === currentPage ? 'none' : '1px solid #E2E8F0',
                      backgroundColor: pNum === currentPage ? '#2563EB' : '#FFFFFF',
                      color: pNum === currentPage ? '#FFFFFF' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {pNum}
                  </button>
                ))}

                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.6rem' }} 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        order={selectedOrder} 
        onRefresh={loadOrders}
      />
    </div>
  );
}
