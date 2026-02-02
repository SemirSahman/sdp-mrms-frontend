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
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Grid,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import LoadingButton from '../components/LoadingButton';

export default function Doctors() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', specialization: '' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const handleEdit = (doctor) => {
    setEditMode(true);
    setEditId(doctor._id);
    setForm({
      name: doctor.user?.name || '',
      email: doctor.user?.email || '',
      specialization: doctor.specialization || ''
    });
    setOpen(true);
  };

  const handleCreate = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.specialization.trim())
      newErrors.specialization = 'Specialization is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitting(true);
      if (editMode) {
        await API.put(`/doctors/${editId}`, {
          name: form.name,
          email: form.email,
          specialization: form.specialization
        });
        toast.success('Doctor updated successfully!');
      } else {
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
      }
      setOpen(false);
      setForm({ name: '', email: '', specialization: '' });
      setErrors({});
      setEditMode(false);
      setEditId(null);
      window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.error || `Failed to ${editMode ? 'update' : 'create'} doctor`);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1.5 } }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Doctors Management
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setForm({ name: '', email: '', specialization: '' });
              setErrors({});
              setEditMode(false);
              setEditId(null);
              setOpen(true);
            }}
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

        <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white' }}>
          {isMobile ? (
            // Mobile: Card Layout
            <Grid container spacing={2} direction="column" alignItems="center">
              {filteredList.map((doctor) => (
                <Grid item xs={12} key={doctor._id} sx={{ width: '100%', maxWidth: '600px' }}>
                  <Card sx={{ boxShadow: 1, border: '1px solid #e0e0e0', width: '100%' }}>
                    <CardHeader
                      title={doctor.user?.name || 'N/A'}
                      action={
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(doctor)}
                          sx={{ color: 'white' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        height: '50px',
                        '& .MuiCardHeader-title': {
                          fontSize: '1.1rem',
                          fontWeight: 600
                        },
                        '& .MuiCardHeader-content': {
                          overflow: 'hidden'
                        }
                      }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <strong style={{ minWidth: '130px', display: 'inline-block' }}>Email:</strong> {doctor.user?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                        <strong style={{ minWidth: '130px', display: 'inline-block' }}>Specialization:</strong> {doctor.specialization || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                        Created: {new Date(doctor.createdAt).toLocaleDateString('en-GB')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredList.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No doctors found
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            // Desktop: DataGrid
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
                },
                {
                  field: 'actions',
                  headerName: '',
                  flex: 1,
                  sortable: false,
                  filterable: false,
                  renderCell: (params) => (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(params.row)}
                    >
                      Edit
                    </Button>
                  )
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
          )}
        </Paper>

        {/* IMPROVED DIALOG */}
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '1.3rem',
            py: 1.5
          }}>
            {editMode ? '✏️ Edit Doctor' : '➕ Add New Doctor'}
            <IconButton 
              onClick={() => { setOpen(false); setEditMode(false); setEditId(null); }} 
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {/* Personal Information Section */}
            <Box sx={{ mb: 3, pt: 2 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: 'primary.main',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                👤 Personal Information
              </Typography>
              <Box sx={{ 
                bgcolor: '#f8f9fa', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <TextField
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="Dr. John Smith"
                  size="small"
                  sx={{ mb: 1.5, bgcolor: 'white' }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="doctor@example.com"
                  size="small"
                  sx={{ bgcolor: 'white' }}
                />
              </Box>
            </Box>
            
            {/* Professional Information Section */}
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: 'primary.main',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                🏥 Professional Information
              </Typography>
              <Box sx={{ 
                bgcolor: '#f8f9fa', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <TextField
                  label="Specialization"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  fullWidth
                  error={!!errors.specialization}
                  helperText={errors.specialization}
                  placeholder="e.g., Cardiology, Pediatrics"
                  size="small"
                  sx={{ bgcolor: 'white' }}
                />
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 1.5, 
            borderTop: '1px solid #e0e0e0',
            gap: 1,
            justifyContent: 'flex-end'
          }}>
            <Button 
              onClick={() => { setOpen(false); setEditMode(false); setEditId(null); }}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <LoadingButton 
              variant="contained" 
              color="primary" 
              onClick={handleCreate}
              loading={submitting}
              sx={{ 
                px: 4,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {editMode ? 'Update Doctor' : 'Create Doctor'}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
