// gamedrop-frontend/src/pages/__tests__/RegisterPage.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterPage from '../RegisterPage';

// Mock the useAuth hook
const mockRegister = jest.fn();
const mockUseAuth = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(), // Mock other auth functions
    register: mockRegister,
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
    ...jest.requireActual('react-router-dom'), // Import and retain original hooks
    useNavigate: () => mockNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>, // Simple mock for Link used by MuiLink
}));


describe('RegisterPage', () => {
    beforeEach(() => {
        // Reset mocks and initial hook state before each test
        mockRegister.mockClear();
        mockNavigate.mockClear();
        // Reset the state exposed by the mock hook
        mockUseAuth.isAuthenticated = false;
        mockUseAuth.isLoading = false;
        mockUseAuth.error = null;
    });

    test('renders registration form with username, email, password, confirm password fields and submit button', () => {
        render(<RegisterPage />);

        // Check if the form elements are present by their labels
        expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        // Check for the terms acceptance checkbox label
        expect(screen.getByLabelText(/I agree to the terms and privacy policy/i)).toBeInTheDocument();
        // Check for the submit button by its role and name
        expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    test('allows entering text into input fields and checking terms', () => {
        render(<RegisterPage />);
        const usernameInput = screen.getByLabelText(/Username/i);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
        const termsCheckbox = screen.getByLabelText(/I agree to the terms and privacy policy/i);

        // Simulate user typing into inputs
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        // Simulate clicking the checkbox
        fireEvent.click(termsCheckbox);

        // Assert that the input values match the entered text and the checkbox is checked
        expect(usernameInput).toHaveValue('testuser');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
        expect(confirmPasswordInput).toHaveValue('password123');
        expect(termsCheckbox).toBeChecked();
    });

    test('calls register function with correct values on form submission', async () => {
        // Simulate a successful registration response from the mock register function
        mockRegister.mockResolvedValue(true); // Assume register resolves successfully

        render(<RegisterPage />);
        const usernameInput = screen.getByLabelText(/Username/i);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
        const termsCheckbox = screen.getByLabelText(/I agree to the terms and privacy policy/i);
        const submitButton = screen.getByRole('button', { name: /Create Account/i });

        // Fill in the form fields and check the terms
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(termsCheckbox); // Check the terms checkbox
        fireEvent.click(submitButton); // Click the submit button

        // Wait specifically for the mockRegister function to have been called.
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledTimes(1);
        });

        // --- DIAGNOSTIC AID ---
        // Log the actual arguments received by the mock to the console *after* waiting for the call
        console.log("Actual calls to mockRegister:", mockRegister.mock.calls);
        // --- END DIAGNOSTIC AID ---

        // Now perform assertions about the arguments *after* the wait is complete
        // Expect it to be called with username, email, and password from the form values
        // Note: confirmPassword and terms are not passed to the register function in the component
        expect(mockRegister).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
        // Note: Testing the redirection after success is handled by the
        // 'redirects to homepage if already authenticated' test case below.
    });

    test('displays error message if registration fails', async () => {
        // Simulate a failed registration response by setting error state in the mock hook
        mockUseAuth.error = 'Email already exists'; // Set the error message exposed by the mock
        mockRegister.mockResolvedValue(false); // Or mockRegister could throw an error

        render(<RegisterPage />);
        const usernameInput = screen.getByLabelText(/Username/i);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
        const termsCheckbox = screen.getByLabelText(/I agree to the terms and privacy policy/i);
        const submitButton = screen.getByRole('button', { name: /Create Account/i });

        // Fill form (data that might cause an error) and submit
        fireEvent.change(usernameInput, { target: { value: 'failuser' } });
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password' } });
        fireEvent.click(termsCheckbox); // Check terms
        fireEvent.click(submitButton);

        // Wait specifically for the error message to appear.
        await waitFor(() => {
            expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
        });

        // Now perform other assertions outside the waitFor
        // Check register was attempted with the provided credentials
        expect(mockRegister).toHaveBeenCalledTimes(1);
        // We could add expect(mockRegister).toHaveBeenCalledWith(...) here too if desired,
        // but the focus of this test is the error message appearing after the attempt.
        expect(mockNavigate).not.toHaveBeenCalled(); // Ensure no navigation on failure
    });

    test('displays loading spinner and disables button when isLoading is true', () => {
        // Simulate loading state from the mock hook
        mockUseAuth.isLoading = true;
        render(<RegisterPage />);

        // Check if the circular progress indicator is displayed
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        // Check if the submit button is disabled
        expect(screen.getByRole('button', { name: /Create Account/i })).toBeDisabled();
    });

    test('redirects to homepage if already authenticated', () => {
        // Simulate being already authenticated from the mock hook
        mockUseAuth.isAuthenticated = true;
        render(<RegisterPage />);

        // Because isAuthenticated is true initially, the useEffect in RegisterPage should be triggered
        // and call the navigate function
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        // Expect it to navigate to the homepage with replace: true
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
        // Also, the form elements should not be rendered if already authenticated
        expect(screen.queryByLabelText(/Username/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/Email Address/i)).not.toBeInTheDocument();
    });

    test('renders link to Login page', () => {
        render(<RegisterPage />);
        // Find the link by its text content
        const loginLink = screen.getByRole('link', { name: /Already have an account\? Sign In/i });
        expect(loginLink).toBeInTheDocument();
        // Check that the link points to the correct path
        expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('displays validation error for terms if not accepted on submit', async () => {
        render(<RegisterPage />);
        const usernameInput = screen.getByLabelText(/Username/i);
        const emailInput = screen.getByLabelText(/Email Address/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
        const submitButton = screen.getByRole('button', { name: /Create Account/i });

        // Fill in all fields except checking the terms
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        // DO NOT click terms checkbox
        fireEvent.click(submitButton); // Submit the form

        // Wait for the validation error message to appear.
        await waitFor(() => {
            expect(screen.getByText('You must accept the terms and privacy policy')).toBeInTheDocument();
        });

        // Assertions after waiting
        expect(mockRegister).not.toHaveBeenCalled(); // Register should not be called due to validation error
    });
});