import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Link
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      toast.success(res.data.message);
    } catch (e) {
      toast.error('Error sending reset request');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, boxShadow: 2, bgcolor: 'white' }}>
          <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: 'primary.main', fontWeight: 600 }}>
            Forgot Password
          </Typography>
          <Typography sx={{ mb: 3, textAlign: 'center' }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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