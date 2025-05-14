// gamedrop-frontend/src/components/ProductFilter.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';

/**
 * A filter component for products by platform and genre.
 * Styled to match the prototype's dark theme.
 *
 * @param {object} filterCriteria - An object containing current filter values (e.g., { platform: '', genre: '' }).
 * @param {function} onFilterChange - Function to call when a filter value changes. Receives { type: 'platform' | 'genre', value: string }.
 */
function ProductFilter({ filterCriteria, onFilterChange }) {

    // Placeholder data for platforms and genres - replace with actual data fetched from backend
    const platforms = ['All Platforms', 'PlayStation', 'Xbox', 'Nintendo', 'PC'];
    const genres = ['All Genres', 'Action', 'RPG', 'Strategy', 'Sports', 'Adventure', 'Simulation'];


    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Platform Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel
                    id="platform-filter-label"
                    sx={{
                        color: '#bdbdbd', // Grey label text
                        '&.Mui-focused': {
                            color: '#7e57c2', // Purple label when focused
                        }
                    }}
                >
                    Platform
                </InputLabel>
                <Select
                    labelId="platform-filter-label"
                    id="platform-filter"
                    value={filterCriteria.platform}
                    label="Platform"
                    onChange={(e) => onFilterChange({ type: 'platform', value: e.target.value })}
                    sx={{
                        color: '#ffffff', // White selected value text
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#424242', // Dark grey border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#616161', // Lighter grey border on hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7e57c2', // Purple border when focused
                        },
                        '.MuiSvgIcon-root': { // Style for the dropdown arrow icon
                            color: '#bdbdbd', // Grey icon color
                        }
                    }}
                    MenuProps={{ // Style the dropdown menu paper
                        PaperProps: {
                            sx: {
                                backgroundColor: '#1e1e1e', // Dark background for menu
                                color: '#ffffff', // White text color
                            },
                        },
                    }}
                >
                    {platforms.map((platform) => (
                        <MenuItem key={platform} value={platform === 'All Platforms' ? '' : platform} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                            {platform}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Genre Filter */}
            <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel
                    id="genre-filter-label"
                    sx={{
                        color: '#bdbdbd', // Grey label text
                        '&.Mui-focused': {
                            color: '#7e57c2', // Purple label when focused
                        }
                    }}
                >
                    Genre
                </InputLabel>
                <Select
                    labelId="genre-filter-label"
                    id="genre-filter"
                    value={filterCriteria.genre}
                    label="Genre"
                    onChange={(e) => onFilterChange({ type: 'genre', value: e.target.value })}
                    sx={{
                        color: '#ffffff', // White selected value text
                        '.MuiOutlinedInput-notchedOutline': {
                            borderColor: '#424242', // Dark grey border
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#616161', // Lighter grey border on hover
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7e57c2', // Purple border when focused
                        },
                        '.MuiSvgIcon-root': { // Style for the dropdown arrow icon
                            color: '#bdbdbd', // Grey icon color
                        }
                    }}
                    MenuProps={{ // Style the dropdown menu paper
                        PaperProps: {
                            sx: {
                                backgroundColor: '#1e1e1e', // Dark background for menu
                                color: '#ffffff', // White text color
                            },
                        },
                    }}
                >
                    {genres.map((genre) => (
                        <MenuItem key={genre} value={genre === 'All Genres' ? '' : genre} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                            {genre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}

export default ProductFilter;