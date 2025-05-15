// gamedrop-frontend/src/pages/FilteredProductsSearch.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Container, Grid, Pagination } from '@mui/material';
import apiClient from '../api/apiClient'; // Assuming apiClient is configured here
import ProductCard from '../components/ProductCard'; // ProductCard component
import ProductSearch from '../components/ProductSearch'; // ProductSearch component
import ProductFilter from '../components/ProductFilter'; // ProductFilter component
import { useSearchParams } from 'react-router-dom'; // Hook for URL parameters

function FilteredProductsSearch() {
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
            const response = await apiClient.get('/api/products', { // Ensure this endpoint is correct
                params: {
                    search: searchTerm || undefined, // Only include if not empty
                    platform: platformFilter || undefined, // Only include if not empty
                    genre: genreFilter || undefined, // Only include if not empty
                    page: currentPage,
                    limit: limit,
                }
            });
            setProducts(response.data.products || []); // Assuming API returns { products: [...], total: N }
            setTotalProducts(response.data.total || 0); // Set the total number of products
            setLoading(false);
        } catch (err) {
            console.error("Error fetching filtered products:", err); // Log the error for debugging
            setError(err);
            setLoading(false);
        }
    }, [searchTerm, platformFilter, genreFilter, currentPage, limit]); // Dependencies for useCallback

    // Effect to fetch products whenever search params change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // Dependency is the memoized fetchProducts function

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

    // Function to handle search input change (optional, can be used for live search or suggestions)
    // For now, we'll just pass it to the ProductSearch component, but the actual filtering
    // happens on submit via handleSearchSubmit.
    const handleSearchInputChange = (value) => {
        // If you wanted live search as the user types, you would update a local state here
        // and potentially trigger a debounced fetch. For now, search is triggered on submit.
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
                    Search Results
                </Typography>

                {/* Search and Filter Components */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4, alignItems: 'center' }}>
                    <ProductSearch
                        searchTerm={searchTerm} // Pass current search term from URL
                        onSearchChange={handleSearchInputChange} // Handler for input change (doesn't trigger fetch yet)
                        onSearchSubmit={(value) => handleSearchSubmit(value || searchTerm)} // Handler for submit (triggers fetch)
                    />
                    <ProductFilter
                        filterCriteria={{ platform: platformFilter, genre: genreFilter }} // Pass current filters from URL
                        onFilterChange={handleFilterChange} // Handler for filter change (triggers fetch)
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

export default FilteredProductsSearch;
