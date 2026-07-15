# NURAA P0 launch plan

## P0 outcome

P0 establishes a trustworthy, server-authoritative purchase foundation:

1. Product discovery and detail pages read the live catalog.
2. Guest carts persist in PostgreSQL through an opaque, HTTP-only cookie.
3. Quantity, availability, price, delivery and tax are recalculated on the server.
4. Checkout captures a Saudi delivery address and creates customer, order, payment, shipment and inventory records atomically.
5. Orders and customers are visible in Admin; paid orders can move through processing, shipped and delivered states.
6. Purchase analytics are tied to the order and UTM context without double-counting multi-item orders in the funnel.

## Safety boundary

The mock payment simulator works only when `NODE_ENV` is not `production`. Production checkout returns `PAYMENT_NOT_CONFIGURED` until a real Saudi payment service provider is integrated. This prevents an unpaid order from being shown as paid.

## Deployment sequence

1. Back up the Supabase database.
2. Add the variables from `.env.example` to Vercel. Never put `SUPABASE_SECRET_KEY` or database passwords in public variables.
3. Run `npm run db:deploy` once against the production `DIRECT_URL`.
4. Run `npm run db:seed` only if the catalog seed is intentionally required. It is not a routine deployment command.
5. Connect a supported Saudi payment provider and replace the mock adapter with hosted checkout/payment-intent creation plus a signed webhook.
6. Test one low-value live payment, failed payment and refund; confirm order, stock, email and analytics outcomes.
7. Verify `/en`, `/ar`, product detail, bag, checkout, order confirmation, `/admin/orders`, `/admin/customers`, product upload and homepage CMS.

## Go-live gates

- Real payment credentials and signed webhook are configured.
- Saudi VAT, shipping fees, delivery promise and return policy are approved and visible.
- At least one end-to-end live order is fulfilled and refunded in a controlled test.
- Privacy policy, terms, return policy and customer support contact are published.
- TikTok Pixel/Events API consent and event mapping are verified before paid traffic.
- Error monitoring and an order-alert channel are active.

Until every gate is complete, the site is suitable for catalog/UX testing and development orders, but not for accepting paid public traffic.
