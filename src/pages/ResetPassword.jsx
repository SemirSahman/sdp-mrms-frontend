import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Link
} from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await API.post('/auth/reset-password', { token, newPassword });
      toast.success(res.data.message);
      // Redirect to login
      window.location.href = '/login';
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error resetting password');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, boxShadow: 2, bgcolor: 'white' }}>
            <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
              Invalid Reset Link
            </Typography>
            <Typography sx={{ textAlign: 'center' }}>
              The reset link is invalid or expired.
            </Typography>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/forgot-password">
                Request New Reset Link
              </Link>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, boxShadow: 2, bgcolor: 'white' }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
            Reset Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              Back to Login
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}