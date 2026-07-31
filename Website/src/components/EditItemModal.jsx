import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EditItemModal({ isOpen, onClose, product, onItemUpdated }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('OTHERS');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || 'OTHERS');
      setPrice(product.price_per_kg || product.price || '');
      setUnit(product.unit || 'pcs');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const updatedProduct = {
      ...product,
      name,
      category,
      price_per_kg: Number(price),
      unit
    };

    try {
      await supabase.from('products').update(updatedProduct).eq('id', product.id);
    } catch (err) {
      console.warn('Update fallback');
    }

    onItemUpdated(updatedProduct);
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Edit3 size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Catalog Item</h3>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-input" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="MS BENDS">MS BENDS</option>
                <option value="OTHERS">OTHERS</option>
                <option value="VALVES">VALVES</option>
                <option value="PIPES">PIPES</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price</label>
              <input 
                type="number" 
                step="0.01" 
                className="form-input" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Unit of Measure</label>
            <input 
              type="text" 
              className="form-input" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
