// gamedrop-frontend/src/pages/ProductDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Container, Grid, CardMedia, Button, Tabs, Tab, Paper, Divider } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import apiClient from '../services/apiClient'; // Assuming apiClient is configured
import ProductCard from '../components/ProductCard'; // Reusing ProductCard
// Placeholder components for reviews (implemented in TM6)
const ReviewList = ({ productId }) => <Box sx={{ mt: 2 }}><Typography>Reviews for Product {productId} (Coming Soon)</Typography></Box>;
const ReviewForm = ({ productId }) => <Box sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', borderRadius: 2 }}><Typography>Review Form for Product {productId} (Coming Soon)</Typography></Box>;
// Assume CartContext provides an addToCart function (implemented in TM6)
// import { useCart } from '../context/CartContext';


function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // 0 for Description, 1 for Reviews

    // Assume CartContext provides an addToCart function (uncomment when CartContext is ready)
    // const { addToCart } = useCart();

    const handleAddToCart = () => {
        if (product) {
            console.log(`Adding product ${product.id} to cart`);
            // addToCart(product.id, 1); // Call actual add to cart function
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch the specific product details
                const productResponse = await apiClient.get(`/products/${productId}`);
                setProduct(productResponse.data);

                // Fetch related products (example: by genre or platform, exclude current product)
                // You might need a backend endpoint or logic to fetch related items based on product details
                const relatedResponse = await apiClient.get('/products', {
                    params: {
                        genre: productResponse.data.genre, // Example: Fetch by same genre
                        limit: 4, // Get 4 related products
                        exclude: productId // Exclude the current product
                    }
                });
                setRelatedProducts(relatedResponse.data.products || []); // Assuming similar response structure to ProductList

                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        }

    }, [productId]); // Refetch when productId changes

    if (loading) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Typography color="text.primary">Loading...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Typography color="error">Error loading product details: {error.message}</Typography>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Typography color="text.secondary">Product not found.</Typography>
            </Container>
        );
    }

    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <Box
            sx={{
                backgroundColor: '#121212', // Dark background color
                color: '#ffffff', // White text color
                minHeight: '100vh',
                paddingY: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Product Details Section */}
                <Grid container spacing={4} sx={{ mb: 6 }}>
                    {/* Product Image Column */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                backgroundColor: '#1e1e1e', // Dark background for image container
                                borderRadius: 2,
                                padding: 2, // Add some padding around the image
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: { xs: 300, md: 400 }, // Responsive height
                            }}
                        >
                            <CardMedia
                                component="img"
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain', // Contain the image within the box
                                    borderRadius: 1,
                                }}
                                image={product.cover_image_url || '/placeholder-image.png'} // Use placeholder if no image
                                alt={product.title}
                            />
                        </Box>
                        {/* Placeholder for extra images if needed */}
                        <Box sx={{ display: 'flex', mt: 2, gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                            {/* Small image thumbnails would go here */}
                        </Box>
                    </Grid>

                    {/* Product Info Column */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ color: '#ffffff' }}>
                            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                                {product.title}
                            </Typography>
                            <Typography variant="h5" gutterBottom sx={{ color: '#e0e0e0' }}>
                                ${product.price.toFixed(2)} {/* Format price */}
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


                            {/* Add to Cart Button */}
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<AddShoppingCartIcon />}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                sx={{
                                    mt: 3,
                                    backgroundColor: '#7e57c2', // Purple background
                                    '&:hover': { backgroundColor: '#673ab7' }, // Darker purple on hover
                                    '&.Mui-disabled': { // Styling for disabled state
                                        backgroundColor: '#424242',
                                        color: '#9e9e9e',
                                    }
                                }}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            {/* Add to Wishlist (Placeholder) */}
                            <Button
                                variant="outlined"
                                size="large"
                                sx={{
                                    mt: 3,
                                    ml: 2, // Add spacing between buttons
                                    color: '#ffffff',
                                    borderColor: '#7e57c2',
                                    '&:hover': {
                                        borderColor: '#673ab7',
                                        backgroundColor: 'rgba(126, 87, 194, 0.08)',
                                    },
                                }}
                                disabled // Disable for now as wishlist is not in scope
                            >
                                Add to Wishlist (Soon)
                            </Button>
                        </Box>
                    </Grid>
                </Grid>

                {/* Description, Reviews, Shipping Tabs */}
                <Paper sx={{ backgroundColor: '#1e1e1e', color: '#ffffff', mb: 6 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered // Center the tabs
                        sx={{
                            '.MuiTabs-indicator': { backgroundColor: '#7e57c2' }, // Purple indicator
                            '.MuiTab-root': {
                                color: '#bdbdbd', // Grey text for inactive tabs
                                '&.Mui-selected': {
                                    color: '#ffffff', // White text for active tab
                                },
                            },
                        }}
                    >
                        <Tab label="Description" />
                        <Tab label="Reviews" />
                        {/* <Tab label="Shipping & Returns" disabled/> // Optional: Add other tabs */}
                    </Tabs>
                    <Divider sx={{ backgroundColor: '#424242' }} /> {/* Dark divider */}
                    <Box sx={{ padding: 3 }}>
                        {/* Tab Panel Content */}
                        {activeTab === 0 && (
                            <Typography variant="body1" sx={{ color: '#e0e0e0', lineHeight: 1.6 }}>
                                {product.description || 'No description available.'}
                            </Typography>
                        )}
                        {activeTab === 1 && (
                            <Box>
                                {/* Review List Component */}
                                <ReviewList productId={product.id} />
                                <Divider sx={{ backgroundColor: '#424242', my: 3 }} />
                                {/* Review Form Component */}
                                <ReviewForm productId={product.id} />
                            </Box>
                        )}
                        {/* Add content for other tabs here */}
                    </Box>
                </Paper>


                {/* You May Also Like Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        You May Also Like
                    </Typography>
                    <Grid container spacing={3}>
                        {relatedProducts.map((relatedProduct) => (
                            <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                                <ProductCard product={relatedProduct} />
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