import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Grid,
    CardMedia,
    Button,
    Tabs,
    Tab,
    Paper,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ReviewList from '../components/ReviewList';
import ReviewForm from '../components/ReviewForm';

function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [hasUserReviewed, setHasUserReviewed] = useState(false);

    const { addItem } = useCart();
    const { user, isAuthenticated, isAdmin } = useAuth();

    const handleAddToCart = () => {
        if (product) {
            console.log(`Attempting to add product ${product.id} to cart`);
            addItem(product.id, 1);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const fetchReviews = useCallback(async (id) => {
        try {
            const reviewsResponse = await apiClient.get(`/reviews/product/${id}`);
            const fetchedReviews = reviewsResponse.data || [];
            setReviews(fetchedReviews);
            console.log('Reviews fetched:', fetchedReviews);

            let userHasReviewed = false;
            if (isAuthenticated && user?.id) {
                userHasReviewed = fetchedReviews.some(
                    review => review.user_id === user.id
                );
                console.log(`User ${user?.id} has reviewed product ${id}: ${userHasReviewed}`);
            } else {
                userHasReviewed = false;
                console.log('User not authenticated or user ID missing. hasUserReviewed set to false.');
            }
            setHasUserReviewed(userHasReviewed);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    }, [isAuthenticated, user?.id]);

    const handleReviewSubmitted = useCallback(() => {
        console.log('Review submitted successfully, refetching reviews...');
        if (productId) {
            setHasUserReviewed(true);
            fetchReviews(productId);
        }
    }, [productId, fetchReviews]);

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true);
            setError(null);
            setProduct(null);
            setRelatedProducts([]);
            setReviews([]);
            setHasUserReviewed(false);

            try {
                const productResponse = await apiClient.get(`/products/${productId}`);
                setProduct(productResponse.data);

                const relatedResponse = await apiClient.get('/products/getProducts', {
                    params: {
                        limit: 4,
                        exclude: productId
                    }
                });
                setRelatedProducts(relatedResponse.data.products || relatedResponse.data || []);

                await fetchReviews(productId);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching product details or related products:', err);
                setError(err);
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductAndRelated();
        }
    }, [productId, fetchReviews]);

    if (loading) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <CircularProgress color="secondary" />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Alert severity="error" sx={{ mt: 2 }}>Error loading product details: {error.message}</Alert>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>Product not found.</Typography>
            </Container>
        );
    }

    const isOutOfStock = product.stock_quantity <= 0;
    const isAddToCartDisabled = isOutOfStock || isAdmin;

    return (
        <Box
            sx={{
                backgroundColor: '#121212',
                color: '#ffffff',
                minHeight: '100vh',
                paddingY: 4,
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                backgroundColor: '#1e1e1e',
                                borderRadius: 2,
                                padding: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: { xs: 300, md: 400 },
                            }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                }}
                                image={product.cover_image_url || '/placeholder-image.png'}
                                alt={product.title}
                            />
                        </Box>
                        <Box sx={{ display: 'flex', mt: 2, gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ color: '#ffffff' }}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {product.title}
                            </Typography>
                            <Typography variant="h5" gutterBottom sx={{ color: '#e0e0e0' }}>
                                ${parseFloat(product.price).toFixed(2)}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ color: '#bdbdbd' }}>
                                Platform: {product.platform}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ color: '#bdbdbd' }}>
                                Genre: {product.genre}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ color: product.stock_quantity > 10 ? '#81c784' : (product.stock_quantity > 0 ? '#ffb74d' : '#e57373') }}>
                                Stock Status: {isOutOfStock ? 'Out of Stock' : (product.stock_quantity <= 10 ? `Low Stock (${product.stock_quantity})` : 'In Stock')}
                            </Typography>
                            {product.description && (
                                <Typography variant="body2" sx={{ color: '#e0e0e0', mt: 2, maxHeight: 100, overflowY: 'auto' }}>
                                    {product.description.substring(0, 200)}...
                                </Typography>
                            )}

                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<AddShoppingCartIcon />}
                                onClick={handleAddToCart}
                                disabled={isAddToCartDisabled}
                                sx={{
                                    mt: 3,
                                    backgroundColor: '#7e57c2',
                                    '&:hover': { backgroundColor: '#673ab7' },
                                    '&.Mui-disabled': {
                                        backgroundColor: '#424242',
                                        color: '#9e9e9e',
                                    }
                                }}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    mt: 3,
                                    ml: 2,
                                    color: '#ffffff',
                                    borderColor: '#7e57c2',
                                    '&:hover': {
                                        borderColor: '#673ab7',
                                        backgroundColor: 'rgba(126, 87, 194, 0.08)',
                                    },
                                }}
                                disabled
                            >
                                Add to Wishlist (Soon)
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                <Paper sx={{ backgroundColor: '#1e1e1e', color: '#ffffff', mb: 6 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                        sx={{
                            '.MuiTabs-indicator': { backgroundColor: '#7e57c2' },
                            '.MuiTab-root': {
                                color: '#bdbdbd',
                                '&.Mui-selected': {
                                    color: '#ffffff',
                                },
                            },
                        }}
                    >
                        <Tab label="Description" />
                        <Tab label="Reviews" />
                    </Tabs>
                    <Divider sx={{ backgroundColor: '#424242' }} />
                    <Box sx={{ padding: 3 }}>
                        {activeTab === 0 && (
                            <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                                {product.description || 'No description available.'}
                            </Typography>
                        )}
                        {activeTab === 1 && (
                            <Box>
                                <ReviewList reviews={reviews} />
                                <Divider sx={{ backgroundColor: '#424242', my: 3 }} />
                                {isAdmin ? (
                                    <Typography variant="body2" sx={{ color: '#bdbdbd', mt: 2 }}>
                                        Admins are not allowed to submit reviews.
                                    </Typography>
                                ) : (
                                    <ReviewForm
                                        productId={product.id}
                                        onReviewSubmitted={handleReviewSubmitted}
                                        hasUserReviewed={hasUserReviewed}
                                    />
                                )}
                            </Box>
                        )}
                    </Box>
                </Paper>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        You May Also Like
                    </Typography>
                    <Grid container spacing={3}>
                        {relatedProducts.map((relatedProduct) => (
                            <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                                <ProductCard product={relatedProduct} isAdmin={isAdmin} />
                            </Grid>
                        ))}
                        {relatedProducts.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Typography sx={{ textAlign: 'center', color: '#bdbdbd' }}>No related products found.</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
}

export default ProductDetailPage;