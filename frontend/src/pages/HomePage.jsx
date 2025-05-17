import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { Link, useNavigate } from 'react-router-dom';
import playstationIcon from '../assets/images/PS.png';
import xboxIcon from '../assets/images/Xbox.png';
import nintendoIcon from '../assets/images/Nintendo.png';
import pcIcon from '../assets/images/PC.png';
import { useAuth } from '../contexts/AuthContext';

const platforms = [
    { name: 'PlayStation', image: playstationIcon },
    { name: 'Xbox', image: xboxIcon },
    { name: 'Nintendo', image: nintendoIcon },
    { name: 'PC', image: pcIcon },
];

function HomePage() {
    const [featuredGames, setFeaturedGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAdmin } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const featuredResponse = await apiClient.get('/products/getProducts', {
                    params: {
                        isFeatured: true,
                        limit: 6
                    },
                    withCredentials: true
                });
                setFeaturedGames(featuredResponse.data.products || []);
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
        return <Typography color="error">Error loading sections: {error.message}</Typography>;
    }

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
                {/* Hero Section */}
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 300, md: 400 },
                        backgroundImage: 'linear-gradient(to right, #5e35b1, #d81b60)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        borderRadius: 2,
                        mb: 8,
                        padding: 3,
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                        Level Up Your Gaming Experience
                    </Typography>
                    <Typography variant="h6" component="p" gutterBottom sx={{ color: '#e0e0e0', mb: 4 }}>
                        Discover the latest games for all platforms. Fast delivery, great prices, and exclusive deals.
                    </Typography>
                    <Box sx={{ width: '100%', maxWidth: 500 }}>
                        {/* Search bar placeholder */}
                    </Box>
                    <Box sx={{ mt: 4 }}>
                        <Button
                            onClick={() => navigate('/search-results?allGames=true')}
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ mr: 2, backgroundColor: '#7e57c2', '&:hover': { backgroundColor: '#673ab7' } }}
                        >
                            Browse All Games
                        </Button>
                    </Box>
                </Box>

                {/* Shop by Platform Section */}
                <Box
                    sx={{
                        mb: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'linear-gradient(145deg, #0f0f0f, #1e1e1e)',
                        padding: 4,
                        borderRadius: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.01), transparent 70%)',
                            zIndex: 0,
                        },
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{
                            color: '#ffffff',
                            fontWeight: '600',
                            textAlign: 'left',
                            textShadow: '0 0 4px rgba(255, 255, 255, 0.2)',
                            zIndex: 1,
                        }}
                    >
                        Shop by Platform
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {platforms.map((platform, index) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={3}
                                key={platform.name}
                                sx={{
                                    animation: `fadeIn 0.6s ease-in-out ${index * 0.2}s forwards`,
                                    opacity: 0,
                                    '@keyframes fadeIn': {
                                        '0%': { opacity: 0, transform: 'translateY(15px)' },
                                        '100%': { opacity: 1, transform: 'translateY(0)' },
                                    },
                                }}
                            >
                                <Button
                                    onClick={() => navigate(`/search-results?platform=${encodeURIComponent(platform.name)}&fromPlatform=true`)}
                                    sx={{ width: '100%', height: '100%', padding: 0 }}
                                >
                                    <Card
                                        sx={{
                                            background: 'transparent',
                                            color: '#ffffff',
                                            textAlign: 'center',
                                            height: 120,
                                            width: 120,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 2,
                                            borderRadius: 8,
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                            transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)',
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: '0 0 6px rgba(255, 255, 255, 0.1)',
                                                transition: 'box-shadow 0.4s ease',
                                                '&:hover': {
                                                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                                                },
                                            }}
                                        >
                                            <img
                                                src={platform.image || ''}
                                                alt={`${platform.name} Icon`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: '400',
                                                textShadow: '0 0 3px rgba(255, 255, 255, 0.15)',
                                                transition: 'text-shadow 0.4s ease',
                                                '&:hover': {
                                                    textShadow: '0 0 6px rgba(255, 255, 255, 0.3)',
                                                },
                                            }}
                                        >
                                            {platform.name}
                                        </Typography>
                                    </Card>
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Featured Games Section */}
                <Box
                    sx={{
                        mb: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h2"
                        gutterBottom
                        sx={{
                            color: '#ffffff',
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}
                    >
                        Featured Games
                    </Typography>
                    <Box
                        sx={{
                            background: 'linear-gradient(145deg, #0f0f0f, #1e1e1e)',
                            borderRadius: 2,
                            padding: 3,
                            width: { xs: '100%', md: '90%' },
                            maxWidth: 1200,
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                            overflow: 'hidden',
                            position: 'relative',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.01), transparent 70%)',
                                zIndex: 0,
                            },
                        }}
                    >
                        <Grid container spacing={3} justifyContent="center">
                            {featuredGames.map((product, index) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={3}
                                    key={product.id}
                                    sx={{
                                        display: 'flex',
                                        animation: `fadeIn 0.6s ease-in-out ${index * 0.2}s forwards`,
                                        opacity: 0,
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(15px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' },
                                        },
                                    }}
                                >
                                    <ProductCard product={product} isAdmin={isAdmin} />
                                </Grid>
                            ))}
                            {featuredGames.length === 0 && !loading && (
                                <Grid item xs={12}>
                                    <Typography sx={{ textAlign: 'center', color: '#bdbdbd' }}>
                                        No featured games found.
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Box>

                {/* Stay Updated Section (Placeholder) */}
                <Box
                    sx={{
                        background: 'linear-gradient(145deg, #0f0f0f, #1e1e1e)',
                        padding: 4,
                        textAlign: 'center',
                        borderRadius: 2,
                        mb: 8,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.01), transparent 70%)',
                            zIndex: 0,
                        },
                    }}
                >
                    <Typography variant="h4" component="h2" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', position: 'relative', zIndex: 1 }}>
                        Stay Updated
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#e0e0e0', mb: 2, position: 'relative', zIndex: 1 }}>
                        Subscribe to our newsletter to get the latest news, updates, exclusive deals, and gaming insights.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
                        {/* Input field and button will be added later */}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default HomePage;