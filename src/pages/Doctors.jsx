import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
export default function Doctors() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', specialization: '' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    API.get('/doctors')
      .then((r) => setList(r.data))
      .catch(() => {});
  }, []);

  const filteredList = list.filter(
    (doctor) =>
      doctor.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCreate = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.specialization.trim())
      newErrors.specialization = 'Specialization is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const reg = await API.post('/auth/register', {
        email: form.email,
        password: 'password123',
        role: 'doctor',
        name: form.name
      });
      await API.post('/doctors', {
        user: reg.data.id,
        specialization: form.specialization,
        contact: ''
      });
      toast.success('Doctor created successfully!');
      setOpen(false);
      setForm({ name: '', email: '', specialization: '' });
      setErrors({});
      window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create doctor');
    }
  };
  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Doctors Management
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
          >
            Add Doctor
          </Button>
        </Box>

        <TextField
          label="Search by Name, Email, or Specialization"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              '& fieldset': {
                borderColor: 'primary.main',
              },
              '&:hover fieldset': {
                borderColor: 'primary.dark',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        <Paper sx={{ p: 3, boxShadow: 2, bgcolor: 'white' }}>
          <DataGrid
            rows={filteredList}
            columns={[
              {
                field: 'name',
                headerName: 'Name',
                flex: 1,
                valueGetter: (value, row) => `${row.user?.name || ''}`
              },
              {
                field: 'email',
                headerName: 'Email',
                flex: 1,
                valueGetter: (value, row) => `${row.user?.email || ''}`
              },
              {
                field: 'specialization',
                headerName: 'Specialization',
                flex: 1
              },
              {
                field: 'createdAt',
                headerName: 'Created',
                flex: 1,
                valueGetter: (value, row) =>
                  new Date(row.createdAt).toLocaleDateString('en-GB')
              }
            ]}
            getRowId={(row) => row._id}
            autoHeight
            pageSizeOptions={[5, 10]}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#e3f2fd',
                fontWeight: 'bold'
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                color: 'primary.main',
                fontWeight: 'bold'
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0'
              },
              '& .MuiDataGrid-root': {
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          />
        </Paper>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Create Doctor
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <TextField
              label="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              label="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Specialization"
              value={form.specialization}
              onChange={(e) =>
                setForm({ ...form, specialization: e.target.value })
              }
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.specialization}
              helperText={errors.specialization}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}>
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
