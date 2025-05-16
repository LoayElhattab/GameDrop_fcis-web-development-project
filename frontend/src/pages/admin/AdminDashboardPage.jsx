import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CardActionArea, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Admin Dashboard Page Component.
 * Displays summary statistics and placeholders for admin overview.
 * Styled using Material UI to match a dark, modern aesthetic.
 */
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

  const paperStyles = {
    p: 3,
    backgroundColor: (theme) => theme.palette.background.paper,
    boxShadow: 3,
    borderRadius: 2,
    height: '100%',
  };

  const cardStyles = {
    backgroundColor: (theme) => theme.palette.background.paper,
    color: (theme) => theme.palette.text.primary,
    boxShadow: 3,
    borderRadius: 2,
    height: '100%',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: 6,
    },
  };

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
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardActionArea onClick={handleRevenueClick}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3">
                    ${totalRevenue || '0.00'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardActionArea onClick={handleOrdersClick}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h3">
                    {summaryData?.totalOrders || '0'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardActionArea onClick={handleProductsClick}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h3">
                    {summaryData?.totalProducts || '0'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardActionArea onClick={handleUsersClick}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h3">
                    {summaryData?.activeUsers || '0'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboardPage;