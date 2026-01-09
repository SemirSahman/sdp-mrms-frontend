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
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Grid,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon, Edit as EditIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { isAdmin } from '../utils/auth';
import { useTheme } from '@mui/material/styles';


export default function Patients() {
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', uniqueCitizenIdentifier: '', dob: '' });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleEdit = (patient) => {
    setEditMode(true);
    setEditId(patient._id);
    setForm({
      name: patient.user?.name || '',
      email: patient.user?.email || '',
      uniqueCitizenIdentifier: patient.uniqueCitizenIdentifier || '',
      dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : ''
    });
    setOpen(true);
  };

  const handleCreate = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.uniqueCitizenIdentifier.trim()) newErrors.uniqueCitizenIdentifier = 'Citizen Identifier is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editMode) {
        await API.put(`/patients/${editId}`, {
          uniqueCitizenIdentifier: form.uniqueCitizenIdentifier,
          dob: form.dob
        });
        toast.success('Patient updated successfully!');
      } else {
        const reg = await API.post('/auth/register', {
          email: form.email,
          password: 'password123',
          role: 'patient',
          name: form.name
        });
        await API.post('/patients', { user: reg.data.id, uniqueCitizenIdentifier: form.uniqueCitizenIdentifier, dob: form.dob });
        toast.success('Patient created successfully!');
      }
      setOpen(false);
      setForm({ name: '', email: '', uniqueCitizenIdentifier: '', dob: '' });
      setErrors({});
      setEditMode(false);
      setEditId(null);
      window.location.reload();
    } catch (e) {
      toast.error(e.response?.data?.error || `Failed to ${editMode ? 'update' : 'create'} patient`);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1.5 } }}>
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

        <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white' }}>
          {isMobile ? (
            // Mobile: Card Layout
            <Grid container spacing={2} direction="column" alignItems="center">
              {filteredList.map((patient) => (
                <Grid item xs={12} key={patient._id} sx={{ width: '100%', maxWidth: '600px' }}>
                  <Card sx={{ boxShadow: 1, border: '1px solid #e0e0e0', width: '100%' }}>
                    <CardHeader
                      title={patient.user?.name || 'N/A'}
                      action={
                        isAdmin() && (
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(patient)}
                            sx={{ color: 'white' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )
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
                        <strong style={{ minWidth: '100px', display: 'inline-block' }}>Email:</strong> {patient.user?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <strong style={{ minWidth: '100px', display: 'inline-block' }}>DOB:</strong> {new Date(patient.dob).toLocaleDateString('en-GB')}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                        <strong style={{ minWidth: '100px', display: 'inline-block' }}>Citizen ID:</strong> {patient.uniqueCitizenIdentifier || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                        Created: {new Date(patient.createdAt).toLocaleDateString('en-GB')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredList.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No patients found
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            // Desktop: DataGrid
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
                  minWidth: { xs: 720, sm: '100%' },
                  fontSize: { xs: 12, sm: 14 },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold'
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                    fontSize: { xs: 12, sm: 14 }
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f5f5f5'
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                    fontSize: { xs: 12, sm: 14 }
                  },
                  '& .MuiDataGrid-root': {
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              />
            </Box>
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
            py: 2.5
          }}>
            {editMode ? '✏️ Edit Patient' : '➕ Add New Patient'}
            <IconButton 
              onClick={() => { setOpen(false); setEditMode(false); setEditId(null); }} 
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            {/* Personal Information Section */}
            <Box sx={{ mb: 3 }}>
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
                  placeholder="John Doe"
                  size="small"
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email}
                  placeholder="john@example.com"
                  size="small"
                />
              </Box>
            </Box>
            
            {/* Medical Information Section */}
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
                ⚕️ Medical Information
              </Typography>
              <Box sx={{ 
                bgcolor: '#f8f9fa', 
                p: 2, 
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <TextField
                  label="Citizen ID"
                  value={form.uniqueCitizenIdentifier}
                  onChange={(e) => setForm({ ...form, uniqueCitizenIdentifier: e.target.value })}
                  fullWidth
                  error={!!errors.uniqueCitizenIdentifier}
                  helperText={errors.uniqueCitizenIdentifier}
                  placeholder="1234567890"
                  size="small"
                  sx={{ mb: 1.5 }}
                />
                <TextField
                  label="Date of Birth"
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dob}
                  helperText={errors.dob}
                  size="small"
                />
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            p: 2.5, 
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
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCreate}
              sx={{ 
                px: 4,
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              {editMode ? 'Update Patient' : 'Create Patient'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
