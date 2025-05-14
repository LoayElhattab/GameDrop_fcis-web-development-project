// gamedrop-frontend/src/components/ProductSearch.jsx
import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * A search input component for products.
 * Styled to match the prototype's dark theme.
 *
 * @param {string} searchTerm - The current value of the search input.
 * @param {function} onSearchChange - Function to call when the search input value changes.
 * @param {function} onSearchSubmit - Optional function to call when the user submits the search (e.g., presses Enter or clicks search icon).
 */
function ProductSearch({ searchTerm, onSearchChange, onSearchSubmit }) {

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && onSearchSubmit) {
            onSearchSubmit();
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 400 }}>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#bdbdbd' }} /> {/* Grey icon */}
                        </InputAdornment>
                    ),
                    // Optional: Add an end adornment icon button if onSearchSubmit is provided
                    endAdornment: onSearchSubmit && (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="perform search"
                                onClick={onSearchSubmit}
                                edge="end"
                                sx={{ color: '#7e57c2' }} // Purple icon
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    sx: {
                        color: '#ffffff', // White text input
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#424242', // Darker grey border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#616161', // Lighter grey border on hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7e57c2', // Purple border when focused
                        },
                        '& .MuiInputBase-input': {
                            color: '#ffffff', // Ensure input text is white
                            '::placeholder': {
                                color: '#bdbdbd', // Grey placeholder text
                            },
                        },
                    },
                }}
                sx={{
                    // Additional styling for the TextField wrapper if needed
                }}
            />
        </Box>
    );
}

export default ProductSearch;