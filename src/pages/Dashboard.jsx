import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Card, CardContent, Chip, Divider, useMediaQuery } from '@mui/material';
import { BarChart, PieChart, LineChart } from '@mui/x-charts';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import API from '../api/client';
import { isAdmin, isDoctor, isPatient } from '../utils/auth';
import { People as PeopleIcon, LocalHospital as HospitalIcon, Assignment as AssignmentIcon, Event as EventIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
  <Card sx={{ boxShadow: 3, height: '100%', width: '100%', bgcolor: (theme) => theme.palette.custom.cardBackground }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', gap: 2, py: 3 }}>
      {Icon && (
        <Box sx={{ bgcolor: `${color}.main`, p: 2, borderRadius: 2 }}>
          <Icon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      )}
      <Box sx={{ width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, color: `${color}.main` }}>
          {value}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isAdmin()) {
      API.get('/dashboard').then((res) => setData(res.data));
    } else {
      // For doctors and patients, fetch their appointments and records
      API.get('/appointments/my').then((res) => setAppointments(res.data));
      API.get('/records').then((res) => setRecords(res.data));
    }
  }, []);

  const upcomingAppointments = appointments.filter(a => new Date(a.slot) > new Date() && a.status !== 'cancelled');
  const recentRecords = records.slice(0, 5);

  if (isAdmin() && !data) return <Typography>Loading...</Typography>;
  if (!isAdmin() && !appointments) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: (theme) => theme.palette.custom.pageBackground, minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
          {isAdmin() ? 'System Overview' : isDoctor() ? 'Doctor Dashboard' : 'Patient Dashboard'}
        </Typography>

        {isAdmin() && data && (
          <>
            {/* KPI CARDS */}
            <Grid container spacing={isMobile ? 1.5 : 3} sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex', width: { xs: '48%', sm: '48%', md: '23%' } }}>
                <Box sx={{ width: '100%' }}>
                  <StatCard title="Total Doctors" value={data.doctors} icon={HospitalIcon} color="primary" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex', width: { xs: '48%', sm: '48%', md: '23%' } }}>
                <Box sx={{ width: '100%' }}>
                  <StatCard title="Total Patients" value={data.patients} icon={PeopleIcon} color="secondary" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex', width: { xs: '48%', sm: '48%', md: '23%' } }}>
                <Box sx={{ width: '100%' }}>
                  <StatCard title="Medical Records" value={data.records} icon={AssignmentIcon} color="primary" />
                </Box>
              </Grid>
              <Grid item xs={6} sm={6} md={3} sx={{ display: 'flex', width: { xs: '48%', sm: '48%', md: '23%' } }}>
                <Box sx={{ width: '100%' }}>
                  <StatCard title="Appointments" value={data.appointments} icon={EventIcon} color="secondary" />
                </Box>
              </Grid>
            </Grid>

            {/* CHARTS */}
            <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, width: '100%', height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1.5, fontSize: { xs: 13, sm: 16 } }}>
                    Appointments per Month
                  </Typography>
                  <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <div style={{ minWidth: isMobile ? '150%' : '100%', maxWidth: '100%' }}>
                      <BarChart
                        xAxis={[
                          {
                            scaleType: 'band',
                            data: data.appointmentsPerMonth.map((m) => m.month)
                          }
                        ]}
                        series={[
                          { data: data.appointmentsPerMonth.map((m) => m.value) }
                        ]}
                        height={280}
                        margin={{ left: 35, right: 5, top: 5, bottom: 25 }}
                      />
                    </div>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, width: '100%', height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1.5, fontSize: { xs: 13, sm: 16 } }}>
                    Records by Type
                  </Typography>
                  <Box sx={{ overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ minWidth: '100%', maxWidth: '100%' }}>
                      <PieChart
                        series={[
                          {
                            data: data.recordsByType
                          }
                        ]}
                        height={280}
                      />
                    </div>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* System Growth Chart */}
            <Grid container spacing={isMobile ? 1 : 3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, width: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1.5, fontSize: { xs: 13, sm: 16 } }}>
                    System Growth
                  </Typography>
                  <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <div style={{ minWidth: isMobile ? '150%' : '100%', maxWidth: '100%' }}>
                      <LineChart
                        xAxis={[{ data: ['Jan', 'Feb', 'Mar'] }]}
                        series={[{ data: [5, 9, 15] }]}
                        height={280}
                        margin={{ left: 35, right: 5, top: 5, bottom: 25 }}
                      />
                    </div>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Quick Actions for Admin */}
            <Grid container spacing={isMobile ? 1 : 3}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: 13, sm: 16 } }}>
                    Manage Users
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, fontSize: { xs: 12, sm: 14 } }}>
                    Add, edit, or deactivate user accounts.
                  </Typography>
                  <Button variant="contained" component={Link} to="/manage-users" fullWidth size="small">
                    Manage Users
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: 13, sm: 16 } }}>
                    View Patients
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, fontSize: { xs: 12, sm: 14 } }}>
                    See all patient records and details.
                  </Typography>
                  <Button variant="outlined" component={Link} to="/patients" fullWidth size="small">
                    View Patients
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, boxShadow: 2, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: 13, sm: 16 } }}>
                    System Reports
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5, fontSize: { xs: 12, sm: 14 } }}>
                    Generate and view system reports.
                  </Typography>
                  <Button variant="outlined" disabled fullWidth size="small">
                    Coming Soon
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}

        {(isDoctor() || isPatient()) && (
          <>
            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                <Card sx={{ width: '100%', boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6" color="primary.main">Appointments</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{appointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Scheduled</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                <Card sx={{ width: '100%', boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 30, color: 'secondary.main', mr: 1 }} />
                      <Typography variant="h6" color="secondary.main">Upcoming</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{upcomingAppointments.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Future Appointments</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={12} sx={{ display: 'flex' }}>
                <Card sx={{ width: '100%', boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <AssignmentIcon sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                      <Typography variant="h6" color="primary.main">Records</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{records.length}</Typography>
                    <Typography variant="body2" color="text.secondary">Medical Records</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Upcoming Appointments */}
            <Paper sx={{ p: 3, boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} />
                Upcoming Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {upcomingAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No upcoming appointments.</Typography>
                </Box>
              ) : (
                <List>
                  {upcomingAppointments.slice(0, 5).map((a) => (
                    <ListItem 
                      key={a._id} 
                      sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 500 }}>
                            {a.date ? `${a.date.split('-').reverse().join('/')} at ${a.hour}:00` : new Date(a.slot).toLocaleDateString('en-GB')} - {isDoctor() ? `Patient: ${a.patient?.user?.name || 'Unknown'}` : `Dr. ${a.doctor?.user?.name || 'Unknown'}`}
                          </Typography>
                        }
                        secondary={
                          <Chip 
                            label={a.status} 
                            size="small" 
                            color={a.status === 'confirmed' ? 'success' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              {upcomingAppointments.length > 5 && (
                <Typography variant="body2" color="text.secondary">
                  And {upcomingAppointments.length - 5} more...
                </Typography>
              )}
            </Paper>

            {/* Recent Records */}
            <Paper sx={{ p: 3, boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground, mb: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} />
                Recent Medical Records
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {recentRecords.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary">No recent records.</Typography>
                </Box>
              ) : (
                <List>
                  {recentRecords.map((r) => (
                    <ListItem 
                      key={r._id} 
                      sx={{ 
                        borderBottom: '1px solid #e0e0e0',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' },
                        borderRadius: 1,
                        mb: 1
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 500 }}>
                            {r.title} - {new Date(r.createdAt).toLocaleDateString('en-GB')}
                          </Typography>
                        }
                        secondary={`Patient: ${r.patient?.user?.name || 'Unknown'} | Doctor: ${r.doctor?.user?.name || 'Unknown'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>

            {/* Quick Actions */}
            <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={3}>
              {isPatient() && (
                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                    <CardContent>
                      <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                        Book New Appointment
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Schedule an appointment with one of our doctors.
                      </Typography>
                      <Button variant="contained" fullWidth component={Link} to="/appointments">
                        Book Appointment
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                  <CardContent>
                    <EventIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      View All Appointments
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      See all your appointments and manage them.
                    </Typography>
                    <Button variant="outlined" fullWidth component={Link} to="/appointments">
                      View Appointments
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ boxShadow: 3, bgcolor: (theme) => theme.palette.custom.cardBackground, height: '100%' }}>
                  <CardContent>
                    <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Medical Records
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Access your medical history and records.
                    </Typography>
                    <Button variant="outlined" fullWidth component={Link} to="/records">
                      View Records
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
}
