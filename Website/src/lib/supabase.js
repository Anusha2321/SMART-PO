import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jnnjzgwgqjncjeunfcis.supabase.co';
const supabaseAnonKey = 'sb_publishable_3G7Gdw4E2DKW_SGmZEEmoA_tv3r3BRf';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

let cachedProducts = null;

export async function fetchCatalogProducts() {
  if (cachedProducts && cachedProducts.length > 0) {
    return cachedProducts;
  }

  // 1. Fetch full catalog JSON (2,471 items) matching Android mobile app
  try {
    const res = await fetch('/products.json');
    if (res.ok) {
      const items = await res.json();
      if (items && items.length > 0) {
        cachedProducts = items.map((item, index) => ({
          id: item.id || String(index + 1),
          name: item.name,
          category: item.category || 'OTHERS',
          price_per_kg: Number(item.price || item.price_per_kg || 0),
          unit: item.unit || 'pcs'
        }));
        return cachedProducts;
      }
    }
  } catch (e) {
    console.warn('Failed to load local products.json fallback', e);
  }

  // 2. Fallback to Supabase cloud query if local fetch fails
  try {
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error && data && data.length > 0) {
      cachedProducts = data.map((item, index) => ({
        id: item.id || String(index + 1),
        name: item.name,
        category: item.category || 'OTHERS',
        price_per_kg: Number(item.price_per_kg || item.price || 0),
        unit: item.unit || 'pcs'
      }));
      return cachedProducts;
    }
  } catch (err) {
    console.warn('Supabase fetch error');
  }

  return [];
}
