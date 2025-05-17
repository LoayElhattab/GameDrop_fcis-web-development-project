// gamedrop-frontend/src/components/ReviewList.jsx
import React from 'react';
// Import necessary Material UI components for both ReviewList and the nested ReviewItem
import { Box, Typography, Divider } from '@mui/material';
// Optional: Import Rating if you are using it for reviews
import Rating from '@mui/material/Rating';



const ReviewItem = ({ review }) => {
    return (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {review.user?.username || 'Anonymous'}
            </Typography>

            {/* Display Rating if available */}
            {review.rating !== undefined && review.rating !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {/* Use review.rate for the rating value */}
                    <Rating value={review.rating} readOnly precision={1} size="small" sx={{ color: '#ffb74d' }} />
                    <Typography variant="body2" sx={{ color: '#bdbdbd', ml: 1 }}>{review.rating}/5</Typography>
                </Box>
            )}

            <Typography variant="body2" sx={{ color: '#e0e0e0', mt: 1 }}>
                {review.comment}
            </Typography>

            {/* Display Date */}
            {review.created_at && (
                <Typography variant="caption" sx={{ color: '#bdbdbd', mt: 1, display: 'block' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                </Typography>
            )}
        </Box>
    );
};


const ReviewList = ({ reviews }) => {
    const reviewsToDisplay = Array.isArray(reviews) ? reviews : [];

    if (reviewsToDisplay.length === 0) {
        return (
            <Box sx={{ mt: 2 }}>
                <Typography sx={{ color: '#bdbdbd' }}>No reviews yet. Be the first to write one!</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>Customer Reviews ({reviewsToDisplay.length})</Typography>
            {reviewsToDisplay.map(review => (
                <ReviewItem key={review.id} review={review} />
            ))}
        </Box>
    );
};

export default ReviewList;