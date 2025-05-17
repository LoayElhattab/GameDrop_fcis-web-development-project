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
  Modal,
  Divider,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState(0); 
  const [profileData, setProfileData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalError, setModalError] = useState(null);
  const navigate = useNavigate();
  const { user, token } = useAuth(); 

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

  const handleViewDetails = async (orderId) => {
    try {
      console.log('Fetching order details for orderId:', orderId);
      console.log('Current token:', token); // Log token for debugging
      setModalError(null);
      setSelectedOrder(null);
      setModalOpen(true);

      const response = await apiClient.get(`/orders/myOrder/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }, // Ensure token is sent
      });
      console.log('Order details response:', response.data);
      setSelectedOrder(response.data);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setModalError(`Failed to load order details. Error: ${err.message} (Status: ${err.response?.status})`);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
    setModalError(null);
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

  const modalStyles = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: '#1E1E2F',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: '80vh',
    overflowY: 'auto',
    color: 'text.primary',
  };

  const isAdmin = profileData?.role === 'ADMIN';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, color: 'text.primary' }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#AB47BC' }}>
        My Account
      </Typography>

      <Paper sx={{ p: 3, backgroundColor: '#1E1E2F', border: '1px solid #333', borderRadius: 2 }} elevation={0}>
        <Box sx={{ borderBottom: 1, borderColor: '#333', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="account tabs" TabIndicatorProps={{ style: { backgroundColor: '#AB47BC' } }}>
            <Tab label="Profile" sx={{ color: 'text.primary', '&.Mui-selected': { color: '#AB47BC' } }} />
            {!isAdmin && (
              <Tab label="Order History" sx={{ color: 'text.primary', '&.Mui-selected': { color: '#AB47BC' } }} />
            )}
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
          </Box>
        ) : activeTab === 1 && orderHistory.length > 0 && !isAdmin ? (
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

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="order-details-modal"
        aria-describedby="order-details-description"
      >
        <Box sx={modalStyles}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="order-details-modal" variant="h6" component="h2">
              Order Details
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon sx={{ color: 'text.primary' }} />
            </IconButton>
          </Box>

          {modalError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          ) : !selectedOrder ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Order ID:</strong> {selectedOrder.id}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Customer:</strong> {selectedOrder.user?.username ?? 'Unknown User'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date:</strong> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Total Amount:</strong> ${parseFloat(selectedOrder.total_amount)?.toFixed(2) ?? '0.00'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Status:</strong> {selectedOrder.status ?? 'UNKNOWN'}
              </Typography>

              <Divider sx={{ my: 2, backgroundColor: '#333' }} />

              <Typography variant="h6" sx={{ mb: 1 }}>
                Shipping Address
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {selectedOrder.shipping_address_line1 ? selectedOrder.shipping_address_line1 : 'N/A'}
              </Typography>
              {selectedOrder.shipping_address_line2 && (
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {selectedOrder.shipping_address_line2}
                </Typography>
              )}
              <Typography variant="body1" sx={{ mb: 1 }}>
                {selectedOrder.shipping_city ? selectedOrder.shipping_city : 'N/A'},{' '}
                {selectedOrder.shipping_postal_code ? selectedOrder.shipping_postal_code : 'N/A'},{' '}
                {selectedOrder.shipping_country ? selectedOrder.shipping_country : 'N/A'}
              </Typography>

              <Divider sx={{ my: 2, backgroundColor: '#333' }} />

              <Typography variant="h6" sx={{ mb: 1 }}>
                Items
              </Typography>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => (
                  <Box key={index} sx={{ mb: 1, pl: 2 }}>
                    <Typography variant="body2">
                      - {item.product?.title ?? 'Unknown Product'} (Qty: {item.quantity}, Price: ${isNaN(parseFloat(item.price_at_purchase)) ? '0.00' : parseFloat(item.price_at_purchase).toFixed(2)})
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No items found in this order.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default MyAccount;