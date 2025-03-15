import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { ClientsQuery, CreateClientMutation } from '../graphql/ClientQueries';
import type { ClientsQuery as ClientsQueryType } from '../graphql/__generated__/ClientsQuery.graphql';
import type { CreateClientMutation as CreateClientMutationType } from '../graphql/__generated__/CreateClientMutation.graphql';

type ClientFormData = {
  name: string;
  markupPercentage: number;
};

const ClientsPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const data = useLazyLoadQuery<ClientsQueryType>(ClientsQuery, {});
  const [commitMutation, isMutationInFlight] = useMutation<CreateClientMutationType>(CreateClientMutation);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      markupPercentage: 0,
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = (formData: ClientFormData) => {
    commitMutation({
      variables: {
        input: {
          name: formData.name,
          markupPercentage: parseFloat(formData.markupPercentage.toString()),
        },
      },
      onCompleted: () => {
        handleCloseDialog();
      },
      onError: (error) => {
        console.error('Error creating client:', error);
      },
    });
  };

  const clients = data.allClients?.edges.map((edge) => edge.node) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Markup Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.id.split(':')[1]}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.markupPercentage}%</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Client</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Client Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
            <Controller
              name="markupPercentage"
              control={control}
              rules={{
                required: 'Markup percentage is required',
                min: { value: 0, message: 'Markup cannot be negative' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Markup Percentage"
                  type="number"
                  fullWidth
                  margin="normal"
                  error={!!errors.markupPercentage}
                  helperText={errors.markupPercentage?.message}
                  InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isMutationInFlight}
            >
              {isMutationInFlight ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ClientsPage; 