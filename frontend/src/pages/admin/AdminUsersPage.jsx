import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Alert, TablePagination,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const AdminUsersPage = () => {
    const { user } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);

        if (!user || user.role !== 'ADMIN') {
            setError('Unauthorized access.');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching users with params:', {
                page: page + 1,
                limit: rowsPerPage,
            });

            const response = await apiClient.get('/admin/users', {
                params: {
                    page: page + 1,
                    limit: rowsPerPage,
                },
            });

            console.log('API Response:', response.data);

            // Standardize response handling
            const usersData = Array.isArray(response.data.users) ? response.data.users :
                            Array.isArray(response.data.results) ? response.data.results :
                            Array.isArray(response.data) ? response.data : [];
            const total = Number.isInteger(response.data.total) ? response.data.total :
                         Number.isInteger(response.data.totalCount) ? response.data.totalCount :
                         usersData.length;

            console.log('Processed users:', usersData);
            console.log('Total users:', total);

            setUsers(usersData);
            setTotalUsers(total);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            if (err.response) {
                console.log('Error Response:', err.response.data);
                setError(`Failed to load users: ${err.response.data.message || 'Unknown error'}`);
            } else {
                setError('Failed to load users. Please try again.');
            }
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchUsers();
        } else if (!user) {
            setLoading(false);
            setError('Please log in to access this page.');
        }
    }, [user, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const openDeleteDialog = (userItem) => {
        setUserToDelete(userItem);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/admin/users/${userToDelete.id}`);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            console.error('Failed to delete user:', err);
            setError('Failed to delete user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const paperStyles = {
        p: 3,
        backgroundColor: (theme) => theme.palette.background.paper,
        boxShadow: 3,
        borderRadius: 2,
        mt: 4,
    };

    const tableHeaderCellStyles = {
        color: (theme) => theme.palette.text.secondary,
        fontWeight: 'bold',
    };

    const tableCellStyles = {};

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Users Management
            </Typography>

            <Paper sx={paperStyles}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                ) : Array.isArray(users) && users.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={tableHeaderCellStyles}>ID</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Username</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Email</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Role</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Orders</TableCell>
                                    <TableCell sx={tableHeaderCellStyles}>Joined</TableCell>
                                    <TableCell sx={tableHeaderCellStyles} align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((userItem) => (
                                    <TableRow key={userItem.id}>
                                        <TableCell sx={tableCellStyles}>{userItem.id.substring(0, 6)}...</TableCell>
                                        <TableCell sx={tableCellStyles}>{userItem.username}</TableCell>
                                        <TableCell sx={tableCellStyles}>{userItem.email}</TableCell>
                                        <TableCell sx={tableCellStyles}>{userItem.role}</TableCell>
                                        <TableCell sx={tableCellStyles}>{userItem.orders || 0}</TableCell>
                                        <TableCell sx={tableCellStyles}>
                                            {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell sx={tableCellStyles} align="center">
                                            {userItem.id !== user?.id && (
                                                <>
                                                    {userItem.role !== 'ADMIN' && (
                                                        <IconButton
                                                            aria-label="delete"
                                                            size="small"
                                                            onClick={() => openDeleteDialog(userItem)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </>
                                            )}
                                            {userItem.id === user?.id && (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    Current Admin
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">No users found.</Typography>
                    </Box>
                )}

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={totalUsers}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ color: (theme) => theme.palette.text.secondary }}
                />
            </Paper>

            <Dialog
                open={deleteDialogOpen}
                onClose={closeDeleteDialog}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
                PaperProps={{
                    sx: {
                        backgroundColor: (theme) => theme.palette.background.paper,
                        color: (theme) => theme.palette.text.primary,
                        boxShadow: 3,
                        borderRadius: 2,
                    }
                }}
            >
                <DialogTitle id="delete-dialog-title" sx={{ color: (theme) => theme.palette.text.primary }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1" color="text.secondary">
                        Are you sure you want to delete user: <strong>{userToDelete?.username}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} color="error" variant="contained" autoFocus disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminUsersPage;