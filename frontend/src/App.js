
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Typography } from '@mui/material'; 
import ScrollToTop from './components/ScrollToTop'; 
// --- Import your Providers ---
import { AuthProvider } from './contexts/AuthContext'; 
import { CartProvider } from './contexts/CartContext'; 

import MainLayout from './layouts/MainLayout'; 
import AdminLayout from './layouts/AdminLayout';

import PrivateRoute from './components/common/PrivateRoute'; 
import AdminRoute from './components/common/AdminRoute'; 

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage'; 
import CheckoutPage from './pages/CheckoutPage'; 
import OrderHistoryPage from './pages/OrderHistoryPage'; 
import FilteredProductsSearch from './pages/FilteredProductsPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage'; 
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage'; 
import AdminUsersPage from './pages/admin/AdminUsersPage'; 
import MyAccount from './pages/UserProfilePage';
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6', 
      dark: '#7c3aed',
    },
    error: {
      main: '#f44336', 
    },
   
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e', 
          color: '#ffffff', 
        },
      },
    },
    MuiPaper: { 
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff', 
        },
      },
    },
    MuiDivider: { 
      styleOverrides: {
        root: {
         
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
        <ScrollToTop />
        <AuthProvider>
        
          <CartProvider > 

           
            <Routes>
             
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} /> 
                
                <Route path="products/:productId" element={<ProductDetailPage />} /> 
                <Route path="login" element={<LoginPage />} /> 
                <Route path="profile" element={<MyAccount />} />
                <Route path="register" element={<RegisterPage />} /> /
                <Route path="/search-results" element={<FilteredProductsSearch />} /> 
                <Route element={<PrivateRoute />}>
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} /> 
                  <Route path="account/orders" element={<OrderHistoryPage />} /> 
                </Route>
                <Route path="*" element={<Typography variant="h4" sx={{ textAlign: 'center', mt: 4 }}>Page Not Found</Typography>} />
              </Route>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} /> 
                  <Route path="products" element={<AdminProductsPage />} /> 
                  <Route path="products/new" element={<AdminProductFormPage />} /> 
                  <Route path="products/edit/:productId" element={<AdminProductFormPage />} /> 
                  <Route path="orders" element={<AdminOrdersPage />} /> 
                  <Route path="users" element={<AdminUsersPage />} /> 
                </Route>
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider> 
      </Router> 
    </ThemeProvider>);
};

export default App;