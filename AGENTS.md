# ShopLedger agent guidance

- Node.js application using Express; start with `npm start`.
- Run tests with `node --test` (the npm test script is a placeholder).
- `public/` contains the UI; `server.js` mounts `routes/` and serves invoices.
- `lib/` holds pricing, tax, inventory, orders, ledger, reports and storage logic.
- `config.js` contains shop settings, tax slabs and coupon rules.
- `data/db.json` is the tracked JSON database. Tests must never modify it.
- Use in-memory fixtures or a temporary copy for tests and reproductions.
- Read the code before changes and characterize existing behavior first.
- Keep the fix small and review the diff before opening a pull request.
- Ticket 1 concerns invoice and GST mismatches: production changes belong in
  `lib/invoice.js`; change `lib/tax.js` only if truly necessary.
- Do not commit the generated `package-lock.json` or runtime data changes.
