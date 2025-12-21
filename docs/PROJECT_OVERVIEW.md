# Bazaary Project Documentation

## Overview
Bazaary is a marketplace platform supporting three main user roles: Buyer, Seller, and Admin. The application is built with a focus on real user journeys, implementing only the routes and features required for the MVP.

## Table of Contents
- [Project Structure](#project-structure)
- [User Journeys](#user-journeys)
- [API Route Usage](#api-route-usage)
- [Security Considerations](#security-considerations)
- [Testing](#testing)
- [Future Roadmap](#future-roadmap)

---

## Project Structure

```
root/
  backend/      # NestJS backend
  frontend/     # Next.js frontend
  docs/         # Documentation
  docker-compose.yml
  ...
```

---

## User Journeys

### Buyer
- Browse products
- Add to cart
- Place orders
- View order status

### Seller
- Register as seller
- List products
- Fulfill orders
- View wallet and payouts

### Admin
- Review payouts
- Manage unlock requests
- Oversee platform operations

---

## API Route Usage

| Route                        | Status         | Reason/Notes                                      |
|------------------------------|---------------|---------------------------------------------------|
| GET /auth/me                 | Optional      | Token-based auth used instead                     |
| PATCH /listings/:id          | Future        | Listing edits not built yet                       |
| GET /listings/:id            | Optional      | Product page already covers                       |
| POST /inventory/adjust       | Backend-only  | Dangerous for frontend, admin/internal only        |
| GET /inventory/:listingId    | Backend-only  | Not a buyer concern                               |
| GET /orders/:id/items        | Optional      | Detail view not needed yet                        |
| POST /orders/:id/cancel      | Future        | Refund flow not ready                             |
| GET /payments/:id            | Optional      | Admin/debug only                                  |
| GET /payments/order/:orderId | Optional      | Admin/debug only                                  |
| POST /payments/refund        | Avoid now     | High-risk, needs robust wallet/ledger             |
| /events/*                    | Never         | Internal system ops only                          |

- Only routes required by active user journeys are implemented.
- Unused routes are documented for future capacity.

---

## Security Considerations
- Backend-only and admin routes are protected and never exposed to the frontend.
- Sensitive operations (refunds, inventory adjustments, events) are restricted to authorized users.
- JWT-based authentication is used for MVP; consider /auth/me for future enhancements (token refresh, server-side checks).

---

## Testing
- Focused on active user journeys (buyer purchase, seller fulfillment, admin payout).
- Integration and end-to-end tests are prioritized for critical flows.
- Future features should include corresponding tests before release.

---

## Future Roadmap
- Enable listing edits (PATCH /listings/:id)
- Add buyer order cancellation and refund flows
- Implement /auth/me for token refresh and profile updates
- Expand admin tools for platform management
- Enhance security and monitoring

---

## Contribution Guidelines
- Only implement features/routes required by real user journeys.
- Document any new or unused routes in this file.
- Prioritize security and testing for all new features.

---

## Contact
For questions or contributions, please contact the project maintainer.
