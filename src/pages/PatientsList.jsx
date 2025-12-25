import React, {useEffect, useState} from 'react';
import API from '../api/client';
import { Link } from 'react-router-dom';
import { Container, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
export default function PatientsList(){
  const [list,setList]=useState([]);
  const [open,setOpen]=useState(false);
  const [form,setForm]=useState({name:'', email:'', contact:'', dob:''});
  useEffect(()=>{ API.get('/patients').then(r=>setList(r.data)).catch(()=>{}); },[]);
  const handleCreate = async ()=>{
    try{
      const reg = await API.post('/auth/register', { email: form.email, password: 'password123', role: 'patient', name: form.name });
      await API.post('/patients', { user: reg.data.id, dob: form.dob, contact: form.contact });
      setOpen(false); window.location.reload();
    }catch(e){ alert(e.response?.data?.error || 'failed'); }
  };
  return (
    <Container maxWidth='lg' sx={{mt:4}}>
      <Paper sx={{p:2}}>
        <Typography variant='h5'>Patients</Typography>
        <Button variant='contained' sx={{mt:2, mb:2}} onClick={()=>setOpen(true)}>Create Patient</Button>
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Contact</TableCell><TableCell></TableCell></TableRow></TableHead>
          <TableBody>
            {list.map(p=>(
              <TableRow key={p._id}>
                <TableCell>{p.user?.name}</TableCell>
                <TableCell>{p.user?.email}</TableCell>
                <TableCell>{p.contact}</TableCell>
                <TableCell><Link to={'/patients/'+p._id}>View</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Dialog open={open} onClose={()=>setOpen(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Create Patient
          <IconButton onClick={()=>setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField label='Full name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} fullWidth sx={{mt:1}}/>
          <TextField label='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} fullWidth sx={{mt:1}}/>
          <TextField label='Contact' value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})} fullWidth sx={{mt:1}}/>
          <TextField label='Date of birth' type='date' value={form.dob} onChange={e=>setForm({...form,dob:e.target.value})} fullWidth sx={{mt:1}} InputLabelProps={{shrink:true}}/>
        </DialogContent>
        <DialogActions><Button onClick={()=>setOpen(false)}>Cancel</Button><Button variant='contained' onClick={handleCreate}>Create</Button></DialogActions>
      </Dialog>
    </Container>
  );
}
