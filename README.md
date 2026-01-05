# YCompany - Retail Inventory Management Software System (RIMSS)

This monorepo contains two Angular applications and a Node.js backend:

- **Shop**: Customer-facing e-commerce app
- **Admin**: Admin dashboard for managing products, categories, and orders
- **Server**: Node.js/Express backend with MongoDB

---

## Shop Application

- Path: `client/shop/`
- Features:
  - Product catalog, search, filter, sort
  - Cart and wishlist management
  - Checkout with Stripe payment integration
  - User profile and authentication
  - Responsive UI with Angular Material & PrimeNG
- Start:
  ```bash
  cd client/shop
  npm install
  ng serve
  ```
  App runs at [http://localhost:4200](http://localhost:4200)

## Admin Application

- Path: `client/admin/`
- Features:
  - Product CRUD (create, update, delete)
  - Category management
  - Order management
  - Dashboard analytics
  - Admin authentication
- Start:
  ```bash
  cd client/admin
  npm install
  ng serve
  ```
  App runs at [http://localhost:4300](http://localhost:4300)

## Backend Server

- Path: `server/`
- Features:
  - RESTful API for products, categories, orders, users, comments
  - JWT authentication
  - MongoDB database
  - File upload for product images
- Start:
  ```bash
  cd server
  npm install
  node app.js
  ```
  API runs at [http://localhost:5000/api/v1/](http://localhost:5000/api/v1/)

## Environment Setup

- Create `.env` in `server/` with:
  ```env
  MONGO_URI=your_mongodb_connection_string
  PORT=5000
  JWT_SECRET=your_jwt_secret
  JWT_LIFETIME=1d
  CORS_ORIGIN=http://localhost:4200
  STRIPE_SECRET_KEY=your_stripe_secret_key
  ```

## Notes

- Replace Stripe keys in both frontend and backend for payments
- Shop and Admin apps use separate Angular projects
- For development, run all three apps in parallel
- For API endpoints, see `server/routes/`

---

## Folder Structure

```
client/
  shop/      # Customer app
  admin/     # Admin dashboard
server/      # Node.js backend
```

## License

MIT
