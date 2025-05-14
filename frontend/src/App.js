import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from "./pages/CartPage" ;
import CheckoutPage from "./pages/CheckoutPage" ;


// --- Placeholder Pages ---
const HomePage = () => <h1>Home Page</h1>;
const ProductDetailPage = () => <h1>Product Detail Page</h1>;
//const CartPage = () => <h1>Cart Page</h1>;
//const CheckoutPage = () => <h1>Checkout Page</h1>;
const OrderHistoryPage = () => <h1>Order History Page</h1>;
const OrderDetailPage = () => <h1>Order Detail Page</h1>;
const ProfilePage = () => <h1>Profile Page</h1>;
const AdminDashboardPage = () => <h1>Admin Dashboard</h1>;
const AdminProductsPage = () => <h1>Admin Products Page</h1>;
const AdminProductFormPage = () => <h1>Admin Product Form Page</h1>;
const AdminOrdersPage = () => <h1>Admin Orders Page</h1>;
const AdminUsersPage = () => <h1>Admin Users Page</h1>;


// --- End Placeholder Pages ---

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a202c',
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
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products/:productId" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              {/* Protected User Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="account/orders" element={<OrderHistoryPage />} />
                <Route path="account/orders/:orderId" element={<OrderDetailPage />} />
                <Route path="account/profile" element={<ProfilePage />} />
              </Route>

              <Route path="*" element={<h1>Page Not Found</h1>} />
            </Route>

            {/* Admin routes wrapped inside AdminRoute and AdminLayout */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/edit/:productId" element={<AdminProductFormPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="*" element={<h1>Admin Page Not Found</h1>} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
