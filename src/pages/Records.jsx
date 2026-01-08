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
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { fetchRecords, createRecord } from '../api/records';
import { fetchPatients } from '../api/patients';
import { isDoctor, isAdmin } from '../utils/auth';
import { getBaseUrl } from '../api/client';

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

  const submit = async () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim())
      newErrors.description = 'Description is required';
    if (!form.patient) newErrors.patient = 'Patient is required';
    if (!form.file) newErrors.file = 'File is required';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    try {
      await createRecord(fd);
      toast.success('Record created successfully!');
      setOpen(false);
      setForm({ title: '', description: '', patient: '', file: null });
      setErrors({});
      const res = await fetchRecords();
      setRows(res.data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create record');
    }
  };

  return (
    <>
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
            Medical Records
          </Typography>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {(isDoctor() || isAdmin()) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Add Record
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
        </Container>
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          New Medical Record
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="Title"
            margin="dense"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            fullWidth
            label="Description"
            margin="dense"
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            error={!!errors.description}
            helperText={errors.description}
          />
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
                label="Patient"
                margin="dense"
                error={!!errors.patient}
                helperText={errors.patient}
              />
            )}
            sx={{ mt: 1 }}
          />
          <input
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            style={{ marginTop: 16, marginBottom: 16 }}
          />
          {errors.file && (
            <Typography color="error" variant="body2">
              {errors.file}
            </Typography>
          )}
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            onClick={submit}
          >
            Save
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
