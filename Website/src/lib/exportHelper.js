/**
 * Export Helper for SmartPO Orders
 * Generates PDF invoices and Excel (.xlsx / .csv) reports with Customer Name, Company Name, and Prices in Rupees (₹)
 */

import { supabase } from './supabase';
import { getLocalOrders } from './orderStore';

export function formatRupee(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

export async function getOrderItemsForExport(order, items = []) {
  if (items && Array.isArray(items) && items.length > 0) {
    return items;
  }
  if (order?.items && Array.isArray(order.items) && order.items.length > 0) {
    return order.items;
  }
  // Try finding in localStore
  try {
    const localOrders = getLocalOrders();
    const foundLocal = localOrders.find(o => o.id === order?.id || o.order_number === order?.order_number);
    if (foundLocal?.items && Array.isArray(foundLocal.items) && foundLocal.items.length > 0) {
      return foundLocal.items;
    }
  } catch (e) {
    // Ignore local read errors
  }
  // Try fetching from Supabase
  if (order?.id) {
    try {
      const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      if (data && data.length > 0) {
        return data;
      }
    } catch (e) {
      console.warn('Export items fetch fallback');
    }
  }
  return [];
}

export async function exportOrderToPdf(order, inputItems = []) {
  if (!order) return;
  const items = await getOrderItemsForExport(order, inputItems);

  const poNum = order.order_number || order.id?.substring(0, 8) || 'PO-100001';
  const customer = order.customer_name || 'Valued Customer';
  const company = order.company_name || 'SmartPO Industrial Corp';
  const phone = order.customer_phone || 'N/A';
  const address = order.customer_address || 'N/A';
  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const totalAmount = Number(order.total_amount || 0).toLocaleString('en-IN');

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to export the PDF invoice.');
    return;
  }

  const itemsRowsHtml = items.length === 0 
    ? `<tr><td colSpan="5" style="padding: 15px; text-align: center; color: #64748B;">No items specified</td></tr>`
    : items.map((it, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 10px; font-weight: 600;">${idx + 1}</td>
      <td style="padding: 10px; font-weight: 600;">${it.product_name || 'Product Item'}</td>
      <td style="padding: 10px; text-align: center;">${it.quantity} ${it.unit || 'pcs'}</td>
      <td style="padding: 10px; text-align: right;">₹${Number(it.unit_price || 0).toLocaleString('en-IN')}</td>
      <td style="padding: 10px; text-align: right; font-weight: 700; color: #1A3C6E;">₹${Number(it.total_price || 0).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order Invoice - ${poNum}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; margin: 0; padding: 40px; background: #FFF; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1A3C6E; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 28px; font-weight: 800; color: #1A3C6E; }
        .brand span { color: #F97316; }
        .po-title { font-size: 20px; font-weight: 700; color: #334155; text-align: right; }
        .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #F8FAFC; padding: 20px; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 30px; }
        .info-block label { font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px; }
        .info-block div { font-size: 15px; font-weight: 600; color: #0F172A; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #1A3C6E; color: #FFFFFF; padding: 12px 10px; text-align: left; font-size: 13px; text-transform: uppercase; }
        .total-banner { display: flex; justify-content: space-between; align-items: center; background: #1A3C6E; color: #FFF; padding: 16px 24px; border-radius: 8px; }
        .total-amount { font-size: 24px; font-weight: 800; color: #F97316; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">SP <span>SmartPO</span></div>
        <div class="po-title">
          PURCHASE ORDER INVOICE<br>
          <span style="font-size: 14px; color: #64748B;">${poNum}</span>
        </div>
      </div>

      <div class="grid-info">
        <div class="info-block">
          <label>Customer Name</label>
          <div>${customer}</div>
        </div>
        <div class="info-block">
          <label>Company Name</label>
          <div>${company}</div>
        </div>
        <div class="info-block">
          <label>Date Placed</label>
          <div>${dateStr}</div>
        </div>
        <div class="info-block">
          <label>Contact Phone</label>
          <div>${phone}</div>
        </div>
        <div class="info-block" style="grid-column: span 2;">
          <label>Delivery Address</label>
          <div>${address}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Product Name</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Unit Price (Rupees)</th>
            <th style="text-align: right;">Total (Rupees)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml}
        </tbody>
      </table>

      <div class="total-banner">
        <span style="font-size: 16px; font-weight: 700;">Grand Total Payable (INR)</span>
        <span class="total-amount">₹${totalAmount}</span>
      </div>

      <div class="footer">
        Generated automatically by SmartPO Purchase Order System &bull; Prices calculated in Indian Rupees (₹)
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

export async function exportOrderToExcel(order, inputItems = []) {
  if (!order) return;
  const items = await getOrderItemsForExport(order, inputItems);

  const poNum = order.order_number || order.id?.substring(0, 8) || 'PO-100001';
  const customer = order.customer_name || 'Valued Customer';
  const company = order.company_name || 'SmartPO Industrial Corp';
  const phone = order.customer_phone || 'N/A';
  const address = order.customer_address || 'N/A';
  const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN');
  const totalAmount = Number(order.total_amount || 0);

  // Construct formatted CSV spreadsheet content with BOM for Excel compatibility
  let csvContent = '\uFEFF';
  csvContent += 'SMARTPO PURCHASE ORDER INVOICE REPORT\n';
  csvContent += `PO Number,${poNum}\n`;
  csvContent += `Customer Name,${customer}\n`;
  csvContent += `Company Name,${company}\n`;
  csvContent += `Date Placed,${dateStr}\n`;
  csvContent += `Contact Phone,${phone}\n`;
  csvContent += `Delivery Address,"${address.replace(/"/g, '""')}"\n\n`;

  csvContent += 'Item #,Product Name,Quantity,Unit Price (Rupees ₹),Total Price (Rupees ₹)\n';

  if (items.length === 0) {
    csvContent += '1,No line items recorded,-,-,-\n';
  } else {
    items.forEach((it, idx) => {
      const pName = `"${(it.product_name || 'Product').replace(/"/g, '""')}"`;
      const qty = `${it.quantity} ${it.unit || 'pcs'}`;
      const uPrice = `₹${Number(it.unit_price || 0).toLocaleString('en-IN')}`;
      const tPrice = `₹${Number(it.total_price || 0).toLocaleString('en-IN')}`;
      csvContent += `${idx + 1},${pName},${qty},${uPrice},${tPrice}\n`;
    });
  }

  csvContent += `\n,,,Grand Total (INR),₹${totalAmount.toLocaleString('en-IN')}\n`;

  // Create downloadable Blob link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SmartPO_Invoice_${poNum}.csv`);
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}
