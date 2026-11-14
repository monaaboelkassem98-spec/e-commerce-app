# ShopStream E-commerce

ShopStream is a responsive front-end e-commerce demo built with React, Vite, React Bootstrap, and React Router. It demonstrates the main customer journey: discovering products, viewing product details, managing a shopping cart, entering checkout information, and reviewing a confirmation page.

The UI follows the supplied ShopStream design references with a shared color palette, typography, navigation, footer, product cards, and responsive layouts.

> **Page count:** The current router defines nine page routes. `EmptyState` is a reusable component and is not a separate route.

## What You Can Build with This Project

- **Home page (`/home`)** — Fetches products and presents a hero section, categories, featured products, and a newsletter form.
- **Login (`/login`)** — Sends a username and password to DummyJSON's demo login endpoint.
- **Register (`/register`)** — Provides a registration form with client-side validation. It does not create an account or call an API.
- **Product catalog (`/products`)** — Fetches the product catalog and supports text search, category, brand, price and rating filters, sorting, and pagination.
- **Product details (`/products/:id`)** — Fetches a product by ID and shows its images, ratings, price, options, quantity controls, and related products.
- **Shopping cart (`/cart`)** — Displays saved cart products, lets customers change quantities or remove items, and calculates order totals.
- **Checkout (`/checkout`)** — Collects shipping and billing details and offers demo card, PayPal, and cash-on-delivery selections.
- **Order confirmation (`/order-success`)** — Shows the created demo order, estimated delivery, shipping information, and order totals.
- **User profile (`/profile`)** — Stores editable profile details, addresses, payment labels, preferences, and order history in the browser.
- **Reusable empty state** — A configurable component for empty carts, empty results, and similar situations.

## Requirements

- Node.js **20.19+** or **22.12+** (required by the Vite version used in this project)
- npm
- Internet access for the DummyJSON product and login endpoints
- A modern browser with JavaScript enabled

## Tech Stack

- React 19 and React DOM
- Vite 8
- React Bootstrap and Bootstrap 5
- React Router DOM 7
- React Icons
- Custom CSS
- DummyJSON public API

## Run the Existing Project

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

   Replace `<repository-url>` with your repository's URL. If you already have the project files, skip this command.

2. Open the project directory:

   ```bash
   cd e-commerce-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local address printed in the terminal by Vite.

## Recreate the Project from Scratch

The following steps describe how to scaffold the application and implement its main parts.

### 1. Create a React/Vite project

```bash
npm create vite@latest shopstream -- --template react
cd shopstream
npm install
```

Use the required Node.js version before scaffolding. Vite may not run with an older Node.js release.

### 2. Install the UI and routing packages

```bash
npm install react-bootstrap bootstrap react-router-dom react-icons
```

The Vite React template includes React and React DOM. Keep its ESLint and build tooling if you want to run the same quality checks as this project.

### 3. Create the source structure

Add these application files:

```text
src/
├── App.jsx
├── main.jsx
├── components/
│   ├── EmptyState.jsx
│   ├── ProductCard.jsx
│   ├── ShopStreamFooter.jsx
│   └── ShopStreamNavbar.jsx
├── pages/
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── OrderSuccess.jsx
│   ├── ProductDetails.jsx
│   ├── Products.jsx
│   ├── Register.jsx
│   └── UserProfile.jsx
├── services/
│   ├── cartService.js
│   └── productService.js
└── styles/
    └── global.css
```

### 4. Set up the application entry point

In `src/main.jsx`, render `<App />` inside `React.StrictMode` and import Bootstrap CSS before the application's custom CSS:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 5. Add the page routes

In `src/App.jsx`, wrap the application with `BrowserRouter`, redirect `/` to `/home`, and register the nine routes listed below. Keep `/products/:id` as the product-details route and `/products` as the catalog route.

| Page | Route |
| --- | --- |
| Home | `/home` |
| Login | `/login` |
| Register | `/register` |
| Product catalog | `/products` |
| Product details | `/products/:id` |
| Cart | `/cart` |
| Checkout | `/checkout` |
| User profile | `/profile` |
| Order confirmation | `/order-success` |

Use React Router's `Link` or `NavLink` for internal navigation rather than regular anchors, except for in-page anchors such as `#categories`.

### 6. Connect the product API

Create `src/services/productService.js` with functions for retrieving the catalog and a product by ID. Check each response's `ok` status and surface failures to the page so it can show an error and retry action.

The app uses:

```text
GET  https://dummyjson.com/products?limit=100
GET  https://dummyjson.com/products/:id
GET  https://dummyjson.com/products/category/:category?limit=5
POST https://dummyjson.com/auth/login
```

Use `useEffect` to fetch data when a page loads, and track loading, error, and successful states. Keep request cleanup in place when a component can unmount before a request completes.

### 7. Build shared components

- **`ShopStreamNavbar.jsx`** — Add links for Home, Products, and Categories; a search form; and cart/profile icon links. Read the cart item count from the cart service and update it when cart data changes.
- **`ShopStreamFooter.jsx`** — Provide consistent store and support links at the bottom of pages.
- **`ProductCard.jsx`** — Display a product thumbnail, category, rating, title, price, detail link, and add-to-cart action.
- **`EmptyState.jsx`** — Accept props for the icon, heading, description, main action, optional secondary action, tips, and popular categories.

Use React Bootstrap components for layout and controls, and React Icons for consistent interface icons.

### 8. Implement pages and their interactions

1. **Home:** Fetch products, derive category groups and featured products, and link each category to `/products?category=<category>`.
2. **Products:** Fetch the catalog, read `q` and `category` from URL search parameters, filter/sort the products, and paginate the results.
3. **Product details:** Read the ID with `useParams()`, fetch the product, and update the main image when a gallery thumbnail is selected.
4. **Cart:** Load the saved cart, allow quantity changes and removal, and recalculate totals after each change.
5. **Checkout:** Validate required fields, create a demo order from cart items and shipping details, and navigate to `/order-success` with the order in route state.
6. **Order confirmation:** Show the order summary, save the order to local history, and clear the cart after confirmation.
7. **User profile:** Load and save profile, address, preference, and order-history data.
8. **Login/Register:** Implement the login API request and registration form validation. Registration remains a UI-only demo unless a backend is added.

### 9. Use consistent cart calculations

The current demo calculates totals as follows:

- **Subtotal:** Sum of each product's price multiplied by its quantity.
- **Shipping:** Free for orders of $100 or more; otherwise $9.99.
- **Estimated tax:** 8% of the subtotal.
- **Total:** Subtotal + shipping + estimated tax.

Use the same rules in the cart, checkout, and confirmation flow to avoid conflicting totals.

### 10. Apply the design system and test

In `src/styles/global.css`, define the ShopStream colors, font stack, button states, form focus styles, card borders, navigation styling, and reduced-motion behavior. Use Bootstrap's responsive grid (`Container`, `Row`, and `Col`) to support small and large screens.

Run the app and check each route, including empty states, loading and error states, query-string filters, cart quantity changes, and checkout navigation. Then run the available project checks:

```bash
npm run lint
npm run build
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

## Search and Category URLs

Search and category filters are stored in the product catalog URL:

- `/products?q=phone`
- `/products?category=beauty`

The home page category cards navigate to the matching category-filtered product list. The shared navigation's search form opens the catalog with the entered search query.

## Demo Data, Storage, and Security

This repository is a **front-end demonstration**, not a production commerce or payment system:

- Cart items use browser `localStorage` and product details are refreshed from DummyJSON when the cart page opens.
- Profile details, addresses, payment labels, preferences, and order history use browser `localStorage`.
- Login uses DummyJSON. Registration validates fields but does not create a remote account.
- Checkout creates a local demo order. Card, PayPal, and cash-on-delivery selections do not process a real transaction.
- The product color choice is visual only and is not applied to cart items.
- Payment labels in the profile should contain non-sensitive display data only.

Never enter real card numbers or CVVs into the demo checkout. Do not store passwords or sensitive payment data in `localStorage`. A production implementation needs a secure backend for authentication, customer data, inventory, and orders, plus a compliant payment provider.

## Project Structure

```text
src/
├── components/     Shared navigation, footer, product card, and empty state
├── pages/          Route-level storefront and account pages
├── services/       Product API and cart storage helpers
├── styles/         Global design-system styles
├── assets/         Static images and application assets
├── App.jsx         Application routes
└── main.jsx        React entry point and global styles
```
