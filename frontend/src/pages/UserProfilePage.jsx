import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 for Profile, 1 for Order History
  const [profileData, setProfileData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 0) {
          const response = await apiClient.get('./auth/profile');
          setProfileData(response.data.user);
        } else if (activeTab === 1) {
          const response = await apiClient.get('./orders/myOrder');
          setOrderHistory(response.data);
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewDetails = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).replace(',', ' at');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: 'text.primary' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#AB47BC' }}>
        My Account
      </Typography>

      <Paper sx={{ p: 3, backgroundColor: '#1E1E2F', border: '1px solid #333', borderRadius: 2 }} elevation={0}>
        <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="account tabs" TabIndicatorProps={{ style: { backgroundColor: '#AB47BC' } }}>
            <Tab label="Profile" sx={{ color: 'text.primary', '&.Mui-selected': { color: '#AB47BC' } }} />
            <Tab label="Order History" sx={{ color: 'text.primary', '&.Mui-selected': { color: '#AB47BC' } }} />
            <Tab label="Addresses" disabled sx={{ color: 'text.primary' }} />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress color="secondary" />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : activeTab === 0 && profileData ? (
          <Box sx={{ color: 'text.primary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#AB47BC', width: 60, height: 60, mr: 2 }}>
                {profileData.username.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#AB47BC', mb: 1 }}>{profileData.username}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{profileData.email}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Username</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{profileData.username}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Role</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{profileData.role}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mr: 2 }}>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Email</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{profileData.email}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Created At</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{formatDate(profileData.created_at)}</Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#AB47BC', color: 'white', '&:hover': { backgroundColor: '#9C27B0' }, mt: 2 }}
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
          </Box>
        ) : activeTab === 1 && orderHistory.length > 0 ? (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'text.primary' }}>
              Your Orders
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {orderHistory.length} orders
            </Typography>
            {orderHistory.map((order) => (
              <Paper
                key={order.id}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: '#2A2A3D',
                  borderRadius: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2, color: '#AB47BC' }}>📦</Box>
                  <Box>
                    <Typography sx={{ color: '#AB47BC' }}>Order ID</Typography>
                    <Typography sx={{ color: 'text.primary' }}>{order.id}</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Date</Typography>
                  <Typography sx={{ color: 'text.primary' }}>{new Date(order.created_at).toLocaleDateString()}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Total</Typography>
                  <Typography sx={{ color: 'text.primary' }}>${order.total_amount}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: '#AB47BC' }}>Status</Typography>
                  <Typography sx={{ color: order.status === 'Delivered' ? '#4caf50' : order.status === 'Shipped' ? '#2196F3' : '#FFCA28' }}>
                    {order.status}
                  </Typography>
                </Box>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => handleViewDetails(order.id)}
                  sx={{ textTransform: 'none', color: '#AB47BC' }}
                >
                  View
                </Button>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No data available.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default MyAccount;