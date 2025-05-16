import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, CircularProgress, Alert, TablePagination,
    IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalOrders, setTotalOrders] = useState(0);

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

            // Debug: Log the response data
            console.log('API Response:', JSON.stringify(response.data));

            // Handle different response structures
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
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again.');
            setOrders([]);
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
    }, [user, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (orderId) => {
        navigate(`/admin/orders/${orderId}`);
        setRefreshLoading(true);
        fetchOrders();
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
                ) : Array.isArray(orders) && orders.length > 0 ? (
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
                                {orders.map((order) => (
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
                                                aria-label="view details"
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