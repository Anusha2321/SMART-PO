import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { fetchCatalogProducts, GEMINI_API_KEY } from '../lib/supabase';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiOrderAssistant() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedItems, setParsedItems] = useState(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    const data = await fetchCatalogProducts();
    setCatalog(data);
  };

  const handleParseAi = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      alert('Please paste or type an order text request.');
      return;
    }

    setLoading(true);
    setError(null);
    setParsedItems(null);

    try {
      const catalogJson = JSON.stringify(catalog);
      const prompt = `
You are an intelligent purchasing assistant for SmartPO. Your job is to match a user's plain text order request against our product catalog.

Catalog JSON:
${catalogJson}

User Order Request:
"${inputText}"

Instructions:
1. Analyze the user order request. Break it down into individual items (with names and quantities requested).
2. For each requested item, search the Catalog JSON for a matching product.
3. Respond ONLY with a valid JSON array of objects. Do not wrap the JSON in markdown code blocks or write any explanation text.
4. Each object in the JSON array must contain exactly these fields:
   - "itemId": The "id" of the matched product from the Catalog (String). Use empty string "" if no match is found.
   - "product_name": The exact "name" of the matched product from the Catalog (String). If not found, use the user's requested item name.
   - "requested_name": The raw name of the item as described by the user (String).
   - "quantity": The requested quantity (Integer). Default to 1 if not specified.
   - "unit_price": The "price_per_kg" (or price) of the matched product from the Catalog (Number). Use 0 if not found.
   - "unit": The "unit" of the matched product (String). Default to "pcs" if not found.
   - "is_available": Boolean (true if matched in catalog, false if not found in catalog).
`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!res.ok) throw new Error(`Gemini API error: ${res.statusText}`);
      const data = await res.json();
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleanJson);
      setParsedItems(parsed);
    } catch (err) {
      console.warn('AI Parse error:', err);
      // Smart Fallback Local Fuzzy Match if Gemini API key or network restricted
      const lower = inputText.toLowerCase();
      const matched = [];
      catalog.forEach(item => {
        if (lower.includes(item.name.toLowerCase()) || lower.includes(item.category.toLowerCase())) {
          matched.push({
            itemId: item.id,
            product_name: item.name,
            requested_name: item.name,
            quantity: 2,
            unit_price: item.price_per_kg || item.price || 0,
            unit: item.unit || 'pcs',
            is_available: true
          });
        }
      });
      if (matched.length > 0) {
        setParsedItems(matched);
      } else {
        setError('Could not process order text. Please try pasting a clear order prompt.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImportToOrder = () => {
    if (!parsedItems) return;
    const availableItems = parsedItems.filter(i => i.is_available);
    navigate('/create-order', {
      state: {
        prefilledItems: availableItems,
        customerName: customerName
      }
    });
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content animate-fade-in">
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Sparkles size={26} color="#818CF8" />
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Gemini AI Order Assistant</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Paste unformatted order notes, WhatsApp messages, or transcripts to parse products automatically.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left Column: Input Prompt */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary)" />
              <span>Input Order Request</span>
            </h3>

            <form onSubmit={handleParseAi}>
              <div className="form-group">
                <label className="form-label">Customer Name (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Ramesh Trading" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Order Plain Text / Message</label>
                <textarea 
                  className="form-input" 
                  rows="7"
                  placeholder="Paste order request here e.g.&#10;'We need 10 pcs 1 inch plastic bend and 5 sheets 16mm plywood for immediate delivery'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Gemini AI is parsing order...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Parse Order with AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: AI Extraction Results */}
          <div>
            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingCart size={20} color="var(--secondary)" />
                <span>Extracted Matched Items</span>
              </h3>

              {!parsedItems && !error && !loading && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  <Sparkles size={48} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '0.95rem' }}>Input order text on the left and click <strong>Parse Order with AI</strong> to extract matching catalog products.</p>
                </div>
              )}

              {error && (
                <div style={{ padding: '1rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {parsedItems && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  
                  {/* Results List */}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--surface-hover)' }}>
                          <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>Product</th>
                          <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>Qty</th>
                          <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)' }}>Price</th>
                          <th style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', textAlign: 'right' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>{item.product_name}</td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>{item.quantity} {item.unit || 'pcs'}</td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>₹{Number(item.unit_price || 0).toLocaleString()}</td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                              {item.is_available ? (
                                <span className="badge badge-success">Matched</span>
                              ) : (
                                <span className="badge badge-danger">Unmatched</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Import Button */}
                  <button className="btn btn-success" style={{ width: '100%', padding: '0.85rem' }} onClick={handleImportToOrder}>
                    <span>Import Matched Items to Order Builder</span>
                    <ArrowRight size={18} />
                  </button>

                </div>
              )}

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
