import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Clients
            </Typography>
            <Typography variant="body1" paragraph>
              Manage your clients and their markup percentages.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={Link}
                to="/clients"
                variant="contained"
                color="primary"
              >
                View Clients
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Suppliers
            </Typography>
            <Typography variant="body1" paragraph>
              Manage your material suppliers.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={Link}
                to="/suppliers"
                variant="contained"
                color="primary"
              >
                View Suppliers
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Invoices
            </Typography>
            <Typography variant="body1" paragraph>
              Create and manage material invoices.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={Link}
                to="/invoices"
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
              >
                View Invoices
              </Button>
              <Button
                component={Link}
                to="/invoices/create"
                variant="contained"
                color="secondary"
              >
                Create Invoice
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 200,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Debts
            </Typography>
            <Typography variant="body1" paragraph>
              Track client and supplier debts.
            </Typography>
            <Box sx={{ mt: 'auto' }}>
              <Button
                component={Link}
                to="/debts"
                variant="contained"
                color="primary"
              >
                View Debts
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 