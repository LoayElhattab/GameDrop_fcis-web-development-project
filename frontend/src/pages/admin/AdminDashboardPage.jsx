import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardActionArea, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';

const AdminDashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('./admin/dashboard/metrics');
        console.log('API Response from /admin/dashboard/metrics:', response.data);
        setSummaryData(response.data);
      } catch (err) {
        console.error('Failed to fetch admin summary data:', err);
        if (err.response && err.response.status === 403) {
          setError('Unauthorized access. Admin privileges required.');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/orders/getOrders', {
          params: {
            page: 1,
            limit: 1000,
          }
        });
        const ordersData = Array.isArray(response.data.orders)
          ? response.data.orders
          : Array.isArray(response.data.results)
          ? response.data.results
          : Array.isArray(response.data)
          ? response.data
          : [];
        console.log('Fetched orders:', ordersData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch orders for revenue:', err);
      }
    };

    if (user && user.role === 'ADMIN') {
      fetchSummaryData();
      fetchOrders();
    } else {
      setError('Unauthorized access.');
      setLoading(false);
    }
  }, [user]);

  const totalRevenue = orders
    .filter(order => order.status !== 'CANCELLED')
    .reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
    .toFixed(2);

  const cardStyles = (background) => ({
    background,
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  });

  const handleRevenueClick = () => {
    navigate('/admin/orders?filter=revenue');
  };

  const handleOrdersClick = () => {
    navigate('/admin/orders?filter=all');
  };

  const handleProductsClick = () => {
    navigate('/admin/products');
  };

  const handleUsersClick = () => {
    navigate('/admin/users');
  };

  return (
    <Box sx={{ 
      padding: 0, 
      width: '100%', 
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress sx={{ color: '#7e57c2' }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4, backgroundColor: '#f44336', color: '#ffffff' }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3, 
          width: '100%', 
          height: '100%', 
          padding: 2
        }}>
          {}
          <Box sx={{ 
            display: 'flex', 
            width: '100%', 
            gap: 3, 
            flexDirection: { xs: 'column', sm: 'row' },
            height: '50%', 
          }}>
            <Box sx={{ flex: 1, height: '100%' }}>
              <Card sx={{ ...cardStyles('linear-gradient(to right, #5e35b1, #d81b60)'), height: '100%' }}> {}
                <CardActionArea 
                  onClick={handleRevenueClick} 
                  sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <AttachMoneyIcon sx={{ fontSize: 56, mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2, fontSize: '1.2rem' }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      ${totalRevenue || '0.00'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
            
            <Box sx={{ flex: 1, height: '100%' }}>
              <Card sx={{ ...cardStyles('linear-gradient(to right, #5e35b1, #d81b60)'), height: '100%' }}> {}
                <CardActionArea 
                  onClick={handleOrdersClick} 
                  sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <ShoppingCartIcon sx={{ fontSize: 56, mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2, fontSize: '1.2rem' }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {summaryData?.totalOrders || '0'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          </Box>
          
          {}
          <Box sx={{ 
            display: 'flex', 
            width: '100%', 
            gap: 3, 
            flexDirection: { xs: 'column', sm: 'row' },
            height: '50%',
          }}>
            <Box sx={{ flex: 1, height: '100%' }}>
              <Card sx={{ ...cardStyles('linear-gradient(to right, #5e35b1, #d81b60)'), height: '100%' }}> {}
                <CardActionArea 
                  onClick={handleUsersClick} 
                  sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <PeopleIcon sx={{ fontSize: 56, mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2, fontSize: '1.2rem' }}>
                      Active Users
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {summaryData?.activeUsers || '0'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
            
            <Box sx={{ flex: 1, height: '100%' }}>
              <Card sx={{ ...cardStyles('linear-gradient(to right, #5e35b1, #d81b60)'), height: '100%' }}> {}
                <CardActionArea 
                  onClick={handleProductsClick} 
                  sx={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <InventoryIcon sx={{ fontSize: 56, mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2, fontSize: '1.2rem' }}>
                      Total Products
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {summaryData?.totalProducts || '0'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboardPage;