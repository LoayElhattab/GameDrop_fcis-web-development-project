import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Container, Grid, Pagination } from '@mui/material';
import apiClient from '../api/apiClient';
import ProductCard from '../components/ProductCard';
import { useSearchParams, useNavigate } from 'react-router-dom';

function FilteredProductsSearch() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0);

    const [searchParams, setSearchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';
    const platformFilter = searchParams.get('platform') || '';
    const genreFilter = searchParams.get('genre') || '';
    const fromPlatform = searchParams.get('fromPlatform') === 'true'; 
    const allGames = searchParams.get('allGames') === 'true';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const totalPages = Math.ceil(totalProducts / limit);
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/products/getProducts', {
                params: {
                    search: searchTerm || undefined,
                    platform: platformFilter || undefined,
                    genre: genreFilter || undefined,
                    page: currentPage,
                    limit: limit,
                }
            });
            setProducts(response.data.products || []);
            setTotalProducts(response.data.total || 0);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching filtered products:", err);
            setError(err);
            setLoading(false);
        }
    }, [searchTerm, platformFilter, genreFilter, currentPage, limit]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearchSubmit = (value) => {
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            if (value) {
                newParams.set('search', value);
            } else {
                newParams.delete('search');
            }
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handleFilterChange = ({ type, value }) => {
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            if (value) {
                newParams.set(type, value);
            } else {
                newParams.delete(type);
            }
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handlePageChange = (event, value) => {
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set('page', value.toString());
            return newParams;
        });
    };

    const handleSearchInputChange = (value) => {
        if (searchTerm.trim()) {
            navigate(`/search-results?search=${encodeURIComponent(searchTerm.trim())}`);
        } else {
            navigate('/products/getProducts');
        }
    };

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
                <Typography color="error">Error loading products: {error.message}</Typography>
            </Container>
        );
    }

    // Determine the title based on navigation source
    const pageTitle = allGames 
        ? 'All Games'
        : fromPlatform && platformFilter 
        ? `${platformFilter} Games`
        : 'Search Results';

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
                <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 4 }}>
                    {pageTitle}
                </Typography>

                {/* Product Grid */}
                <Grid container spacing={3}>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                                <ProductCard product={product} />
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography sx={{ textAlign: 'center', color: '#bdbdbd' }}>No products found matching your criteria.</Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            sx={{
                                '.MuiPaginationItem-root': {
                                    color: '#ffffff',
                                    '&.Mui-selected': {
                                        backgroundColor: '#7e57c2',
                                        color: '#ffffff',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#673ab7',
                                    },
                                },
                                '.MuiPaginationItem-icon': {
                                    color: '#ffffff',
                                }
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default FilteredProductsSearch;