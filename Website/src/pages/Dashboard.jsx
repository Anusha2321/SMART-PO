import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase, fetchCatalogProducts } from '../lib/supabase';
import { 
  Package, 
  ShoppingCart, 
  Sparkles, 
  PlusCircle, 
  ChevronRight, 
  List,
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, t } from '../lib/languageStore';
import { getOrders, getDeletedOrderIds } from '../lib/orderStore';
import { formatRupee } from '../lib/exportHelper';

export default function Dashboard() {
  const navigate = useNavigate();
  const [lang] = useLanguage();
  const [totalItems, setTotalItems] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    // 1. Fetch catalog items count
    const catalog = await fetchCatalogProducts();
    setTotalItems(catalog.length);

    // 2. Fetch orders from local storage & Supabase
    const localOrders = getOrders();
    const deletedSet = getDeletedOrderIds();
    const activeLocal = localOrders.filter(o => !deletedSet.has(String(o.id)) && !deletedSet.has(String(o.order_number)));
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
    } catch (e) {
      console.warn('Orders cloud fetch error');
    }
    setLoading(false);
  };

  const totalValue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in" style={{ maxWidth: '1280px', padding: '2rem 1.5rem' }}>
        
        {/* Welcome Header Banner */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(26, 60, 110, 0.4), rgba(15, 23, 42, 0.9))', borderLeft: '6px solid #F97316' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">ENTERPRISE PLATFORM</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time Inventory & Order Sync</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'white' }}>
                Purchasing Operations Command Center
              </h1>
              <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0', fontSize: '0.95rem' }}>
                Manage purchase orders, catalog items, and AI parsing in one unified web workspace.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-success" 
                style={{ padding: '0.85rem 1.5rem', fontWeight: 700, fontSize: '0.95rem' }} 
                onClick={() => navigate('/create-order')}
              >
                <PlusCircle size={20} />
                <span>Create New PO</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Top Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Card 1: Total Purchase Orders */}
          <div className="card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer', transition: 'transform 0.2s', borderTop: '3px solid #93C5FD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Purchase Orders</span>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(147, 197, 253, 0.15)', color: '#93C5FD' }}>
                <FileText size={22} />
              </div>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#93C5FD', margin: 0 }}>
              {loading ? '...' : orders.length}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.825rem', color: '#10B981' }}>
              <TrendingUp size={16} />
              <span>Active Order System</span>
            </div>
          </div>

          {/* Card 2: Catalog Products */}
          <div className="card" onClick={() => navigate('/catalog')} style={{ cursor: 'pointer', transition: 'transform 0.2s', borderTop: '3px solid #F97316' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Catalog Items</span>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.15)', color: '#F97316' }}>
                <Package size={22} />
              </div>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#F97316', margin: 0 }}>
              {loading ? '...' : totalItems}
            </h2>
            <span style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Fully Synchronized Dataset
            </span>
          </div>

          {/* Card 3: Total Pipeline Value */}
          <div className="card" style={{ borderTop: '3px solid #10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pipeline Order Value</span>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                <ShoppingCart size={22} />
              </div>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: 0 }}>
              {loading ? '...' : formatRupee(totalValue)}
            </h2>
            <span style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Sum of Created Purchase Orders
            </span>
          </div>

          {/* Card 4: AI Assistant Quick Launch */}
          <div className="card" onClick={() => navigate('/ai-assistant')} style={{ cursor: 'pointer', background: 'linear-gradient(135deg, #1E293B, #1A3C6E)', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#F97316" />
                <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>AI Assistant</span>
              </div>
              <span className="badge badge-success">NEW</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
              Parse plain text or email requests into PO line items automatically.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F97316', fontWeight: 700, fontSize: '0.875rem' }}>
              <span>Launch AI Parser</span>
              <ArrowRight size={16} />
            </div>
          </div>

        </div>

        {/* 2-Column Desktop Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          
          {/* Left Column (8 cols = 66% width): Recent Purchase Orders */}
          <div className="card" style={{ gridColumn: 'span 8' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Recent Purchase Orders</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live order pipeline & export status</span>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }} onClick={() => navigate('/orders')}>
                <span>View All ({orders.length})</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {orders.length === 0 ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No Purchase Orders Yet</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Create your first purchase order using our step-by-step wizard or AI assistant.
                </p>
                <button className="btn btn-success" onClick={() => navigate('/create-order')}>
                  <PlusCircle size={18} />
                  <span>Create First PO</span>
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>PO NUMBER</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CUSTOMER</th>
                      <th style={{ padding: '0.75rem 1rem' }}>COMPANY</th>
                      <th style={{ padding: '0.75rem 1rem' }}>TOTAL (₹)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((order) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#93C5FD' }}>{order.order_number || order.poNumber}</td>
                        <td style={{ padding: '1rem' }}>{order.customer_name || order.customerName}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{order.company_name || order.companyName || 'SmartPO Corp'}</td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#F97316' }}>{formatRupee(order.total_amount)}</td>
                        <td style={{ padding: '1rem' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate('/orders')}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column (4 cols = 33% width): Quick Operations Panel */}
          <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Quick Actions Panel */}
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem', color: 'white' }}>Quick Operations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <div 
                  onClick={() => navigate('/catalog')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Package size={20} color="#F97316" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>Browse Catalog</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2,471 product items</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>

                <div 
                  onClick={() => navigate('/orders')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="#93C5FD" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>PDF / Excel Reports</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Export in INR (₹)</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>

                <div 
                  onClick={() => navigate('/profile')}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.85rem 1rem', 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'pointer',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserCheck size={20} color="#10B981" />
                    <div>
                      <h5 style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>Profile & Languages</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14 Supported Languages</span>
                    </div>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>

              </div>
            </div>

            {/* System Status Card */}
            <div className="card" style={{ background: 'rgba(26, 60, 110, 0.15)', border: '1px solid rgba(26, 60, 110, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} color="#10B981" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'white' }}>Cloud Database Sync</h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Supabase Cloud DB connected. Local offline data automatically synchronizes on launch.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
