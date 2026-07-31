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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage, t } from '../lib/languageStore';

export default function Dashboard() {
  const navigate = useNavigate();
  const [lang] = useLanguage();
  const [totalItems, setTotalItems] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    // 1. Fetch catalog items count
    const catalog = await fetchCatalogProducts();
    setTotalItems(catalog.length);

    // 2. Fetch total orders count
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id');

      if (!error && data) {
        setTotalOrders(data.length);
      }
    } catch (e) {
      console.warn('Orders fetch error');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in" style={{ maxWidth: '720px' }}>
        
        {/* Metric Card 1: Total Orders */}
        <div className="card" style={{ marginBottom: '1rem', padding: '1.75rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Orders</span>
          <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#93C5FD', margin: '0.2rem 0 0' }}>
            {loading ? '...' : totalOrders}
          </h2>
        </div>

        {/* Metric Card 2: Catalog Items */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.75rem', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Catalog Items</span>
          <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#F97316', margin: '0.2rem 0 0' }}>
            {loading ? '...' : totalItems}
          </h2>
        </div>

        {/* Action Card 1: View All Orders */}
        <div 
          className="card" 
          onClick={() => navigate('/orders')}
          style={{ 
            marginBottom: '1rem', 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <List size={28} color="#93C5FD" />
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'white' }}>View All Orders</h4>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Manage existing purchase orders</span>
            </div>
          </div>
          <ChevronRight size={22} color="var(--text-muted)" />
        </div>

        {/* Action Card 2: AI Order Assistant */}
        <div 
          className="card" 
          onClick={() => navigate('/ai-assistant')}
          style={{ 
            marginBottom: '2.5rem', 
            padding: '1.25rem 1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: '#1A3C6E',
            border: '1px solid rgba(249, 115, 22, 0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Sparkles size={28} color="#FF9800" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'white' }}>AI Order Assistant</h4>
                <span style={{ backgroundColor: '#FF9800', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                  NEW
                </span>
              </div>
              <span style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)' }}>Describe items in plain language</span>
            </div>
          </div>
          <ChevronRight size={22} color="rgba(255, 255, 255, 0.7)" />
        </div>

        {/* Big Create PO Button */}
        <button 
          className="btn btn-success" 
          style={{ 
            width: '100%', 
            padding: '1.1rem', 
            fontSize: '1.2rem', 
            fontWeight: 800,
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.35)'
          }} 
          onClick={() => navigate('/create-order')}
        >
          <PlusCircle size={24} />
          <span>Create New PO</span>
        </button>

      </main>
    </div>
  );
}
