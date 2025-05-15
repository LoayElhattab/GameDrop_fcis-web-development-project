// gamedrop-frontend/src/pages/__tests__/LoginPage.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../LoginPage';

// Mock the useAuth hook
const mockLogin = jest.fn();
const mockUseAuth = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: mockLogin,
    register: jest.fn(), // Mock other auth functions as well
    logout: jest.fn(),
    user: null,
    isAdmin: false,
};

jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth,
}));

// Mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // Import and retain original hooks like Outlet, etc.
    useNavigate: () => mockNavigate, // Mock useNavigate
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Simple mock for Link used by MuiLink
}));

describe('LoginPage', () => {
    beforeEach(() => {
        // Reset mocks and initial hook state before each test
        mockLogin.mockClear();
        mockNavigate.mockClear();
        // Reset the state exposed by the mock hook
        mockUseAuth.isAuthenticated = false;
        mockUseAuth.isLoading = false;
        mockUseAuth.error = null;
    });

    test('renders login form with email and password fields and submit button', () => {
        render(<LoginPage />);

        // Check if the form elements are present
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    test('allows entering text into input fields', () => {
        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    test('calls login function with correct values on form submission', async () => {
        // Simulate a successful login response from the mock login function
        mockLogin.mockResolvedValue(true); // Assume login resolves successfully

        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Wait specifically for the mockLogin function to have been called.
        // This is our single condition inside waitFor.
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1);
        });

        // Now perform assertions about the arguments *after* the wait is complete
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        // Note: Testing the redirection after success is handled by the
        // 'redirects to homepage if already authenticated' test case below.
    });

    test('displays error message if login fails', async () => {
        // Simulate a failed login response by setting error state in the mock hook
        mockUseAuth.error = 'Invalid credentials'; // Set the error message exposed by the mock
        mockLogin.mockResolvedValue(false); // Or mockLogin could throw an error that the component catches

        render(<LoginPage />);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const submitButton = screen.getByRole('button', { name: /Sign In/i });

        fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);

        // Wait specifically for the error message to appear in the document.
        // This is our single condition inside waitFor.
        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });

        // Now perform other assertions outside the waitFor
        // Check login was attempted with the provided credentials
        expect(mockLogin).toHaveBeenCalledTimes(1);
        expect(mockLogin).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
        // Ensure that navigation did NOT happen on failure
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('displays loading spinner and disables button when isLoading is true', () => {
        // Simulate loading state from the mock hook
        mockUseAuth.isLoading = true;
        render(<LoginPage />);

        // Check if the circular progress indicator is displayed
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        // Check if the submit button is disabled
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeDisabled();
    });

    test('redirects to homepage if already authenticated', () => {
        // Simulate being already authenticated from the mock hook
        mockUseAuth.isAuthenticated = true;
        render(<LoginPage />);

        // Because isAuthenticated is true initially, the useEffect in LoginPage should be triggered
        // and call the navigate function
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        // Expect it to navigate to the homepage with replace: true
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        // Also, the form elements should not be rendered if already authenticated
        expect(screen.queryByLabelText(/Email Address/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Password/i)).not.toBeInTheDocument();
    });

    test('renders link to Register page', () => {
        render(<LoginPage />);
        // Find the link by its text content
        const registerLink = screen.getByRole('link', { name: /Don't have an account\? Sign Up/i });
        expect(registerLink).toBeInTheDocument();
        // Check that the link points to the correct path
        expect(registerLink).toHaveAttribute('href', '/register');
    });
});