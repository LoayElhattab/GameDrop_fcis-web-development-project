// gamedrop-frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Typography } from '@mui/material'; // Make sure createTheme and CssBaseline are imported
import ScrollToTop from './components/ScrollToTop'; // Make sure ScrollToTop is imported
// --- Import your Providers ---
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import { CartProvider } from './contexts/CartContext'; // <<< Import CartProvider <<<

// --- Import your Layouts ---
import MainLayout from './layouts/MainLayout'; // Import MainLayout
import AdminLayout from './layouts/AdminLayout'; // Import AdminLayout

// --- Import your Route Wrappers ---
import PrivateRoute from './components/common/PrivateRoute'; // Import PrivateRoute
import AdminRoute from './components/common/AdminRoute'; // Import AdminRoute

// --- Import your Actual Page Components ---
// Remove the placeholder definitions and ensure you import from the correct paths
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage'; // Make sure this imports the component from pages/CartPage.jsx
import CheckoutPage from './pages/CheckoutPage'; // Import actual CheckoutPage
import OrderHistoryPage from './pages/OrderHistoryPage'; // Import actual OrderHistoryPage
import FilteredProductsSearch from './pages/FilteredProductsPage';
// import OrderDetailPage from './pages/OrderDetailPage'; // Import actual OrderDetailPage
// import ProfilePage from './pages/ProfilePage'; // Import actual ProfilePage

// --- Import Admin Pages ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage'; // Import actual Admin Dashboard
import AdminProductsPage from './pages/admin/AdminProductsPage'; // Import actual Admin Products Page
import AdminProductFormPage from './pages/admin/AdminProductFormPage'; // Import actual Admin Product Form Page
import AdminOrdersPage from './pages/admin/AdminOrdersPage'; // Import actual Admin Orders Page
import AdminUsersPage from './pages/admin/AdminUsersPage'; // Import actual Admin Users Page
import MyAccount from './pages/UserProfilePage';
// --- Remove all Placeholder Page Component Definitions from here ---
// const HomePageWrapper = () => <HomePage />; // REMOVE
// const ProductDetailPageWrapper = () => <ProductDetailPage />; // REMOVE
// const CartPage = () => <h1>Cart Page</h1>; // REMOVE - This was overwriting your actual CartPage component!
// const CheckoutPage = () => <h1>Checkout Page</h1>; // REMOVE
// const OrderHistoryPage = () => <h1>Order History Page</h1>; // REMOVE
// const OrderDetailPage = () => <h1>Order Detail Page</h1>; // REMOVE
// const ProfilePage = () => <h1>Profile Page</h1>; // REMOVE
// const AdminDashboardPage = () => <h1>Admin Dashboard</h1>; // REMOVE
// const AdminProductsPage = () => <h1>Admin Products Page</h1>; // REMOVE
// const AdminProductFormPage = () => <h1>Admin Product Form Page</h1>; // REMOVE
// const AdminOrdersPage = () => <h1>Admin Orders Page</h1>; // REMOVE
// const AdminUsersPage = () => <h1>Admin Users Page</h1>; // REMOVE
// --- End Placeholder Removals ---


// Define your dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // Define your primary and error colors here to match the prototype (e.g., purple for primary)
    primary: {
      main: '#8b5cf6', // Example purple from your button styles
      dark: '#7c3aed',
    },
    error: {
      main: '#f44336', // Standard MUI error red (or adjust if prototype uses a different color)
    },
    // Add other palette colors if needed
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c', // Dark background color for AppBar
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 20 },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            backgroundColor: '#8b5cf6',
            '&:hover': { backgroundColor: '#7c3aed' },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: '#8b5cf6',
            color: '#8b5cf6',
            '&:hover': {
              borderColor: '#7c3aed',
              color: '#7c3aed',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
            },
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#4a5568' },
            '&:hover fieldset': { borderColor: '#a0aec0' },
            '&.Mui-focused fieldset': { borderColor: '#8b5cf6' },
          },
          '& .MuiInputLabel-root': { color: '#a0aec0' },
          '& .MuiInputBase-input': { color: '#ffffff' },
        },
      },
    },
    // Add overrides for other components like Card, Paper, etc., here if needed
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Card background color matching ProductCard
          color: '#ffffff', // Default text color for Card content
        },
      },
    },
    MuiPaper: { // Used for Order Summary in CartDisplay
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', // Paper background color matching Order Summary
          color: '#ffffff', // Default text color
        },
      },
    },
    MuiDivider: { // Used in CartDisplay and CartItem
      styleOverrides: {
        root: {
          // Use a slightly lighter divider color than default dark theme if needed
          // Example: backgroundColor: 'rgba(255, 255, 255, 0.12)', // Default dark theme divider
        },
      },
    },
  },
});

const App = () => {
  //const nav = useNavigate();
  return (
    // Apply the custom dark theme
    <ThemeProvider theme={darkTheme}>
      {/* Apply baseline CSS */}
      <CssBaseline />
      {/* Router for client-side navigation */}
      <Router>
        {/* ScrollToTop component */}
        <ScrollToTop />
        {/* AuthProvider wraps the part of the app that needs auth context */}
        <AuthProvider>
          {/* <<< WRAP WITH CartProvider HERE <<< */}
          {/* CartProvider wraps the part of the app that needs cart context.
              Since CartPage and ProductCard (in MainLayout) use it,
              wrapping AuthProvider is appropriate. */}
          <CartProvider > {/* <<< Start CartProvider <<< */}

            {/* Define your application routes */}
            <Routes>
              {/* Public routes wrapped inside MainLayout */}
              {/* MainLayout will render the shared header/footer */}
              <Route path="/" element={<MainLayout />}>
                {/* Use the imported page components */}
                <Route index element={<HomePage />} /> {/* Render HomePage component */}
                
                <Route path="products/:productId" element={<ProductDetailPage />} /> {/* Render ProductDetailPage */}
                <Route path="login" element={<LoginPage />} /> {/* Render LoginPage */}
                <Route path="profile" element={<MyAccount />} /> {/* Render MyAccount */}
                <Route path="register" element={<RegisterPage />} /> {/* Render RegisterPage */}
                <Route path="/search-results" element={<FilteredProductsSearch />} /> {/* Or choose a different path like "/filtered-products" */}
                {/* Protected User Routes - Require authentication */}
                {/* PrivateRoute component handles redirection if not authenticated */}
                <Route element={<PrivateRoute />}>
                  {/* These pages will have access to AuthProvider and CartProvider */}
                  <Route path="cart" element={<CartPage />} /> {/* Render CartPage */}
                  <Route path="checkout" element={<CheckoutPage />} /> {/* Render CheckoutPage */}
                  <Route path="account/orders" element={<OrderHistoryPage />} /> {/* Render OrderHistoryPage */}
                  {/* <Route path="account/orders/:orderId" element={<OrderDetailPage />} /> {/* Render OrderDetailPage */}
                  {/* <Route path="account/profile" element={<ProfilePage />} /> Render ProfilePage */}
                </Route>

                {/* Fallback route for pages not found within MainLayout */}
                {/* This will render MainLayout with a "Page Not Found" message in the outlet */}
                <Route path="*" element={<Typography variant="h4" sx={{ textAlign: 'center', mt: 4 }}>Page Not Found</Typography>} />
              </Route>

              {/* Admin routes wrapped inside AdminRoute and AdminLayout */}
              {/* AdminRoute handles admin-only access */}
              {/* AdminLayout provides admin-specific layout */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  {/* These pages will have access to AuthProvider (for admin check) but might not need CartProvider */}
                  {/* They are still within CartProvider's scope because AdminRoute is outside the first MainLayout Route */}
                  <Route index element={<AdminDashboardPage />} /> {/* Render AdminDashboardPage */}
                  <Route path="products" element={<AdminProductsPage />} /> {/* Render AdminProductsPage */}
                  <Route path="products/new" element={<AdminProductFormPage />} /> {/* Render AdminProductFormPage */}
                  <Route path="products/edit/:productId" element={<AdminProductFormPage />} /> {/* Render AdminProductFormPage */}
                  <Route path="orders" element={<AdminOrdersPage />} /> {/* Render AdminOrdersPage */}
                  <Route path="users" element={<AdminUsersPage />} /> {/* Render AdminUsersPage */}
                  {/* <Route path="admin/dashboard" element={<AdminLayout />} /> Render AdminUsersPage */}
                  {/* Fallback route for admin pages not found within AdminLayout */}
                  {/* <Route path="*" element={<Typography variant="h4" sx={{ textAlign: 'center', mt: 4 }}>Admin Page Not Found</Typography>} /> */}
                </Route>
              </Route>

              {/* If you have any top-level routes outside layouts, define them here */}
              {/* Example: A 404 page that doesn't use a layout */}
              {/* <Route path="*" element={<NotFoundPage />} /> */}

            </Routes>

          </CartProvider> {/* <<< End CartProvider <<< */}
        </AuthProvider> {/* <<< End AuthProvider <<< */}
      </Router> {/* End Router */}
    </ThemeProvider>);
};

export default App;