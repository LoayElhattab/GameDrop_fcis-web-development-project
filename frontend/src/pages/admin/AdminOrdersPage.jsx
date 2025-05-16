import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, CircularProgress, Alert, TablePagination,
    IconButton, Modal, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [statusUpdateError, setStatusUpdateError] = useState(null);
    const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const filter = queryParams.get('filter');

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        if (!user || user.role !== 'ADMIN') {
            setError('Unauthorized access.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.get('/orders/getOrders', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                }
            });

            console.log('API Response:', JSON.stringify(response.data));

            const ordersData = Array.isArray(response.data.orders)
                ? response.data.orders
                : Array.isArray(response.data.results)
                ? response.data.results
                : Array.isArray(response.data)
                ? response.data
                : [];
            const total = Number.isInteger(response.data.total)
                ? response.data.total
                : Number.isInteger(response.data.totalCount)
                ? response.data.totalCount
                : ordersData.length;

            setOrders(ordersData);
            setTotalOrders(total);

            if (filter === 'revenue') {
                const revenueOrders = ordersData.filter(
                    order => order.status === 'PROCESSING' || order.status === 'SHIPPED'
                );
                setFilteredOrders(revenueOrders);
            } else {
                setFilteredOrders(ordersData);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again.');
            setOrders([]);
            setFilteredOrders([]);
            setTotalOrders(0);
        } finally {
            setLoading(false);
            setRefreshLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchOrders();
        } else if (!user) {
            setLoading(false);
            setError('Please log in to access this page.');
        }
    }, [user, page, rowsPerPage, filter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = async (orderId) => {
        try {
            setModalError(null);
            setSelectedOrder(null);
            setStatusUpdateError(null);
            setStatusUpdateSuccess(null);
            setModalOpen(true);

            const response = await apiClient.get(`/orders/${orderId}`);
            console.log('Order Details Response:', JSON.stringify(response.data));
            setSelectedOrder(response.data);
        } catch (err) {
            console.error('Failed to fetch order details:', err);
            setModalError('Failed to load order details. Please try again.');
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedOrder(null);
        setModalError(null);
        setStatusUpdateError(null);
        setStatusUpdateSuccess(null);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setStatusUpdating(true);
        setStatusUpdateError(null);
        setStatusUpdateSuccess(null);

        try {
            await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
            setStatusUpdateSuccess('Status updated successfully.');
            // Update order status in the UI
            setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
            // Refresh orders list
            await fetchOrders();
        } catch (err) {
            console.error('Failed to update order status:', err);
            setStatusUpdateError('Failed to update order status. Please try again.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const paperStyles = {
        p: 3,
        backgroundColor: (theme) => theme.palette.background.paper,
        boxShadow: 3,
        borderRadius: 2,
        mt: 4,
    };

    const tableHeaderCellStyles = {
        color: (theme) => theme.palette.text.secondary,
        fontWeight: 'bold',
    };

    const tableCellStyles = {};

    const modalStyles = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 500 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '80vh',
        overflowY: 'auto',
    };

    const getStatusColor = (status, theme) => {
        switch (status) {
            case 'DELIVERED': return theme.palette.success.main;
            case 'CANCELLED': return theme.palette.error.main;
            case 'PROCESSING': return theme.palette.warning.main;
            case 'SHIPPED': return theme.palette.info.main;
            default: return theme.palette.text.secondary;
        }
    };

    return (
        <Box sx={{ mt: 4, mb: 4, position: 'relative' }}>
            <Typography variant="h4" gutterBottom>
                Orders Management
            </Typography>

            <Paper sx={paperStyles}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderCellStyles}>Order ID</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Customer</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Date</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Items</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="right">Total Amount</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Status</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell sx={tableCellStyles}>{order.id?.substring(0, 6) ?? 'N/A'}...</TableCell>
                                        <TableCell sx={tableCellStyles}>{order.user?.username ?? 'Unknown User'}</TableCell>
                                        <TableCell sx={tableCellStyles}>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell sx={tableCellStyles}>{order.items?.length ?? 0}</TableCell>
                                        <TableCell sx={tableCellStyles} align="right">${parseFloat(order.total_amount)?.toFixed(2) ?? '0.00'}</TableCell>
                                        <TableCell sx={tableCellStyles}>
                                            <Typography variant="body2" sx={{ color: (theme) => getStatusColor(order.status, theme) }}>
                                                {order.status ?? 'UNKNOWN'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={tableCellStyles} align="center">
                                            <IconButton
                                                aria-label="View details"
                                                size="small"
                                                onClick={() => handleViewDetails(order.id)}
                                                color="info"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            No orders found. Check if orders exist in the database.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={fetchOrders}
                            disabled={loading || refreshLoading}
                        >
                            Retry
                        </Button>
                    </Box>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalOrders}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ color: (theme) => theme.palette.text.secondary }}
                />
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
                            <CloseIcon />
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

                            <Divider sx={{ my: 2 }} />

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

                            <Divider sx={{ my: 2 }} />

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

                            {selectedOrder.status === 'PROCESSING' && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Update Order Status
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'SHIPPED')}
                                            disabled={statusUpdating}
                                        >
                                            {statusUpdating ? <CircularProgress size={24} /> : 'Change to SHIPPED'}
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                            disabled={statusUpdating}
                                        >
                                            {statusUpdating ? <CircularProgress size={24} /> : 'Change to CANCELLED'}
                                        </Button>
                                    </Box>
                                    {statusUpdateError && (
                                        <Alert severity="error" sx={{ mt: 2 }}>
                                            {statusUpdateError}
                                        </Alert>
                                    )}
                                    {statusUpdateSuccess && (
                                        <Alert severity="success" sx={{ mt: 2 }}>
                                            {statusUpdateSuccess}
                                        </Alert>
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Modal>

            {refreshLoading && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2000,
                    }}
                >
                    <CircularProgress color="primary" />
                </Box>
            )}
        </Box>
    );
};

export default AdminOrdersPage;