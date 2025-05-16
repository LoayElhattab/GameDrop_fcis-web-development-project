import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent, CardActionArea, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import apiClient from '../../api'; // Assuming apiClient is correctly configured for backend calls
import { useAuth } from '../../contexts/AuthContext'; // Assuming useAuth provides user info and token

/**
 * Admin Dashboard Page Component.
 * Displays summary statistics and placeholders for admin overview.
 * Styled using Material UI to match a dark, modern aesthetic.
 */
const AdminDashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get user info
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch admin dashboard metrics from the backend
        const response = await apiClient.get('./admin/dashboard/metrics');
        setSummaryData(response.data);
        console.log('Fetched summary data:', response.data);
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

    // Fetch data only if user is authenticated and an admin
    if (user && user.role === 'ADMIN') {
      fetchSummaryData();
    } else {
      setError('Unauthorized access.');
      setLoading(false);
    }
  }, [user]);

  // Basic styling for dark theme Paper and Cards
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
    transition: 'transform 0.2s', // Add hover effect
    '&:hover': {
      transform: 'scale(1.02)', // Slight scale on hover for button-like behavior
      boxShadow: 6,
    },
  };

  // Navigation handlers for each card
  const handleRevenueClick = () => {
    navigate('/admin/orders'); // Navigate to orders page (since revenue is tied to orders)
  };

  const handleOrdersClick = () => {
    navigate('/admin/orders'); // Navigate to orders page
  };

  const handleProductsClick = () => {
    navigate('/admin/products'); // Navigate to products page
  };

  const handleUsersClick = () => {
    navigate('/admin/users'); // Navigate to users page
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
          {/* Summary Cards - Now Clickable */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={cardStyles}>
              <CardActionArea onClick={handleRevenueClick}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h3">
                    ${summaryData?.totalRevenue?.toFixed(2) || '0.00'}
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

          {/* Placeholders for Charts or Recent Activity */}
          <Grid item xs={12} md={8}>
            <Paper sx={paperStyles}>
              <Typography variant="h6" gutterBottom>
                Sales Overview (Placeholder)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
                <Typography>Chart Area</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={paperStyles}>
              <Typography variant="h6" gutterBottom>
                Recent Activity (Placeholder)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary' }}>
                <Typography>Activity Feed Area</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboardPage;