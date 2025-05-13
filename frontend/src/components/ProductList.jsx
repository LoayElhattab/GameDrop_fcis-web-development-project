// gamedrop-frontend/src/pages/ProductList.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Container, Grid, Pagination } from '@mui/material';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured here
import ProductCard from '../components/ProductCard'; // ProductCard component
import ProductSearch from '../components/ProductSearch'; // ProductSearch component
import ProductFilter from '../components/ProductFilter'; // ProductFilter component
import { useSearchParams } from 'react-router-dom'; // Hook for URL parameters

function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalProducts, setTotalProducts] = useState(0); // State to hold total number of products

    // Use useSearchParams to read and update URL query parameters
    const [searchParams, setSearchParams] = useSearchParams();

    // Get current search, filter, and pagination values from URL params
    const searchTerm = searchParams.get('search') || '';
    const platformFilter = searchParams.get('platform') || '';
    const genreFilter = searchParams.get('genre') || '';
    const currentPage = parseInt(searchParams.get('page') || '1', 10); // Default to page 1
    const limit = parseInt(searchParams.get('limit') || '12', 10); // Default limit to 12, can be changed

    // Calculate total pages
    const totalPages = Math.ceil(totalProducts / limit);

    // Memoize the fetch function to avoid unnecessary re-creations
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch products from the backend API using current search, filter, and pagination params
            const response = await apiClient.get('/products', {
                params: {
                    search: searchTerm || undefined, // Only include if not empty
                    platform: platformFilter || undefined, // Only include if not empty
                    genre: genreFilter || undefined, // Only include if not empty
                    page: currentPage,
                    limit: limit,
                }
            });
            setProducts(response.data.products); // Assuming API returns { products: [...], total: N }
            setTotalProducts(response.data.total); // Set the total number of products
            setLoading(false);
        } catch (err) {
            setError(err);
            setLoading(false);
        }
    }, [searchTerm, platformFilter, genreFilter, currentPage, limit]); // Dependencies for useCallback

    // Effect to fetch products whenever search params change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // Dependency is the memoized fetchProducts function

    // Handler for search input change (updates local state or could update URL directly)
    // We'll update URL on submit/Enter for better performance
    const handleSearchChange = (value) => {
        // Could update a local state here if we wanted a search button
        // For now, we'll let the ProductSearch component manage its own input state
        // The actual search is triggered by handleSearchSubmit or Enter key press
    };

    // Handler for search submission (updates URL param)
    const handleSearchSubmit = (value) => {
        // Update the 'search' query parameter in the URL
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            if (value) {
                newParams.set('search', value);
            } else {
                newParams.delete('search');
            }
            // Reset page to 1 on new search
            newParams.set('page', '1');
            return newParams;
        });
    };


    // Handler for filter change (updates URL params)
    const handleFilterChange = ({ type, value }) => {
        // Update the relevant filter query parameter in the URL
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            if (value) {
                newParams.set(type, value);
            } else {
                newParams.delete(type); // Remove param if value is empty (e.g., "All Platforms")
            }
            // Reset page to 1 on filter change
            newParams.set('page', '1');
            return newParams;
        });
    };

    // Handler for pagination change (updates URL param)
    const handlePageChange = (event, value) => {
        // Update the 'page' query parameter in the URL
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set('page', value.toString());
            return newParams;
        });
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
                <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#ffffff', fontWeight: 'bold', mb: 4 }}>
                    All Games
                </Typography>

                {/* Search and Filter Components */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4, alignItems: 'center' }}>
                    <ProductSearch
                        searchTerm={searchTerm}
                        onSearchChange={handleSearchChange} // Although we don't use the value directly in this handler, it's good practice to pass it
                        onSearchSubmit={(value) => handleSearchSubmit(value || searchParams.get('search') || '')} // Pass current input value or existing param on submit
                    />
                    <ProductFilter
                        filterCriteria={{ platform: platformFilter, genre: genreFilter }}
                        onFilterChange={handleFilterChange}
                    />
                </Box>


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
                {totalPages > 1 && ( // Only show pagination if there's more than one page
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            sx={{
                                '.MuiPaginationItem-root': {
                                    color: '#ffffff', // White text for page numbers
                                    '&.Mui-selected': {
                                        backgroundColor: '#7e57c2', // Purple background for selected page
                                        color: '#ffffff',
                                    },
                                    '&:hover': {
                                        backgroundColor: '#673ab7', // Darker purple on hover
                                    },
                                },
                                '.MuiPaginationItem-icon': {
                                    color: '#ffffff', // White color for navigation icons
                                }
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default ProductList;