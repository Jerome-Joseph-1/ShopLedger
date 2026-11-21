const { test } = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');

const rice = { name: 'Rice', sku: 'R', hsn: '1006', price: 640, qty: 1 };
const oil = { name: 'Oil', sku: 'O', hsn: '1512', price: 190, qty: 2 };

test('order 1002 applies discount before 5% GST', () => {
  const result = invoice.computeInvoiceFigures({ items: [rice, oil], coupon: 'SAVE10' });
  assert.equal(result.subtotal, 1020);
  assert.equal(result.discount, 102);
  assert.equal(result.tax, 45.9);
  assert.equal(result.total, 963.9);
  assert.deepEqual(result.rows.map(r => [r.gstPercent, r.lineTax]), [[5, 28.8], [5, 17.1]]);
});

test('order 1004 applies the SAVE10 discount cap', () => {
  const result = invoice.computeInvoiceFigures({ items: [{name:'Oil', hsn:'1508', price:1120, qty:2}], coupon:'SAVE10' });
  assert.deepEqual([result.discount, result.tax, result.total], [150, 104.5, 2194.5]);
});

test('orders 1001 and 1007 use mixed HSN slabs without coupons', () => {
  const a = invoice.computeInvoiceFigures({ items: [{name:'Tea', hsn:'0902', price:140, qty:2}, {name:'Dal', hsn:'0713', price:165, qty:2}] });
  const b = invoice.computeInvoiceFigures({ items: [{name:'Ghee', hsn:'0405', price:450, qty:2}, oil] });
  assert.deepEqual([a.tax, a.total], [66.9, 676.9]);
  assert.deepEqual([b.tax, b.total], [127, 1407]);
});

test('all 18% without coupon retains current behavior', () => {
  const result = invoice.computeInvoiceFigures({ items: [{name:'Tea', hsn:'0902', price:500, qty:1}] });
  assert.deepEqual([result.tax, result.total], [90, 590]);
});

test('mixed rates, fractional rounding and GST split follow checkout', () => {
  const result = invoice.computeInvoiceFigures({ items: [{name:'A', hsn:'1006', price:100.05, qty:1}, {name:'B', hsn:'0405', price:200.03, qty:1}], coupon:'WELCOME' });
  assert.deepEqual([result.subtotal, result.discount, result.tax, result.cgst, result.sgst, result.total], [300.08, 15, 27.55, 13.78, 13.77, 312.63]);
  assert.deepEqual(result.rows.map(r => [r.gstPercent, r.lineTax]), [[5, 4.75], [12, 22.8]]);
});

test('empty items and explicit zero GST are supported', () => {
  assert.equal(invoice.computeInvoiceFigures({}).total, 0);
  const result = invoice.computeInvoiceFigures({items:[{name:'Zero', price:100, qty:1, gstRate:0}]});
  assert.equal(result.tax, 0);
  assert.equal(result.rows[0].gstPercent, 0);
});

test('rendered invoice displays corrected values without mismatch notice', () => {
  const html = invoice.render({id:1002, items:[rice, oil], coupon:'SAVE10', total:963.9});
  assert.match(html, /₹963\.90/);
  assert.match(html, /₹45\.90/);
  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
});
