import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { DataGrid } from '@mui/x-data-grid';
import {
  Container,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Box,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { isAdmin } from '../utils/auth';

export default function Patients() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', uniqueCitizenIdentifier: '', dob: '' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    API.get('/patients')
      .then((r) => setList(r.data))
      .catch(() => {});
  }, []);

  const filteredList = list.filter(
    (patient) =>
      patient.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.uniqueCitizenIdentifier.trim()) newErrors.uniqueCitizenIdentifier = 'Citizen Identifier is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const reg = await API.post('/auth/register', {
        email: form.email,
        password: 'password123',
        role: 'patient',
        name: form.name
      });
      await API.post('/patients', { user: reg.data.id, uniqueCitizenIdentifier: form.uniqueCitizenIdentifier, dob: form.dob });
      toast.success('Patient created successfully!');
      setOpen(false);
      setForm({ name: '', email: '', uniqueCitizenIdentifier: '', dob: '' });
      setErrors({});
      window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create patient');
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Patients Management
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isAdmin() && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Add Patient
            </Button>
          )}
        </Box>

        <TextField
          label="Search by Name or Email"
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
                field: 'dob',
                headerName: 'Date of Birth',
                flex: 1,
                valueGetter: (value, row) =>
                  new Date(row.dob).toLocaleDateString('en-GB')
              },
              {
                field: 'uniqueCitizenIdentifier',
                headerName: 'Citizen ID',
                flex: 1,
                valueGetter: (value, row) => row.uniqueCitizenIdentifier
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
            Create Patient
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
              label="Citizen Identifier"
              value={form.uniqueCitizenIdentifier}
              onChange={(e) => setForm({ ...form, uniqueCitizenIdentifier: e.target.value })}
              fullWidth
              sx={{ mt: 1 }}
              error={!!errors.uniqueCitizenIdentifier}
              helperText={errors.uniqueCitizenIdentifier}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              fullWidth
              sx={{ mt: 1 }}
              InputLabelProps={{ shrink: true }}
              error={!!errors.dob}
              helperText={errors.dob}
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
