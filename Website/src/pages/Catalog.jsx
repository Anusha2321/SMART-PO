import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchCatalogProducts } from '../lib/supabase';
import { Search, Plus, Filter, Edit, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { formatRupee } from '../lib/exportHelper';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    const data = await fetchCatalogProducts();
    setProducts(data);
    setLoading(false);
  };

  const categoriesList = Array.from(new Set(products.map(p => p.category || 'OTHERS')));
  const unitsList = Array.from(new Set(products.map(p => p.unit || 'pcs')));

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesUnit = unitFilter === 'ALL' || p.unit === unitFilter;
    return matchesSearch && matchesCat && matchesUnit;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-wrapper">
        <Header title="Items Management" subtitle="Manage product catalog items, prices, and units" />

        <main className="page-content">
          
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Catalog Items</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {filteredProducts.length} total products
              </span>
            </div>

            <button className="btn btn-primary" onClick={() => alert('New Item Modal triggered')}>
              <Plus size={18} />
              <span>Add New Item</span>
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
                  placeholder="Search items by name, category, or code..." 
                  style={{ paddingLeft: '2.4rem' }}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>

              {/* Category Filter */}
              <select 
                className="form-input" 
                style={{ width: '200px' }}
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Unit Filter */}
              <select 
                className="form-input" 
                style={{ width: '150px' }}
                value={unitFilter}
                onChange={(e) => { setUnitFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="ALL">All Units</option>
                {unitsList.map(u => <option key={u} value={u}>{u}</option>)}
              </select>

              <button className="btn btn-secondary">
                <Filter size={16} />
                <span>Filter</span>
              </button>

            </div>
          </div>

          {/* Items Table */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ITEM CODE</th>
                    <th>ITEM NAME</th>
                    <th>CATEGORY</th>
                    <th>UNIT</th>
                    <th>UNIT PRICE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>Loading products catalog...</td></tr>
                  ) : paginatedProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: '#64748B' }}>No products found matching filters.</td></tr>
                  ) : (
                    paginatedProducts.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                          {`ITM${String(p.id || idx + 1).padStart(3, '0')}`}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>
                          {p.name}
                        </td>
                        <td style={{ color: '#475569', fontWeight: 600 }}>
                          {p.category || 'PTFE / Polymer Items'}
                        </td>
                        <td style={{ color: '#64748B' }}>
                          {p.unit || 'kg'}
                        </td>
                        <td style={{ fontWeight: 700, color: '#10B981' }}>
                          {formatRupee(p.price_per_kg || p.price || 500)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-icon" title="Edit Item">
                              <Edit size={16} color="#2563EB" />
                            </button>
                            <button className="btn btn-icon" title="Delete Item">
                              <Trash2 size={16} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
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
    </div>
  );
}
