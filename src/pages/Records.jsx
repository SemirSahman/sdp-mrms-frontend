import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Autocomplete,
  Typography,
  InputAdornment,
  Container,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Grid,
  useMediaQuery,
  Paper,
  DialogActions
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, Close as CloseIcon, Edit as EditIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { fetchRecords, createRecord } from '../api/records';
import { fetchPatients } from '../api/patients';
import { isDoctor, isAdmin } from '../utils/auth';
import { getBaseUrl } from '../api/client';
import { useTheme } from '@mui/material/styles';

export default function Records() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    patient: '',
    file: null
  });
  const [patients, setPatients] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchRecords().then((res) => setRows(res.data));
    if (isAdmin() || isDoctor()) {
      fetchPatients().then((res) => setPatients(res.data));
    }
  }, []);

  const filteredRows = rows.filter(
    (row) =>
      row.patient?.user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (record) => {
    setEditMode(true);
    setEditId(record._id);
    setForm({
      title: record.title || '',
      description: record.description || '',
      patient: record.patient?._id || '',
      file: null
    });
    setOpen(true);
  };

  const submit = async () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim())
      newErrors.description = 'Description is required';
    if (!form.patient) newErrors.patient = 'Patient is required';
    if (!editMode && !form.file) newErrors.file = 'File is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      if (editMode) {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('patient', form.patient);
        if (form.file) fd.append('file', form.file);
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4001/api'}/records/${editId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: fd
        });
        toast.success('Record updated successfully!');
      } else {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('patient', form.patient);
        fd.append('file', form.file);
        await createRecord(fd);
        toast.success('Record created successfully!');
      }
      setOpen(false);
      setForm({ title: '', description: '', patient: '', file: null });
      setErrors({});
      setEditMode(false);
      setEditId(null);
      fetchRecords().then((res) => setRows(res.data));
    } catch (e) {
      toast.error(e.message || `Failed to ${editMode ? 'update' : 'create'} record`);
    }
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1.5 } }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            Medical Records
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {(isAdmin() || isDoctor()) && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpen(true)}
              >
                New Record
              </Button>
            )}
          </Box>

          <TextField
            label="Search by Patient Name, Title, or Description"
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
                {filteredRows.map((record) => (
                  <Grid item xs={12} key={record._id} sx={{ width: '100%', maxWidth: '600px' }}>
                    <Card sx={{ boxShadow: 1, border: '1px solid #e0e0e0', width: '100%' }}>
                      <CardHeader
                        title={record.title || 'N/A'}
                        action={
                          (isAdmin() || isDoctor()) && (
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(record)}
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
                          <strong style={{ minWidth: '100px', display: 'inline-block' }}>Patient:</strong> {record.patient?.user?.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, display: 'flex' }}>
                          <strong style={{ minWidth: '100px', display: 'inline-block', flexShrink: 0 }}>Description:</strong>
                          <span style={{ flex: 1 }}>{record.description || 'N/A'}</span>
                        </Typography>
                        {record.fileUrl && (
                          <Typography variant="body2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                            <strong style={{ minWidth: '100px', display: 'inline-block' }}>File:</strong>
                            <a
                              href={`${getBaseUrl()}${record.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#0E2239', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                              📄 {record.fileUrl.split('/').pop()}
                            </a>
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                          Created: {new Date(record.createdAt).toLocaleDateString('en-GB')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                {filteredRows.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No records found
                    </Typography>
                  </Grid>
                )}
              </Grid>
            ) : (
              // Desktop: DataGrid
              <DataGrid
                rows={filteredRows}
                getRowId={(r) => r._id}
                autoHeight
                columns={[
                  {
                    field: 'patientName',
                    headerName: 'Patient Name',
                    flex: 1,
                    renderCell: (params) => params.row.patient?.user?.name || 'N/A'
                  },
                  { field: 'title', headerName: 'Title', flex: 1 },
                  { field: 'description', headerName: 'Description', flex: 2 },
                  {
                    field: 'fileUrl',
                    headerName: 'File',
                    renderCell: (p) =>
                      p.value ? (
                        <a
                          href={`${getBaseUrl()}${p.value}`}
                          target="_blank"
                          style={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
                        >
                          {p.value.split('/').pop()}
                        </a>
                      ) : (
                        '—'
                      )
                  }
                ]}
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
        </Container>
      </Box>

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
          {editMode ? '✏️ Edit Medical Record' : '📋 New Medical Record'}
          <IconButton 
            onClick={() => { setOpen(false); setEditMode(false); setEditId(null); }} 
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {/* Record Details Section */}
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
              📝 Record Details
            </Typography>
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <TextField
                fullWidth
                label="Record Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                error={!!errors.title}
                helperText={errors.title}
                placeholder="e.g., Lab Results, X-Ray"
                size="small"
                sx={{ mb: 1.5 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="Detailed description of the record..."
                size="small"
              />
            </Box>
          </Box>

          {/* Patient & File Section */}
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
              👥 Patient & Document
            </Typography>
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid #e0e0e0'
            }}>
              <Autocomplete
                fullWidth
                options={patients}
                getOptionLabel={(option) =>
                  `${option.user?.name || ''} (${option.user?.email || ''})`
                }
                value={patients.find((p) => p._id === form.patient) || null}
                onChange={(event, newValue) =>
                  setForm({ ...form, patient: newValue?._id || '' })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    error={!!errors.patient}
                    helperText={errors.patient}
                    size="small"
                  />
                )}
                sx={{ mb: 2 }}
              />
              
              {/* File Upload */}
              <Box sx={{ 
                border: '2px dashed #d0d0d0',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                bgcolor: '#fafafa',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: '#f0f7ff'
                }
              }}>
                <input
                  type="file"
                  onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <CloudUploadIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {form.file ? form.file.name : 'Click to upload or drag file'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {editMode ? '(Optional for edit)' : '(Required)'}
                  </Typography>
                </label>
              </Box>

              {errors.file && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {errors.file}
                </Typography>
              )}

              {editMode && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Leave empty to keep existing file
                </Typography>
              )}
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
            onClick={submit}
            sx={{ 
              px: 4,
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            {editMode ? 'Update Record' : 'Create Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
