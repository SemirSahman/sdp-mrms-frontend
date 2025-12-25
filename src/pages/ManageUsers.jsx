import React, { useEffect, useState } from 'react';
import API from '../api/client';
import { DataGrid } from '@mui/x-data-grid';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/users').then((res) => {
      setUsers(res.data);
      setFilteredUsers(res.data);
    });
  }, []);

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: (value, row) => row.name || 'N/A'
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'admin' ? 'error' : params.value === 'doctor' ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/users/${params.row._id}`)}
        >
          Edit
        </Button>
      )
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Manage Users
        </Typography>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search by Name or Email"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Filter by Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All Roles</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="doctor">Doctor</MenuItem>
            <MenuItem value="patient">Patient</MenuItem>
          </TextField>
        </Box>

        <Paper sx={{ p: 3, boxShadow: 2, bgcolor: 'white' }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            getRowId={(row) => row._id}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
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
      </Container>
    </Box>
  );
}