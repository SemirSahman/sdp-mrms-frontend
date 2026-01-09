import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import Login from '../pages/Login';

// Mock the API client module to avoid import.meta issues
jest.mock('../api/client', () => {
  const axios = require('axios');
  const mockAPI = axios.create({ baseURL: 'http://localhost:4001/api' });
  mockAPI.get = jest.fn();
  mockAPI.post = jest.fn();
  mockAPI.put = jest.fn();
  mockAPI.delete = jest.fn();
  return { 
    default: mockAPI,
    getBaseUrl: () => 'http://localhost:4001'
  };
});

const theme = createTheme({
  palette: {
    custom: {
      pageBackground: '#edede9',
      cardBackground: 'white',
      navBackground: '#0E2239',
      navHover: 'rgba(255, 255, 255, 0.15)'
    }
  }
});

test('renders login form', () => {
  render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </ThemeProvider>
  );
  expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
});
