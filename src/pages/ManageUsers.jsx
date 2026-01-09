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
  Chip,
  Card,
  CardContent,
  Grid,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const getRoleColor = (role) => {
    if (role === 'admin') return 'error';
    if (role === 'doctor') return 'primary';
    return 'default';
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1.5 } }}>
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

        <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white' }}>
          {isMobile ? (
            // Mobile: Card Layout
            <Grid container spacing={2} direction="column" alignItems="center">
              {filteredUsers.map((user) => (
                <Grid item xs={12} key={user._id} sx={{ width: '100%' }}>
                  <Card sx={{ boxShadow: 1, border: '1px solid #e0e0e0', width: '100%' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {user.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Email:</strong> {user.email || 'N/A'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={user.role}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                        <Chip
                          label={user.active ? 'Active' : 'Inactive'}
                          color={user.active ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/users/${user._id}`)}
                      >
                        Edit
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {filteredUsers.length === 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No users found
                  </Typography>
                </Grid>
              )}
            </Grid>
          ) : (
            // Desktop: DataGrid
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
          )}
        </Paper>
      </Container>
    </Box>
  );
}