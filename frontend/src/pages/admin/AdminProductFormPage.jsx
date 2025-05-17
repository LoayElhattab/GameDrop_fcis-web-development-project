import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, CircularProgress, Alert, Grid, MenuItem, FormControl, InputLabel, Select, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';

// Define validation schema for product form
const validationSchema = yup.object({
    title: yup.string('Enter product title').required('Title is required'),
    description: yup.string('Enter product description').nullable(),
    platform: yup.string('Select platform').required('Platform is required'),
    genre: yup.string('Select genre').required('Genre is required'),
    price: yup.number('Enter price').required('Price is required').positive('Price must be positive').typeError('Price must be a number'),
    stock_quantity: yup.number('Enter stock quantity').required('Stock quantity is required').integer('Stock quantity must be an integer').min(0, 'Stock quantity cannot be negative').typeError('Stock quantity must be a number'),
    cover_image_url: yup.string('Enter image URL').url('Enter a valid URL').nullable(),
    release_date: yup.date('Enter release date').nullable().typeError('Enter a valid date'),
});

const AdminProductFormPage = ({ isEditMode = false, productId = null, onSubmissionSuccess }) => {
    const navigate = useNavigate();
    const params = useParams();
    const { user } = useAuth();

    const actualIsEditMode = isEditMode || Boolean(params.productId);
    const actualProductId = productId || params.productId;

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(actualIsEditMode);
    const [error, setError] = useState(null);
    const [initialValues, setInitialValues] = useState({
        title: '',
        description: '',
        platform: '',
        genre: '',
        price: '',
        stock_quantity: '',
        cover_image_url: '',
        release_date: '',
    });
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [valuesToSubmit, setValuesToSubmit] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Message for snackbar

    useEffect(() => {
        const fetchProduct = async () => {
            setPageLoading(true);
            setError(null);

            if (!user || user.role !== 'ADMIN') {
                setError('Unauthorized access.');
                setPageLoading(false);
                return;
            }
            if (!actualProductId) {
                setError('Product ID is missing for edit mode.');
                setPageLoading(false);
                return;
            }

            try {
                const response = await apiClient.get(`./products/${actualProductId}`);
                const productData = response.data;
                setInitialValues({
                    title: productData.title || '',
                    description: productData.description || '',
                    platform: productData.platform || '',
                    genre: productData.genre || '',
                    price: parseFloat(productData.price) || 0,
                    stock_quantity: parseInt(productData.stock_quantity, 10) || 0,
                    cover_image_url: productData.cover_image_url || '',
                    release_date: productData.release_date ? new Date(productData.release_date).toISOString().split('T')[0] : '',
                });
            } catch (err) {
                console.error('Failed to fetch product for edit:', err);
                setError('Failed to load product data. Please try again.');
            } finally {
                setPageLoading(false);
            }
        };

        if (actualIsEditMode && user && user.role === 'ADMIN') {
            fetchProduct();
        } else if (!actualIsEditMode) {
            setPageLoading(false);
            setInitialValues({
                title: '', description: '', platform: '', genre: '', price: '', stock_quantity: '', cover_image_url: '', release_date: ''
            });
        }
    }, [actualIsEditMode, actualProductId, user]);

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            setValuesToSubmit(values);
            setConfirmDialogOpen(true);
        },
    });

    const handleConfirmSubmit = async () => {
        setLoading(true);
        setError(null);
        setConfirmDialogOpen(false);

        try {
            if (actualIsEditMode) {
                const response = await apiClient.put(`./products/${actualProductId}`, valuesToSubmit);
                console.log('Product updated successfully:', response.data);
                setSnackbarMessage('Updated successfully');
            } else {
                const response = await apiClient.post('./products/createProduct', valuesToSubmit);
                console.log('Product added successfully:', response.data);
                setSnackbarMessage('Created successfully');
                formik.resetForm();
            }
            setSnackbarOpen(true); // Show snackbar
        } catch (err) {
            console.error('Failed to save product:', err);
            setError('Failed to save product. Please check your input and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelConfirm = () => {
        setConfirmDialogOpen(false);
        setValuesToSubmit(null);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
        // Redirect or close dialog after snackbar closes
        if (onSubmissionSuccess) {
            onSubmissionSuccess();
        } else {
            navigate('/admin/products');
        }
    };

    const paperStyles = {
        p: 4,
        backgroundColor: (theme) => theme.palette.background.paper,
        boxShadow: 3,
        borderRadius: 2,
        mt: 4,
    };

    const formInputStyles = {
        mb: 3,
    };

    const submitButtonStyles = {
        mt: 3,
        py: 1.5,
    };

    if (actualIsEditMode && pageLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (actualIsEditMode && error && !loading) {
        return (
            <Box sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={!actualIsEditMode ? {} : { mt: 4, mb: 4 }}>
            {!actualIsEditMode && (
                <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                    {actualIsEditMode ? 'Edit Product' : 'Add New Product'}
                </Typography>
            )}
            <Paper sx={actualIsEditMode ? paperStyles : { p: 0, boxShadow: 0, backgroundColor: 'transparent' }}>
                <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
                                sx={formInputStyles}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={formik.touched.platform && Boolean(formik.errors.platform)} sx={formInputStyles}>
                                <InputLabel id="platform-label">Platform</InputLabel>
                                <Select
                                    labelId="platform-label"
                                    id="platform"
                                    name="platform"
                                    value={formik.values.platform}
                                    label="Platform"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        color: (theme) => theme.palette.text.primary,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.text.secondary },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.primary.main },
                                        '& .MuiSvgIcon-root': { color: (theme) => theme.palette.text.secondary },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: (theme) => theme.palette.background.paper,
                                                color: (theme) => theme.palette.text.primary,
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value=""><em>Select Platform</em></MenuItem>
                                    <MenuItem value="PlayStation">PlayStation</MenuItem>
                                    <MenuItem value="Xbox">Xbox</MenuItem>
                                    <MenuItem value="Nintendo">Nintendo</MenuItem>
                                    <MenuItem value="PC">PC</MenuItem>
                                </Select>
                                {formik.touched.platform && formik.errors.platform && (
                                    <Typography variant="caption" color="error">{formik.errors.platform}</Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={formik.touched.genre && Boolean(formik.errors.genre)} sx={formInputStyles}>
                                <InputLabel id="genre-label">Genre</InputLabel>
                                <Select
                                    labelId="genre-label"
                                    id="genre"
                                    name="genre"
                                    value={formik.values.genre}
                                    label="Genre"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    sx={{
                                        color: (theme) => theme.palette.text.primary,
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.divider },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.text.secondary },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: (theme) => theme.palette.primary.main },
                                        '& .MuiSvgIcon-root': { color: (theme) => theme.palette.text.secondary },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                backgroundColor: (theme) => theme.palette.background.paper,
                                                color: (theme) => theme.palette.text.primary,
                                            }
                                        }
                                    }}
                                >
                                    <MenuItem value=""><em>Select Genre</em></MenuItem>
                                    <MenuItem value="Action">Action</MenuItem>
                                    <MenuItem value="RPG">RPG</MenuItem>
                                    <MenuItem value="Strategy">Strategy</MenuItem>
                                    <MenuItem value="Sports">Sports</MenuItem>
                                </Select>
                                {formik.touched.genre && formik.errors.genre && (
                                    <Typography variant="caption" color="error">{formik.errors.genre}</Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="price"
                                name="price"
                                label="Price"
                                type="number"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                                sx={formInputStyles}
                                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="stock_quantity"
                                name="stock_quantity"
                                label="Stock Quantity"
                                type="number"
                                value={formik.values.stock_quantity}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.stock_quantity && Boolean(formik.errors.stock_quantity)}
                                helperText={formik.touched.stock_quantity && formik.errors.stock_quantity}
                                sx={formInputStyles}
                                InputProps={{ inputProps: { min: 0, step: "1" } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="release_date"
                                name="release_date"
                                label="Release Date"
                                type="date"
                                value={formik.values.release_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.release_date && Boolean(formik.errors.release_date)}
                                helperText={formik.touched.release_date && formik.errors.release_date}
                                sx={formInputStyles}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="cover_image_url"
                                name="cover_image_url"
                                label="Cover Image URL"
                                value={formik.values.cover_image_url}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.cover_image_url && Boolean(formik.errors.cover_image_url)}
                                helperText={formik.touched.cover_image_url && formik.errors.cover_image_url}
                                sx={formInputStyles}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={4}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.description && Boolean(formik.errors.description)}
                                helperText={formik.touched.description && formik.errors.description}
                                sx={formInputStyles}
                            />
                        </Grid>
                    </Grid>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, ...submitButtonStyles }}>
                        {!actualIsEditMode && onSubmissionSuccess && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={onSubmissionSuccess}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (actualIsEditMode ? 'Save Changes' : 'Add Product')}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelConfirm}
                aria-labelledby="confirm-dialog-title"
                PaperProps={{
                    sx: {
                        backgroundColor: (theme) => theme.palette.background.paper,
                        color: (theme) => theme.palette.text.primary,
                        boxShadow: 3,
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle id="confirm-dialog-title" sx={{ color: (theme) => theme.palette.text.primary }}>
                    Confirm {actualIsEditMode ? 'Update' : 'Add'} Product
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        Are you sure you want to {actualIsEditMode ? 'update' : 'add'} the product "{valuesToSubmit?.title}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelConfirm} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit} color="primary" variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={1000}
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
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default AdminProductFormPage;