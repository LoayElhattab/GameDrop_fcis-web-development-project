// gamedrop-frontend/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured here
import ProductCard from '../components/ProductCard'; // Assuming ProductCard is created here
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import playstationIcon from '../assets/images/PS.png'; // Adjust path based on your exact structure
import xboxIcon from '../assets/images/Xbox.png';   // Adjust path
import nintendoIcon from '../assets/images/Nintendo.png'; // Adjust path
import pcIcon from '../assets/images/PC.png';

// Placeholder data for platforms - replace with dynamic data if needed
const platforms = [
    { name: 'PlayStation', image: playstationIcon },
    { name: 'Xbox', image: xboxIcon },
    { name: 'Nintendo', image: nintendoIcon },
    { name: 'PC', image: pcIcon },
];
function HomePage() {
    const [featuredGames, setFeaturedGames] = useState([]);
    const [specialDeals, setSpecialDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);// State for the search input
    const navigate = useNavigate();
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch featured games (example: filter by a 'featured' flag or sort)
                const featuredResponse = await apiClient.get('/products/getProducts', {
                    params: {
                        isFeatured: true, limit: 4

                    },
                    withCredentials: true // Example filter/limit
                });
                setFeaturedGames(featuredResponse.data.products || []); // Assuming API returns { products: [...], total: N }

                // Fetch special deals (example: filter by a 'discount' flag or sort by price)
                const dealsResponse = await apiClient.get('/products/getProducts', {
                    params: { hasDiscount: true, limit: 4 },
                    withCredentials: true // Example filter/limit
                });
                setSpecialDeals(dealsResponse.data.products || []); // Assuming API returns { products: [...], total: N }

                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Handler for when the search input value changes



    if (loading) {
        return <Typography color="text.primary">Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">Error loading sections: {error.message}</Typography>;
    }

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
                {/* Hero Section */}
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 300, md: 400 }, // Adjust height responsively
                        backgroundImage: 'linear-gradient(to right, #5e35b1, #d81b60)', // Example gradient
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: 2,
                        mb: 8, // Margin bottom
                        padding: 3,
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Level Up Your Gaming Experience
                    </Typography>
                    <Typography variant="h6" component="p" gutterBottom sx={{ color: '#e0e0e0', mb: 4 }}>
                        Discover the latest games for all platforms. Fast delivery, great prices, and exclusive deals.
                    </Typography>

                    {/* Integrated Product Search */}
                    <Box sx={{ width: '100%', maxWidth: 500 }}> {/* Limit search bar width */}

                    </Box>


                    <Box sx={{ mt: 4 }}> {/* Add spacing above buttons */}
                        <Button
                            onClick={() => navigate('/search-results')}
                            variant="contained"
                            color="primary"
                            size="large"
                            to="/products"
                            sx={{ mr: 2, backgroundColor: '#7e57c2', '&:hover': { backgroundColor: '#673ab7' } }}
                        >
                            Browse All Games
                        </Button>
                        {/* You could link "View Deals" to a pre-filtered product list */}
                        {/* <Button
              variant="outlined"
              color="secondary"
              size="large"
              component={Link}
              to="/products?deal=true" // Example link with filter
              sx={{ color: '#ffffff', borderColor: '#ffffff', '&:hover': { borderColor: '#e0e0e0', color: '#e0e0e0' } }}
            >
              View Deals
            </Button> */}
                    </Box>
                </Box>

                {/* Shop by Platform Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Shop by Platform
                    </Typography>
                    <Grid container spacing={3}>
                        {platforms.map((platform) => (
                            <Button
                                onClick={() => navigate(`/search-results?platform=${encodeURIComponent(platform.name)}`)}
                            >
                                <Grid item xs={12} sm={6} md={3} key={platform.name}>
                                    <Card
                                        sx={{
                                            backgroundColor: '#1e1e1e', // Dark card background
                                            color: '#ffffff',
                                            textAlign: 'center',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 2,
                                            '&:hover': {
                                                backgroundColor: '#2a2a2a',
                                                cursor: 'pointer',
                                            },
                                        }}
                                    // You might add a Link component here later to navigate to platform-filtered products
                                    // For example: component={Link} to={`/products?platform=${encodeURIComponent(platform.name)}`}
                                    >
                                        {/* Placeholder for platform icon/image */}
                                        <Box sx={{ width: 60, height: 60, backgroundColor: '#424242', borderRadius: '50%', mb: 1 }} >
                                            <img
                                                src={platform.image || ''} // Use platform image or a generic placeholder
                                                alt={`${platform.name} Icon`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} // Style the image to fit and cover the circular container
                                            />
                                        </Box>
                                        <Typography variant="h6">{platform.name}</Typography>
                                    </Card>
                                </Grid>
                            </Button>
                        ))}
                    </Grid>
                </Box>

                {/* Featured Games Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Featured Games
                    </Typography>
                    <Grid container spacing={3}>
                        {featuredGames.map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                        {featuredGames.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Typography sx={{ textAlign: 'center', color: '#bdbdbd' }}>No featured games found.</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Special Deals Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Special Deals
                    </Typography>
                    <Grid container spacing={3}>
                        {specialDeals.map((product) => (
                            <Grid item xs={12} sm={6} md={3} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))}
                        {specialDeals.length === 0 && !loading && (
                            <Grid item xs={12}>
                                <Typography sx={{ textAlign: 'center', color: '#bdbdbd' }}>No special deals found.</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Stay Updated Section (Placeholder) */}
                <Box
                    sx={{
                        backgroundColor: '#1e1e1e',
                        padding: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        mb: 8,
                    }}
                >
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Stay Updated
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
                        Subscribe to our newsletter to get the latest news, updates, exclusive deals, and gaming insights.
                    </Typography>
                    {/* Newsletter form placeholder */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        {/* Input field and button will be added later */}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default HomePage;