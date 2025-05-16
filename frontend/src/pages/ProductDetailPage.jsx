// gamedrop-frontend/src/pages/ProductDetailPage.jsx
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
    CircularProgress, // Import CircularProgress for loading indicators
    Alert // Import Alert for error messages
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured
import ProductCard from '../components/ProductCard'; // Assuming ProductCard component exists
import { useCart } from '../contexts/CartContext'; // Assuming useCart context exists
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get user info

// Import your Review components
// Make sure these files exist and are correctly exported (default export)
import ReviewList from '../components/ReviewList'; // Component to list reviews
import ReviewForm from '../components/ReviewForm'; // Component for review submission


function ProductDetailPage() {
    const { productId } = useParams(); // Get productId from the URL
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0); // 0 for Description, 1 for Reviews

    // State for reviews fetched for this product
    const [reviews, setReviews] = useState([]);
    // State to track if the current user has reviewed this product
    const [hasUserReviewed, setHasUserReviewed] = useState(false);


    const { addItem } = useCart(); // Access the addItem function from CartContext
    const { user, isAuthenticated } = useAuth(); // Get user and isAuthenticated from AuthContext


    // Handler for adding the current product to the cart
    const handleAddToCart = () => {
        if (product) {
            console.log(`Attempting to add product ${product.id} to cart`);
            // Call the addItem function from CartContext
            addItem(product.id, 1); // Add 1 quantity of the current product
        }
    };

    // Handler for changing tabs (Description/Reviews)
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };


    // --- Review Handling Functions ---

    // Function to fetch reviews for the current product
    // Using useCallback because it's a dependency in useEffect and might be called elsewhere
    const fetchReviews = useCallback(async (id) => {
        try {
            // Assuming your backend endpoint for reviews is /api/products/:productId/reviews
            const reviewsResponse = await apiClient.get(`/reviews/product/${id}`);
            const fetchedReviews = reviewsResponse.data || []; // Default to empty array if response data is null/undefined
            setReviews(fetchedReviews);
            console.log('Reviews fetched:', fetchedReviews);

            // --- Check if the logged-in user has reviewed ---
            let userHasReviewed = false;
            if (isAuthenticated && user?.id) {
                // Use .some() to check if *any* review in the fetchedReviews array
                // belongs to the current logged-in user (matching user.id)
                // Assuming review objects fetched from backend have a 'user' property with an 'id' field
                userHasReviewed = fetchedReviews.some(
                    review => review.user_id === user.id
                );
                console.log(`User ${user?.id} has reviewed product ${id}: ${userHasReviewed}`); // Log the result
            } else {
                // If not authenticated or user ID is missing, they haven't reviewed *as this user*
                userHasReviewed = false;
                console.log('User not authenticated or user ID missing. hasUserReviewed set to false.');
            }
            setHasUserReviewed(userHasReviewed); // Update the state
            // -----------------------------------------------

        } catch (err) {
            console.error('Error fetching reviews:', err);
            // You might want to set a separate error state for reviews if needed
            // setReviewSubmissionError('Failed to load reviews.'); // Example
        }
    }, [isAuthenticated, user?.id]); // Depend on isAuthenticated and user.id


    // Callback function passed to ReviewForm to refresh reviews after a successful submission
    const handleReviewSubmitted = useCallback(() => {
        console.log('Review submitted successfully, refetching reviews...');
        if (productId) {
            // After submission, the user HAS reviewed, so set the state
            setHasUserReviewed(true);
            // Refetch to include the new review and re-run the check in fetchReviews
            fetchReviews(productId);
        }
        // Optional: Show a success message using Snackbar context if available
        // const { showSnackbar } = useSnackbar(); // Assuming you have this hook
        // showSnackbar('Review submitted successfully!', 'success');
    }, [productId, fetchReviews]); // Dependencies: productId and fetchReviews


    // --- Data Fetching Effect ---

    useEffect(() => {
        const fetchProductAndRelated = async () => {
            setLoading(true); // Start loading
            setError(null); // Clear previous errors
            setProduct(null); // Clear previous product data
            setRelatedProducts([]); // Clear previous related products
            setReviews([]); // Clear previous reviews
            setHasUserReviewed(false); // Reset reviewed status

            try {
                // Fetch the specific product details
                const productResponse = await apiClient.get(`/products/${productId}`);
                setProduct(productResponse.data);

                // Fetch related products
                // Assuming your backend endpoint is /api/products and supports filtering/excluding
                const relatedResponse = await apiClient.get('/products/getProducts', {
                    params: {
                        // Example parameters: fetch by genre, limit results, exclude the current product
                        // genre: productResponse.data.genre, // Uncomment if your API supports filtering by genre
                        limit: 4, // Fetch up to 4 related products
                        exclude: productId // Exclude the product currently being viewed
                    }
                });
                // Assuming the backend returns an object like { products: [...] } or an array [...]
                // Adjust based on your actual API response structure for listing products
                setRelatedProducts(relatedResponse.data.products || relatedResponse.data || []);


                // --- Fetch reviews for this product ---
                // fetchReviews is called here and will internally check hasUserReviewed
                await fetchReviews(productId);
                // -----------------------------------


                setLoading(false); // End loading on success

            } catch (err) {
                console.error('Error fetching product details or related products:', err);
                setError(err); // Set the main error state
                setLoading(false); // End loading on error
            }
        };

        // Only fetch if productId is available
        if (productId) {
            fetchProductAndRelated();
        }

    }, [productId, fetchReviews]); // Effect runs when productId or fetchReviews changes


    // --- Render States ---

    // Show loading spinner while data is being fetched
    if (loading) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <CircularProgress color="secondary" /> {/* Use Material UI CircularProgress */}
                <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>Loading...</Typography>
            </Container>
        );
    }

    // Show error message if fetching failed
    if (error) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Alert severity="error" sx={{ mt: 2 }}>Error loading product details: {error.message}</Alert> {/* Use Material UI Alert */}
            </Container>
        );
    }

    // Show message if product was not found after loading
    if (!product) {
        return (
            <Container sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff' }}>
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>Product not found.</Typography>
            </Container>
        );
    }

    // --- Main Component Render ---

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
                        {/* Placeholder for extra images (thumbnails) if needed */}
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
                                ${parseFloat(product.price).toFixed(2)} {/* Format price */}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ color: '#bdbdbd' }}>
                                Platform: {product.platform}
                            </Typography>
                            <Typography variant="body1" gutterBottom sx={{ color: '#bdbdbd' }}>
                                Genre: {product.genre}
                            </Typography>
                            {/* Stock Status */}
                            <Typography variant="body1" gutterBottom sx={{ color: product.stock_quantity > 10 ? '#81c784' : (product.stock_quantity > 0 ? '#ffb74d' : '#e57373') }}>
                                Stock Status: {isOutOfStock ? 'Out of Stock' : (product.stock_quantity <= 10 ? `Low Stock (${product.stock_quantity})` : 'In Stock')}
                            </Typography>
                            {/* Display description summary if available */}
                            {product.description && (
                                <Typography variant="body2" sx={{ color: '#e0e0e0', mt: 2, maxHeight: 100, overflowY: 'auto' }}>
                                    {product.description.substring(0, 200)}... {/* Display a summary, adjust length as needed */}
                                </Typography>
                            )}


                            <Button
                                variant="contained"
                                color="primary" // Use primary color
                                size="large"
                                startIcon={<AddShoppingCartIcon />}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                sx={{
                                    mt: 3,
                                    backgroundColor: '#7e57c2', // Purple background color
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
                        indicatorColor="primary" // Primary color for indicator
                        textColor="primary" // Primary color for selected text
                        centered // Center the tabs
                        sx={{
                            '.MuiTabs-indicator': { backgroundColor: '#7e57c2' }, // Purple indicator color
                            '.MuiTab-root': {
                                color: '#bdbdbd', // Grey text color for inactive tabs
                                '&.Mui-selected': {
                                    color: '#ffffff', // White text color for active tab
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
                                {/* Render the ReviewList component, passing the fetched reviews */}
                                <ReviewList reviews={reviews} />
                                <Divider sx={{ backgroundColor: '#424242', my: 3 }} />
                                {/* Render the ReviewForm component, passing necessary props */}
                                <ReviewForm
                                    productId={product.id} // Pass the current product's ID
                                    onReviewSubmitted={handleReviewSubmitted} // Pass the function to refetch reviews after submission
                                    hasUserReviewed={hasUserReviewed} // Pass the status to the form
                                />
                            </Box>
                        )}
                        {/* Add content for other tabs here based on activeTab */}
                    </Box>
                </Paper>


                {/* You May Also Like Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        You May Also Like
                    </Typography>
                    <Grid container spacing={3}>
                        {/* Map over related products and render ProductCard for each */}
                        {relatedProducts.map((relatedProduct) => (
                            <Grid item xs={12} sm={6} md={3} key={relatedProduct.id}>
                                {/* Pass the entire product object to ProductCard */}
                                <ProductCard product={relatedProduct} />
                            </Grid>
                        ))}
                        {/* Message if no related products are found */}
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