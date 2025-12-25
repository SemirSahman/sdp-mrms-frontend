import React, { useEffect, useState } from 'react';
import API from '../api/client';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: '', active: true });
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    API.get(`/users/${id}`).then((res) => {
      setUser(res.data);
      setForm({
        name: res.data.name || '',
        email: res.data.email,
        role: res.data.role,
        active: res.data.active
      });
    });
  }, [id]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await API.put(`/users/${id}`, form);
      setUser(res.data);
      toast.success('User updated successfully');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update user');
    }
    setLoading(false);
  };

  const handleToggleActive = async () => {
    try {
      const res = await API.patch(`/users/${id}/toggle-active`);
      setUser({ ...user, active: res.data.active });
      setForm({ ...form, active: res.data.active });
      toast.success(`User ${res.data.active ? 'activated' : 'deactivated'}`);
      setConfirmOpen(false);
    } catch (e) {
      toast.error('Failed to toggle user status');
    }
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          User Details
        </Typography>

        <Paper sx={{ p: 3, boxShadow: 2, bgcolor: 'white' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Edit User Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="patient">Patient</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setConfirmOpen(true)}
            >
              {form.active ? 'Deactivate' : 'Activate'} User
            </Button>
            <Button variant="outlined" onClick={() => navigate('/manage-users')}>
              Back to Users
            </Button>
          </Box>

          <Alert severity="info">
            Created: {new Date(user.createdAt).toLocaleDateString('en-GB')}
          </Alert>
        </Paper>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Confirm Action
            <IconButton onClick={() => setConfirmOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {form.active ? 'deactivate' : 'activate'} this user?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleToggleActive} color="error">
              {form.active ? 'Deactivate' : 'Activate'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}