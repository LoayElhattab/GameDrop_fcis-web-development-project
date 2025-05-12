// src/pages/HomePage.jsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Our Application!
        </Typography>
        <Typography variant="body1">
          This is the home page of our application.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;