import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';

import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { isAdmin, isDoctor, isPatient, getRole, getName } from '../utils/auth';

export default function Nav() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const navItems = [
    { to: '/', label: 'Dashboard', Icon: DashboardIcon, show: true },
    { to: '/manage-users', label: 'Manage Users', Icon: PeopleIcon, show: isAdmin() },
    { to: '/patients', label: 'Patients', Icon: PeopleIcon, show: isAdmin() },
    { to: '/doctors', label: 'Doctors', Icon: PeopleIcon, show: isAdmin() },
    { to: '/appointments', label: 'Appointments', Icon: EventIcon, show: isAdmin() || isDoctor() || isPatient() },
    { to: '/records', label: 'Records', Icon: FolderIcon, show: true }
  ];

  const navBtn = (to, label, Icon) => (
    <Button
      key={to}
      component={Link}
      to={to}
      startIcon={<Icon />}
      color="inherit"
      sx={{
        mx: 0.5,
        px: 2,
        borderRadius: 0,
        borderBottom:
          location.pathname === to ? '2px solid #fff' : '2px solid transparent',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.custom.navHover,
        }
      }}
      onClick={() => setDrawerOpen(false)}
    >
      {label}
    </Button>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: (theme) => theme.palette.custom.navBackground,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          borderRadius: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          {isMobile ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            navBtn('/', 'Dashboard', DashboardIcon)
          )}

          {!isMobile && navItems.filter(i => i.show).map(i => i.to !== '/' ? navBtn(i.to, i.label, i.Icon) : null)}

          <Box sx={{ flexGrow: 1 }} />

          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mr: 1, 
              cursor: 'pointer',
              px: 1.25,
              py: 0.5,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: (theme) => theme.palette.custom.navHover,
              }
            }}
            onClick={handleMenu}
          >
            <Typography variant="body2" sx={{ color: 'white', mr: 1, fontWeight: 600 }}>
              {getName() || 'User'}
            </Typography>
            <AccountCircle />
          </Box>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/profile" onClick={handleClose}>
              <AccountCircle sx={{ mr: 1 }} />
              My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer 
        anchor="left" 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 260, bgcolor: 'background.paper', height: '100%', display: 'flex', flexDirection: 'column', pt: '64px' }}>
          <List sx={{ pt: 0 }}>
            {navItems.filter(i => i.show).map(item => (
              <ListItemButton
                key={item.to}
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                onClick={() => setDrawerOpen(false)}
              >
                <item.Icon sx={{ mr: 2 }} />
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ mt: 'auto' }} />
          <List>
            <ListItemButton component={Link} to="/profile" onClick={() => setDrawerOpen(false)}>
              <AccountCircle sx={{ mr: 2 }} />
              <ListItemText primary="My Profile" />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2 }} />
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Toolbar />
    </>
  );
}
