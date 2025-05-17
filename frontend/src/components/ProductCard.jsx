import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, IconButton, Box } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';


function ProductCard({ product, isAdmin }) {
    const { addItem } = useCart();

    const handleAddToCart = () => {
        console.log(`Attempting to add product ${product.id} to cart`);
        addItem(product.id, 1);
    };

    const isOutOfStock = product.stock_quantity <= 0;
    const isAddToCartDisabled = isOutOfStock || isAdmin;

    return (
        <Card
            sx={{
                minHeight: 400,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                borderRadius: 2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                },
            }}
        >
            {/* Product Image */}
            <CardMedia
                component="img"
                sx={{
                    height: 200,
                    width: '100%',
                    objectFit: 'cover',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                }}
                image={product.cover_image_url || '/placeholder-image.png'}
                alt={product.title}
            />

            {/* Product Details */}
            <CardContent sx={{ flexGrow: 1, padding: 2 }}>
                <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                        color: '#ffffff',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {product.title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        color: '#bdbdbd',
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {product.platform} | {product.genre}
                </Typography>
                <Typography variant="h5" sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
                    ${parseFloat(product.price).toFixed(2)}
                </Typography>
                {isOutOfStock && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        Out of Stock
                    </Typography>
                )}
            </CardContent>

            {/* Card Actions (Buttons) */}
            <CardActions sx={{ padding: 2, justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/products/${product.id}`}
                    sx={{
                        color: '#ffffff',
                        borderColor: '#7e57c2',
                        '&:hover': {
                            borderColor: '#673ab7',
                            backgroundColor: 'rgba(126, 87, 194, 0.08)',
                        },
                    }}
                >
                    View Details
                </Button>

                <IconButton
                    color="primary"
                    aria-label="add to shopping cart"
                    onClick={handleAddToCart}
                    disabled={isAddToCartDisabled}
                    sx={{
                        backgroundColor: '#7e57c2',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: '#673ab7',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#424242',
                            color: '#9e9e9e',
                        },
                    }}
                >
                    <AddShoppingCartIcon />
                </IconButton>
            </CardActions>
        </Card>
    );
}

export default ProductCard;