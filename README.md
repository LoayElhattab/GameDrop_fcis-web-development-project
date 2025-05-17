
![LogoWhite](https://github.com/user-attachments/assets/ccffa949-d0a6-4b9e-a1e8-db3b06e2ecfd)

# GameDrop


GameDrop is a comprehensive web-based e-commerce platform designed to facilitate the purchase and delivery of video games, built using modern web technologies.

## Project Overview

GameDrop provides a streamlined, user-friendly interface that enables customers to browse available games, add them to a shopping cart, complete the checkout process, and track their order history. For administrators, GameDrop offers robust inventory management capabilities, order processing tools, and user management features to ensure efficient operation and customer satisfaction.

### Key Objectives

- Provide seamless shopping experience for video game purchases
- Enhance product visibility with comprehensive information
- Streamline transaction processing with intuitive cart management
- Establish inventory control with stock tracking mechanisms
- Facilitate administration with robust management tools
- Enable customer feedback through reviews and ratings

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT, bcryptjs

### Frontend
- **Library**: React
- **Routing**: react-router-dom
- **Form Handling**: Formik
- **State Management**: React's built-in state (useState, useContext)
- **UI Framework**: Material UI

### Development Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Linting**: ESLint
- **Code Formatting**: Prettier

## Features

### User Features
- User registration and authentication with JWT
- Browse and search game catalog with filtering options
- Detailed product pages with game information
- Shopping cart functionality
- Checkout process with shipping information
- Order history tracking
- Product reviews and ratings

### Admin Features
- Comprehensive product management (CRUD operations)
- Order processing and status updates
- User account management
- Inventory/stock monitoring

## Database Schema

GameDrop utilizes a PostgreSQL database with the following core tables:

- **Users**: Stores registered users with roles (CUSTOMER, ADMIN)
- **Products**: Contains video game products with details and stock information
- **Carts**: Represents user shopping carts
- **CartItems**: Junction table for cart-product relationships
- **Orders**: Stores order information with status tracking
- **OrderItems**: Junction table for orders-product relationships
- **Reviews**: Stores product reviews and ratings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Login and receive JWT

### Products
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get single product details
- `POST /api/products` - (Admin) Create a new product
- `PUT /api/products/:id` - (Admin) Update product details
- `DELETE /api/products/:id` - (Admin) Delete a product

### Cart
- `GET /api/cart` - Get current user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item quantity
- `DELETE /api/cart/items/:productId` - Remove item from cart

### Orders
- `POST /api/orders` - Place a new order
- `GET /api/orders/my-history` - Get user's order history
- `GET /api/orders` - (Admin) Get all orders
- `GET /api/orders/:id` - Get specific order details
- `PUT /api/orders/:id/status` - (Admin) Update order status

### Reviews
- `POST /api/products/:id/reviews` - Add a review for a product
- `GET /api/products/:id/reviews` - Get all reviews for a product

### Admin
- `GET /api/admin/users` - (Admin) Get all users
- `GET /api/admin/dashboard` - (Admin) Get dashboard statistics

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
1. Clone the repository
   ```
   git clone https://github.com/your-username/gamedrop.git
   cd gamedrop/backend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with the following variables
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/gamedrop_db"
   JWT_SECRET="your-jwt-secret"
   PORT=5000
   NODE_ENV=development
   ```

4. Run Prisma migrations
   ```
   npx prisma migrate dev
   ```

5. Start the development server
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory
   ```
   cd ../frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with the following variables
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the development server
   ```
   npm start
   ```

## Testing
- Run backend tests:
  ```
  cd backend
  npm test
  ```

## Development
- Run linting:
  ```
  npm run lint
  ```
- Run formatting:
  ```
  npm run format
  ```

## License
This project is licensed under the MIT License - see the LICENSE file for details.
