# Shopify CLI Setup & Hydrogen Storefront

This repository covers **Shopify CLI setup** and a **Shopify Hydrogen demo storefront**. It explains installation, authentication, common commands, and running a Hydrogen storefront locally using Shopify Storefront API.

---

## 📌 Part 1: Shopify CLI Setup

### 🚀 What is Shopify CLI?

Shopify CLI is an official command-line tool that helps developers create, manage, and run Shopify themes, apps, and Hydrogen storefronts efficiently.

---

### 🧰 Prerequisites

Before installing Shopify CLI, ensure you have the following:

- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Shopify Partner Account** - [Sign up here](https://partners.shopify.com/)
- **Shopify Development Store** - Create one from your Partner Dashboard

---

### 📦 Install Shopify CLI

Install Shopify CLI globally using npm:

```bash
npm install -g @shopify/cli
```

Verify installation:

```bash
shopify version
```

---

### 🔐 Login to Shopify

Authenticate with your Shopify Partner account:

```bash
shopify login
```

Login to a specific store:

```bash
shopify login --store your-store-name.myshopify.com
```

---

### 🛠 Common Shopify CLI Commands

#### List Available Commands

```bash
shopify help
```

#### Create a Shopify App

```bash
shopify app create
```

This command will guide you through creating a new Shopify app with options for different frameworks.

#### Create a Hydrogen Storefront

```bash
shopify hydrogen init
```

This scaffolds a new Hydrogen project with all necessary dependencies.

#### Run a Shopify Project Locally

```bash
shopify dev
```

This starts a local development server for your Shopify project (themes, apps, or Hydrogen).

#### Deploy Your App

```bash
shopify app deploy
```

#### Push Theme to Shopify

```bash
shopify theme push
```

#### Pull Theme from Shopify

```bash
shopify theme pull
```

---

## 📌 Part 2: Shopify Hydrogen Storefront

### 🌐 What is Shopify Hydrogen?

Hydrogen is Shopify's React-based framework for building custom storefronts using the Storefront API. It provides optimized components and utilities for e-commerce development.

---

### 🏗 Create a New Hydrogen Project

Initialize a new Hydrogen storefront:

```bash
shopify hydrogen init my-hydrogen-store
cd my-hydrogen-store
```

---

### 📁 Project Structure

```
my-hydrogen-store/
├── app/
│   ├── routes/          # Application routes
│   ├── components/      # React components
│   ├── styles/          # CSS/styling files
│   └── root.jsx         # Root component
├── public/              # Static assets
├── server.js            # Server configuration
├── package.json         # Dependencies
└── .env                 # Environment variables
```

---

### 🔑 Configure Storefront API Access

1. **Create a Custom App** in your Shopify Admin:
   - Go to **Settings** → **Apps and sales channels** → **Develop apps**
   - Click **Create an app**
   - Name your app and create it

2. **Configure Storefront API Scopes**:
   - Go to **Configuration** tab
   - Under **Storefront API**, add required access scopes:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_collection_listings`

3. **Get API Credentials**:
   - Go to **API credentials** tab
   - Copy the **Storefront API access token**

4. **Add Credentials to `.env` File**:

```env
PUBLIC_STOREFRONT_API_TOKEN=your_storefront_access_token
PUBLIC_STORE_DOMAIN=your-store-name.myshopify.com
```

---

### 🚀 Run Hydrogen Storefront Locally

Start the development server:

```bash
npm run dev
```

Your Hydrogen storefront will be available at `http://localhost:3000`

---

### 🎨 Key Hydrogen Components

Hydrogen provides pre-built components for common e-commerce patterns:

```jsx
import {
  ProductProvider,
  ProductPrice,
  ProductTitle,
  Image,
  AddToCartButton
} from '@shopify/hydrogen';

export default function ProductDetails({product}) {
  return (
    <ProductProvider data={product}>
      <Image data={product.featuredImage} />
      <ProductTitle />
      <ProductPrice />
      <AddToCartButton />
    </ProductProvider>
  );
}
```

---

### 📊 Fetching Data with Storefront API

Example query for products:

```javascript
const PRODUCTS_QUERY = `#graphql
  query Products {
    products(first: 10) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          featuredImage {
            url
            altText
          }
        }
      }
    }
  }
`;
```

---

### 🚢 Deploy Hydrogen Storefront

Deploy to Oxygen (Shopify's hosting platform):

```bash
shopify hydrogen deploy
```

Or deploy to other platforms like Vercel, Netlify, or custom servers.

---

## 📚 Additional Resources

- [Shopify CLI Documentation](https://shopify.dev/docs/api/shopify-cli)
- [Hydrogen Documentation](https://shopify.dev/docs/custom-storefronts/hydrogen)
- [Storefront API Reference](https://shopify.dev/docs/api/storefront)
- [Shopify Partner Dashboard](https://partners.shopify.com/)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For issues and questions:
- [Shopify Community Forums](https://community.shopify.com/)
- [Shopify Dev Discord](https://discord.gg/shopifydevs)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**Happy Building! 🎉**
