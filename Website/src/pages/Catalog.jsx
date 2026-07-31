import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AddItemModal from '../components/AddItemModal';
import EditItemModal from '../components/EditItemModal';
import { fetchCatalogProducts } from '../lib/supabase';
import { Search, PlusCircle, Package, Edit3, Filter } from 'lucide-react';
import { useLanguage, t } from '../lib/languageStore';

export default function Catalog() {
  const [lang] = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await fetchCatalogProducts();
    setProducts(data);
    setLoading(false);
  };

  const categories = ['ALL', ...Array.from(new Set(products.map(p => p.category || 'OTHERS')))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || (p.category || '').toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCat;
  });

  const handleItemAdded = (newProduct) => {
    setProducts([newProduct, ...products]);
  };

  const handleItemUpdated = (updatedProduct) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in">
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <Package size={24} color="var(--primary)" />
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Product Catalog</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Browse, filter, and manage catalog items.</p>
          </div>

          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <PlusCircle size={18} />
            <span>Add New Product</span>
          </button>
        </header>

        {/* Filter Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: selectedCategory === cat ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                  color: selectedCategory === cat ? '#818CF8' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={t('search_catalog')} 
              style={{ paddingLeft: '2.5rem', padding: '0.55rem 1rem 0.55rem 2.5rem', fontSize: '0.875rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>

        {/* Catalog Table */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Product Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unit</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading product catalog...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found matching criteria.</td></tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span className="badge badge-primary">
                          {p.category || 'OTHERS'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>
                        ₹{Number(p.price_per_kg || p.price || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{p.unit || 'pcs'}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button className="btn btn-icon" onClick={() => setEditingProduct(p)} title="Edit Item">
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Modals */}
      <AddItemModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onItemAdded={handleItemAdded} />
      <EditItemModal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} product={editingProduct} onItemUpdated={handleItemUpdated} />
    </div>
  );
}
