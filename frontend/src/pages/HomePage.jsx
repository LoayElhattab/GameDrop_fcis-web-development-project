// gamedrop-frontend/src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured here
import ProductCard from '../components/ProductCard'; // Assuming ProductCard is created here
import { Link } from 'react-router-dom';

// Placeholder data for platforms - replace with dynamic data if needed
const platforms = [
    { name: 'PlayStation', image: '/path/to/ps-icon.png' },
    { name: 'Xbox', image: '/path/to/xbox-icon.png' },
    { name: 'Nintendo', image: '/path/to/nintendo-icon.png' },
    { name: 'PC', image: '/path/to/pc-icon.png' },
];

function HomePage() {
    const [featuredGames, setFeaturedGames] = useState([]);
    const [specialDeals, setSpecialDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch featured games (example: filter by a 'featured' flag or sort)
                const featuredResponse = await apiClient.get('/products', {
                    params: { isFeatured: true, limit: 4 } // Example filter/limit
                });
                setFeaturedGames(featuredResponse.data);

                // Fetch special deals (example: filter by a 'discount' flag or sort by price)
                const dealsResponse = await apiClient.get('/products', {
                    params: { hasDiscount: true, limit: 4 } // Example filter/limit
                });
                setSpecialDeals(dealsResponse.data);

                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <Typography color="text.primary">Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">Error loading products: {error.message}</Typography>;
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
                        height: 400, // Adjust height as needed
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
                    <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Level Up Your Gaming Experience
                    </Typography>
                    <Typography variant="h5" component="p" gutterBottom sx={{ color: '#e0e0e0' }}>
                        Discover the latest games for all platforms. Fast delivery, great prices, and exclusive deals.
                    </Typography>
                    <Box>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            component={Link}
                            to="/products"
                            sx={{ mr: 2, backgroundColor: '#7e57c2', '&:hover': { backgroundColor: '#673ab7' } }}
                        >
                            Shop Now
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="large"
                            component={Link}
                            to="/products?deal=true" // Example link with filter
                            sx={{ color: '#ffffff', borderColor: '#ffffff', '&:hover': { borderColor: '#e0e0e0', color: '#e0e0e0' } }}
                        >
                            View Deals
                        </Button>
                    </Box>
                </Box>

                {/* Shop by Platform Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Shop by Platform
                    </Typography>
                    <Grid container spacing={3}>
                        {platforms.map((platform) => (
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
                                >
                                    {/* Placeholder for platform icon/image */}
                                    <Box sx={{ width: 60, height: 60, backgroundColor: '#424242', borderRadius: '50%', mb: 1 }} />
                                    <Typography variant="h6">{platform.name}</Typography>
                                </Card>
                            </Grid>
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