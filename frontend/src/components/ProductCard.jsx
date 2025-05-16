// gamedrop-frontend/src/components/ProductCard.jsx
import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, IconButton, Box } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Link } from 'react-router-dom';
// apiClient is not directly used in this component, so it can be removed if not needed elsewhere
// import apiClient from '../api';

// Assume CartContext provides an addItem function
import { useCart } from '../contexts/CartContext'; // Use the cart context - ensure correct path

/**
 * Reusable component to display a single product card.
 * Styled to match the v0.dev prototype's product card appearance.
 *
 * @param {object} product - The product object to display.
 * @param {string} product.id - The unique ID of the product.
 * @param {string} product.title - The title of the product.
 * @param {string} product.platform - The platform the game is on.
 * @param {string} product.genre - The genre of the game.
 * @param {number} product.price - The price of the product.
 * @param {string} product.cover_image_url - The URL of the product's cover image.
 * @param {number} product.stock_quantity - The number of items in stock.
 */
function ProductCard({ product }) {
    // Use the useCart hook to access cart functionality
    const { addItem } = useCart(); // Get the addItem function

    // Placeholder for addToCart function before CartContext is implemented
    const handleAddToCart = () => {
        console.log(`Attempting to add product ${product.id} to cart`);
        // Call addItem - the Snackbar logic is now handled inside the addItem function in CartContext
        addItem(product.id, 1);
    };

    const isOutOfStock = product.stock_quantity <= 0;

    return (
        <Card
            sx={{
                height: '100%', // Ensure cards in a grid have equal height
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1e1e1e', // Dark background for the card
                color: '#ffffff', // White text color
                borderRadius: 2, // Rounded corners
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)', // Subtle shadow for depth
                transition: 'transform 0.2s ease-in-out', // Smooth hover effect
                '&:hover': {
                    transform: 'translateY(-5px)', // Lift card slightly on hover
                },
            }}
        >
            {/* Product Image */}
            <CardMedia
                component="img"
                sx={{
                    height: 200, // Fixed height for the image area
                    objectFit: 'cover', // Crop image to cover the area
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
                image={product.cover_image_url || '/placeholder-image.png'} // Use a placeholder if no image URL
                alt={product.title}
            />

            {/* Product Details */}
            <CardContent sx={{ flexGrow: 1, padding: 2 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ color: '#ffffff', lineHeight: 1.3 }}>
                    {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ color: '#bdbdbd', mb: 1 }}>
                    {product.platform} | {product.genre}
                </Typography>
                <Typography variant="h5" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                    ${parseFloat(product.price).toFixed(2)} {/* Format price to 2 decimal places */}
                </Typography>
                {/* Optional: Display stock status */}
                {isOutOfStock && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Out of Stock
                    </Typography>
                )}
            </CardContent>

            {/* Card Actions (Buttons) */}
            <CardActions sx={{ padding: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                {/* View Details Button */}
                <Button
                    variant="outlined"
                    size="small"
                    component={Link} // Use react-router-dom Link for navigation
                    to={`/products/${product.id}`} // Link to the product detail page
                    sx={{
                        color: '#ffffff', // White text color
                        borderColor: '#7e57c2', // Purple border color
                        '&:hover': {
                            borderColor: '#673ab7', // Darker purple border on hover
                            backgroundColor: 'rgba(126, 87, 194, 0.08)', // Subtle purple background on hover
                        },
                    }}
                >
                    View Details
                </Button>

                {/* Add to Cart Button */}
                <IconButton
                    color="primary"
                    aria-label="add to shopping cart"
                    onClick={handleAddToCart} // This calls the addItem function from CartContext
                    disabled={isOutOfStock} // Disable if out of stock
                    sx={{
                        backgroundColor: '#7e57c2', // Purple background color
                        color: '#ffffff', // White icon color
                        '&:hover': {
                            backgroundColor: '#673ab7', // Darker purple on hover
                        },
                        '&.Mui-disabled': { // Styling for disabled state
                            backgroundColor: '#424242',
                            color: '#9e9e9e',
                        }
                    }}
                >
                    <AddShoppingCartIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
}

export default ProductCard;