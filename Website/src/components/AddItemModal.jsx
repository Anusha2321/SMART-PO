import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddItemModal({ isOpen, onClose, onItemAdded }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('OTHERS');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Please fill out Product Name and Price');
      return;
    }

    setSaving(true);
    const newProduct = {
      name,
      category,
      price_per_kg: Number(price),
      unit
    };

    try {
      const { data, error } = await supabase.from('products').insert([newProduct]).select();
      if (!error && data) {
        onItemAdded(data[0]);
      } else {
        // Fallback local add
        onItemAdded({ id: Date.now().toString(), ...newProduct });
      }
    } catch (err) {
      onItemAdded({ id: Date.now().toString(), ...newProduct });
    }

    setSaving(false);
    onClose();
    setName('');
    setPrice('');
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PlusCircle size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Add New Product</h3>
          </div>
          <button className="btn btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. 1'' Plastic Bend"
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
                placeholder="0.00"
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
              placeholder="pcs / kg / sheets / meters"
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
              {saving ? 'Adding Product...' : 'Save Product'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
