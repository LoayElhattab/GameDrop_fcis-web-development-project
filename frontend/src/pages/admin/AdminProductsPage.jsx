import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, CircularProgress, Alert, TextField, InputAdornment,
    TablePagination, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AdminProductFormPage from './AdminProductFormPage';
import MuiAlert from '@mui/material/Alert';

/**
 * Admin Products Management Page Component.
 * Displays a table of products for administration, with Add/Edit Product in a dialog.
 * Styled using Material UI.
 */
const AdminProductsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalProducts, setTotalProducts] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [productToEditId, setProductToEditId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);

        if (!user || user.role !== 'ADMIN') {
            setError('Unauthorized access.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.get('./products/getProducts', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchTerm,
                }
            });

            // Filter out products with stock_quantity of 0
            const filteredProducts = response.data.products.filter(product => product.stock_quantity > 0);

            setProducts(filteredProducts);
            setTotalProducts(response.data.total);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchProducts();
        } else if (!user) {
            setLoading(false);
        }
    }, [user, page, rowsPerPage, searchTerm]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenAddProductDialog = () => {
        setProductToEditId(null);
        setFormDialogOpen(true);
    };

    const handleOpenEditProductDialog = (productId) => {
        setProductToEditId(productId);
        setFormDialogOpen(true);
    };

    const handleCloseFormDialog = () => {
        setFormDialogOpen(false);
        setProductToEditId(null);
        fetchProducts();
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;

        setLoading(true);
        setError(null);

        try {
            const payload = { is_deleted: true };
            await apiClient.patch(`./products/${productToDelete.id}`, payload);
            setProducts(products.filter(p => p.id !== productToDelete.id));
            setTotalProducts(totalProducts - 1);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
            setSnackbarOpen(true); // Open snackbar on successful deletion
        } catch (err) {
            console.error('Error in deletion:', err.response ? err.response.data : err);
            setError(err.response?.data?.error || 'Failed to delete product, this may be due to a foreign key constraint.');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
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

    const tableRowStyles = {};

    const tableCellStyles = {};

    const getStatusColor = () => {};

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Products Management
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                    label="Search Products"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: '300px' }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddProductDialog}
                >
                    Add New Product
                </Button>
            </Box>

            <Paper sx={paperStyles}>
                {loading && !formDialogOpen ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : products.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderCellStyles}>Image</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>ID</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Title</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Platform</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Genre</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="right">Price</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="right">Stock</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Created At</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id} sx={tableRowStyles}>
                                        <TableCell sx={tableCellStyles}>
                                            {product.cover_image_url ? (
                                                <img
                                                    src={product.cover_image_url}
                                                    alt={product.title}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                'N/A'
                                            )}
                                        </TableCell>
                                        <TableCell sx={tableCellStyles}>{product.id?.substring(0, 6)}...</TableCell>
                                        <TableCell sx={tableCellStyles}>{product.title}</TableCell>
                                        <TableCell sx={tableCellStyles}>{product.platform}</TableCell>
                                        <TableCell sx={tableCellStyles}>{product.genre}</TableCell>
                                        <TableCell sx={tableCellStyles} align="right">
                                            ${parseFloat(product.price) ? parseFloat(product.price).toFixed(2) : '0.00'}
                                        </TableCell>
                                        <TableCell sx={tableCellStyles} align="right">{product.stock_quantity}</TableCell>
                                        <TableCell sx={tableCellStyles}>{product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell sx={tableCellStyles} align="center">
                                            <IconButton
                                                aria-label="edit"
                                                size="small"
                                                onClick={() => handleOpenEditProductDialog(product.id)}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                aria-label="delete"
                                                size="small"
                                                onClick={() => openDeleteDialog(product)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">No products found.</Typography>
                    </Box>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalProducts}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ color: (theme) => theme.palette.text.secondary }}
                />
            </Paper>

            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                PaperProps={{
                    sx: {
                        backgroundColor: (theme) => theme.palette.background.paper,
                        color: (theme) => theme.palette.text.primary,
                        boxShadow: 3,
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle id="delete-dialog-title" sx={{ color: (theme) => theme.palette.text.primary }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Are you sure you want to delete the product: <strong>{productToDelete?.title}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Current stock: {productToDelete?.stock_quantity}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteProduct} color="error" variant="contained" autoFocus disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={formDialogOpen}
                onClose={handleCloseFormDialog}
                aria-labelledby="product-form-dialog-title"
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: (theme) => theme.palette.background.paper,
                        color: (theme) => theme.palette.text.primary,
                        boxShadow: 5,
                        borderRadius: 2,
                        py: 2,
                    }
                }}
            >
                <DialogTitle id="product-form-dialog-title" sx={{ color: (theme) => theme.palette.text.primary }}>
                    {productToEditId ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent dividers>
                    {formDialogOpen && (
                        <AdminProductFormPage
                            isEditMode={Boolean(productToEditId)}
                            productId={productToEditId}
                            onSubmissionSuccess={handleCloseFormDialog}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: '100%' }}
                >
                    Product deleted successfully
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default AdminProductsPage;