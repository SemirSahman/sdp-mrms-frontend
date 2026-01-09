import React, { useEffect, useState } from 'react';
import API from '../api/client';
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardHeader,
  useMediaQuery
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
export default function Appointments() {
  const [list, setList] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [slot, setSlot] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  useEffect(() => {
    API.get('/appointments/my')
      .then((r) =>
        setList(
          [...r.data].sort(
            (a, b) => new Date(b.slot).getTime() - new Date(a.slot).getTime()
          )
        )
      )
      .catch(() => {});
    API.get('/doctors')
      .then((r) => setDoctors(r.data))
      .catch(() => {});
  }, []);

  const fetchAvailableTimes = async () => {
    if (!doctorId || !selectedDate) return;
    try {
      const res = await API.get('/appointments/available', {
        params: { doctorId, date: selectedDate.format('YYYY-MM-DD') }
      });
      setAvailableTimes(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAvailableTimes();
  }, [doctorId, selectedDate]);
  const book = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!selectedDate || !selectedTime)
      newErrors.slot = 'Please select date and time';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const slotDateTime = selectedDate
      .hour(selectedTime.hour())
      .minute(0)
      .second(0);

    // Send local time string with clean hour boundary (HH:00:00)
    const slotString = slotDateTime.format('YYYY-MM-DDTHH:mm:ss');

    const selectedHour = selectedTime.hour();
    const isAvailable = availableTimes.some((t) => Number(t) === selectedHour);
    if (!isAvailable) {
      toast.error('This time is no longer available. Please pick another slot.');
      fetchAvailableTimes();
      return;
    }
    try {
      await API.post('/appointments/book', {
        doctorId,
        slot: slotString
      });
      toast.success('Appointment booked successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book');
    }
  };
  const cancel = async () => {
    try {
      await API.post(`/appointments/${cancelId}/cancel`);
      toast.success('Appointment canceled');
      setConfirmOpen(false);
      setCancelId(null);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to cancel');
    }
  };

  const handleCancelClick = (id) => {
    setCancelId(id);
    setConfirmOpen(true);
  };
  const isTimeAvailable = (hour) => availableTimes.some((t) => Number(t) === hour);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1.5 } }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          Appointments
        </Typography>
        
        {isMobile ? (
          // Mobile: Stacked layout
          <Grid container spacing={2}>
            {/* My Appointments Section */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white' }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                  My Appointments
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {list.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No appointments scheduled
                    </Typography>
                  ) : (
                    <Grid container spacing={1} direction="column">
                      {list.map((a) => (
                        <Grid item xs={12} key={a._id}>
                          <Card sx={{ boxShadow: 1, border: '1px solid #e0e0e0' }}>
                            <CardContent sx={{ pb: 1.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Dr. {a.doctor?.user?.name || 'Unknown'}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Date & Time:</strong> {a.date.split('-').reverse().join('/')} at {a.hour}:00
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{a.status}</span>
                              </Typography>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleCancelClick(a._id)}
                                disabled={a.status === 'cancelled'}
                                size="small"
                                fullWidth
                              >
                                Cancel
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Book New Appointment Section */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white' }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                  Book New Appointment
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box
                    component="form"
                    onSubmit={book}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      label="Doctor"
                      fullWidth
                      error={!!errors.doctorId}
                      helperText={errors.doctorId}
                    >
                      {doctors.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.user?.name} ({d.specialization})
                        </MenuItem>
                      ))}
                    </TextField>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Available Times:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                      {Array.from({ length: 8 }, (_, i) => 9 + i).map((hour) => (
                        <Button
                          key={hour}
                          size="small"
                          variant={
                            selectedTime && selectedTime.hour() === hour
                              ? 'contained'
                              : 'outlined'
                          }
                          disabled={!isTimeAvailable(hour)}
                          onClick={() =>
                            setSelectedTime(selectedDate ? selectedDate.hour(hour).minute(0).second(0) : dayjs().hour(hour).minute(0).second(0))
                          }
                          sx={{ minHeight: '36px' }}
                        >
                          {hour}:00
                        </Button>
                      ))}
                    </Box>
                    {errors.slot && (
                      <Typography color="error" variant="body2">{errors.slot}</Typography>
                    )}
                    <Button variant="contained" sx={{ mt: 1 }} type="submit" fullWidth>
                      Book
                    </Button>
                  </Box>
                </LocalizationProvider>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          // Desktop: Side-by-side layout
          <Grid container spacing={3}>
            {/* My Appointments Section - 50% */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white', height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                  My Appointments
                </Typography>
                <Box sx={{ maxHeight: { xs: 300, md: 500 }, overflowX: 'auto', overflowY: 'auto' }}>
                  <List sx={{ py: 0 }}>
                    {list.map((a) => (
                      <ListItem key={a._id} sx={{ borderBottom: '1px solid #e0e0e0', px: { xs: 1, sm: 2 } }}>
                        <ListItemText
                          primaryTypographyProps={{ variant: 'body2', sx: { fontSize: { xs: 13, sm: 14 } } }}
                          secondaryTypographyProps={{ sx: { fontSize: { xs: 12, sm: 13 } } }}
                          primary={`${a.date.split('-').reverse().join('/')} at ${a.hour}:00 - Dr. ${a.doctor?.user?.name || 'Unknown'}`}
                          secondary={`Status: ${a.status}`}
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancelClick(a._id)}
                          disabled={a.status === 'cancelled'}
                          sx={{ borderRadius: 2, ml: { xs: 1, sm: 2 }, whiteSpace: 'nowrap', fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                        >
                          Cancel
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            </Grid>

            {/* Book New Appointment Section - 50% */}
            <Grid item xs={12} md={6} sx={{ width: '100%' }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, boxShadow: 2, bgcolor: 'white', height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                  Book New Appointment
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box
                    component="form"
                    onSubmit={book}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      label="Doctor"
                      fullWidth
                      error={!!errors.doctorId}
                      helperText={errors.doctorId}
                    >
                      {doctors.map((d) => (
                        <MenuItem key={d._id} value={d._id}>
                          {d.user?.name} ({d.specialization})
                        </MenuItem>
                      ))}
                    </TextField>
                    <DatePicker
                      label="Select Date"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <Typography variant="h6">Available Times:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Array.from({ length: 8 }, (_, i) => 9 + i).map((hour) => (
                        <Button
                          key={hour}
                          size="small"
                          variant={
                            selectedTime && selectedTime.hour() === hour
                              ? 'contained'
                              : 'outlined'
                          }
                          disabled={!isTimeAvailable(hour)}
                          onClick={() =>
                            setSelectedTime(selectedDate ? selectedDate.hour(hour).minute(0).second(0) : dayjs().hour(hour).minute(0).second(0))
                          }
                          sx={{ minWidth: 88 }}
                        >
                          {hour}:00
                        </Button>
                      ))}
                    </Box>
                    {errors.slot && (
                      <Typography color="error">{errors.slot}</Typography>
                    )}
                    <Button variant="contained" sx={{ mt: 1 }} type="submit">
                      Book
                    </Button>
                  </Box>
                </LocalizationProvider>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Confirm Cancellation
          <IconButton onClick={() => setConfirmOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this appointment?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>No</Button>
          <Button onClick={cancel} color="error">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
