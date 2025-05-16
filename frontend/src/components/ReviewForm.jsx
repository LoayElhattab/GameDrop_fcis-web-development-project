// gamedrop-frontend/src/components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import Rating from '@mui/material/Rating';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';
// Optional: Import useSnackbar if you implemented a Snackbar context
// import { useSnackbar } from '../context/SnackbarContext';


const ReviewForm = ({ productId, onReviewSubmitted, hasUserReviewed }) => { // Accept hasUserReviewed prop
    const { isAuthenticated } = useAuth();
    // Optional: const { showSnackbar } = useSnackbar();

    const [comment, setComment] = useState('');
    const [rate, setRate] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Clear form and submission status when productId changes
    // We don't need to clear specifically for hasUserReviewed change
    // because we will conditionally render the whole form.
    useEffect(() => {
        setComment('');
        setRate(0);
        setIsSubmitting(false);
        setSubmissionError(null);
        setSubmissionSuccess(false);
    }, [productId]);


    const handleSubmitReview = async (event) => {
        event.preventDefault();

        // **Crucially, check here again before making the API call**
        if (!isAuthenticated) {
            console.log('User not authenticated. Cannot submit review.');
            // showSnackbar('Please log in to submit a review.', 'info');
            return; // Stop submission if not authenticated
        }

        if (hasUserReviewed) {
            console.log('User has already reviewed this product. Submission blocked.');
            // showSnackbar('You have already reviewed this product.', 'warning');
            return; // **Stop submission if user has already reviewed**
        }


        if (!comment.trim()) {
            setSubmissionError('Review comment cannot be empty.');
            return;
        }

        if (rate === 0) {
            setSubmissionError('Please provide a rating.');
            return;
        }


        setIsSubmitting(true);
        setSubmissionError(null);
        setSubmissionSuccess(false);

        try {
            const response = await apiClient.post(`/reviews/createReview`, {
                product_id: productId,
                rating: rate,
                comment: comment.trim(),
            });

            console.log('Review submitted:', response.data);

            setSubmissionSuccess(true);
            setComment('');
            setRate(0);

            if (onReviewSubmitted) {
                onReviewSubmitted(); // Trigger review refetch in parent
            }

            // showSnackbar('Review submitted successfully!', 'success');

        } catch (err) {
            console.error('Error submitting review:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit review. Please try again.';
            setSubmissionError(errorMessage);
            // showSnackbar(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Conditional Rendering ---

    // If not authenticated, show a login prompt
    if (!isAuthenticated) {
        return (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', borderRadius: 2, textAlign: 'center' }}>
                <Typography sx={{ color: '#bdbdbd' }}>Please log in to write a review.</Typography>
                {/* Optional: Add a login button/link */}
            </Box>
        );
    }

    // If authenticated AND user has already reviewed, show a message instead of the form
    if (hasUserReviewed) {
        return (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', borderRadius: 2, textAlign: 'center' }}>
                <Typography sx={{ color: '#bdbdbd' }}>You have already submitted a review for this product.</Typography>
                {/* Optional: Could add a button to edit the review here if that's a feature */}
            </Box>
        );
    }


    // If authenticated and has NOT reviewed, render the form
    return (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#1e1e1e', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#ffffff' }}>Write a Review</Typography>

            {/* Show submission errors or success messages */}
            {submissionError && <Alert severity="error" sx={{ mb: 2 }}>{submissionError}</Alert>}
            {submissionSuccess && <Alert severity="success" sx={{ mb: 2 }}>Review submitted successfully!</Alert>}

            <form onSubmit={handleSubmitReview}>
                {/* Text field for Comment */}
                <TextField
                    label="Your Review"
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    // Removed disabled prop based on hasUserReviewed here
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#424242' },
                            '&:hover fieldset': { borderColor: '#7e57c2' },
                            '&.Mui-focused fieldset': { borderColor: '#7e57c2' },
                            color: '#e0e0e0',
                            // Keep disabled styling for when submitting
                            '&.Mui-disabled fieldset': { borderColor: '#616161' },
                            '&.Mui-disabled .MuiInputBase-input': { color: '#9e9e9e' },
                        },
                        '& .MuiInputLabel-root': { color: '#bdbdbd' },
                        '& label.Mui-focused': { color: '#ffffff' },
                        '& label.Mui-disabled': { color: '#9e9e9e' },
                    }}
                    InputProps={{ style: { color: '#e0e0e0' } }}
                    InputLabelProps={{ style: { color: '#bdbdbd' } }}
                    disabled={isSubmitting} // Disable only when submitting
                />

                {/* Rating Component for Rate */}
                <Box sx={{ mb: 2 }}>
                    <Typography component="legend" sx={{ color: '#bdbdbd' }}>Rate</Typography>
                    <Rating
                        name="review-rate"
                        value={rate}
                        onChange={(event, newValue) => {
                            setRate(newValue);
                        }}
                        precision={1}
                        // Removed readOnly/disabled prop based on hasUserReviewed here
                        sx={{
                            color: '#ffb74d',
                            '&.Mui-disabled': { opacity: 0.5 },
                        }}
                        disabled={isSubmitting} // Disable only when submitting
                    />
                </Box>


                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    // Disable if submitting, comment empty, or rate is 0 (hasUserReviewed check is now handled by conditional rendering)
                    disabled={isSubmitting || !comment.trim() || rate === 0}
                    sx={{
                        backgroundColor: '#7e57c2',
                        '&:hover': { backgroundColor: '#673ab7' },
                        '&.Mui-disabled': { backgroundColor: '#424242', color: '#9e9e9e' },
                    }}
                >
                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Review'}
                </Button>
            </form>
        </Box>
    );
};

export default ReviewForm;