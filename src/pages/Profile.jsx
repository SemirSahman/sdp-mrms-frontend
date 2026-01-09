import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Card,
  CardContent,
  useMediaQuery
} from '@mui/material';
import { AccountCircle, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Email as EmailIcon, Person as PersonIcon, WorkOutline as WorkIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import API from '../api/client';
import { getName, getRole } from '../utils/auth';
import toast from 'react-hot-toast';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // For now, we'll use the stored info, but ideally fetch from backend
      setUser({
        name: getName(),
        role: getRole(),
        email: '' // We don't store email, but could fetch
      });
      setForm({
        name: getName(),
        email: ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // In a real app, you'd call an API to update the profile
      // For now, just update localStorage
      localStorage.setItem('name', form.name);
      setUser({ ...user, name: form.name });
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name, email: user.email });
    setEditing(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Container maxWidth="md">
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              My Profile
            </Typography>
          </Grid>

          {/* Profile Card */}
          <Grid item xs={12} sx={{ width: '100%' }}>
            {isMobile ? (
              // Mobile: Stacked layout with centered content
              <Card sx={{ boxShadow: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                  {/* Avatar Section */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 2,
                        bgcolor: 'primary.main',
                        boxShadow: 2
                      }}
                    >
                      <AccountCircle sx={{ fontSize: 60 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {user.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        textTransform: 'capitalize',
                        color: 'primary.main',
                        fontWeight: 500,
                        bgcolor: 'primary.light',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        display: 'inline-block',
                        mb: 2
                      }}
                    >
                      {user.role}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'left', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Member since 2024
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Active Status
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Information Section */}
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Personal Information
                      </Typography>
                      {!editing && (
                        <Button
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setEditing(true)}
                          size="small"
                        >
                          Edit
                        </Button>
                      )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                          FULL NAME
                        </Typography>
                        <TextField
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          disabled={!editing}
                          fullWidth
                          variant={editing ? 'outlined' : 'standard'}
                          size="small"
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                          EMAIL ADDRESS
                        </Typography>
                        <TextField
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          disabled={!editing}
                          fullWidth
                          type="email"
                          variant={editing ? 'outlined' : 'standard'}
                          placeholder="email@example.com"
                          size="small"
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                          ROLE
                        </Typography>
                        <TextField
                          value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          disabled
                          fullWidth
                          variant="standard"
                          size="small"
                          InputProps={{
                            startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                          }}
                        />
                      </Box>

                      {editing && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<CancelIcon />}
                            onClick={handleCancel}
                            fullWidth
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            fullWidth
                          >
                            Save Changes
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              // Desktop: Side-by-side layout
              <Card sx={{ boxShadow: 2 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'flex-start', width: '100%' }}>
                    {/* Avatar Section */}
                    <Box sx={{ textAlign: 'center', flexShrink: 0, width: 'auto' }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          mb: 2,
                          bgcolor: 'primary.main',
                          boxShadow: 2
                        }}
                      >
                        <AccountCircle sx={{ fontSize: 70 }} />
                      </Avatar>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {user.name}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          textTransform: 'capitalize',
                          color: 'primary.main',
                          fontWeight: 500,
                          bgcolor: 'primary.light',
                          px: 2,
                          py: 0.5,
                          borderRadius: 2,
                          display: 'inline-block',
                          mb: 2
                        }}
                      >
                        {user.role}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ textAlign: 'left' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Member since 2024
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Active Status
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Information Section */}
                    <Box sx={{ flex: 1, width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          Personal Information
                        </Typography>
                        {!editing && (
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditing(true)}
                            sx={{ minWidth: '170px' }}
                          >
                            Edit Profile
                          </Button>
                        )}
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                            FULL NAME
                          </Typography>
                          <TextField
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            disabled={!editing}
                            fullWidth
                            variant={editing ? 'outlined' : 'standard'}
                            InputProps={{
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                            EMAIL ADDRESS
                          </Typography>
                          <TextField
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            disabled={!editing}
                            fullWidth
                            type="email"
                            variant={editing ? 'outlined' : 'standard'}
                            placeholder="email@example.com"
                            InputProps={{
                              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
                            ROLE
                          </Typography>
                          <TextField
                            value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            disabled
                            fullWidth
                            variant="standard"
                            InputProps={{
                              startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                          />
                        </Box>

                        {editing && (
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<CancelIcon />}
                              onClick={handleCancel}
                              fullWidth={isMobile}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<SaveIcon />}
                              onClick={handleSave}
                              fullWidth={isMobile}
                            >
                              Save Changes
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}