import React from 'react';
import { Box, Typography, Divider } from '@mui/material';
import Rating from '@mui/material/Rating';


const ReviewItem = ({ review }) => {
    return (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#2a2a2a', borderRadius: 1 }}>
            {/* Display Username */}
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ffffff' }}>
                {review.user?.username || 'Anonymous'}
            </Typography>

            {/* Display Rating if available */}
            {review.rate !== undefined && review.rate !== null && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {/* Use review.rate for the rating value */}
                    <Rating value={review.rate} readOnly precision={1} size="small" sx={{ color: '#ffb74d' }} />
                    <Typography variant="body2" sx={{ color: '#bdbdbd', ml: 1 }}>{review.rate}/5</Typography>
                </Box>
            )}

            {/* Display Comment */}
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


// Component to display the list of reviews
const ReviewList = ({ reviews }) => {
    // Ensure reviews is an array before trying to map over it
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
            {/* Map over the ensured array and render the nested ReviewItem component */}
            {reviewsToDisplay.map(review => (
                // Assuming each review object has a unique 'id' provided by the backend
                <ReviewItem key={review.id} review={review} />
            ))}
        </Box>
    );
};

export default ReviewList;