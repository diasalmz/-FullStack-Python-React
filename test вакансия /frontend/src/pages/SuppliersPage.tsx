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
import { SuppliersQuery, CreateSupplierMutation } from '../graphql/SupplierQueries';
import type { SuppliersQuery as SuppliersQueryType } from '../graphql/__generated__/SuppliersQuery.graphql';
import type { CreateSupplierMutation as CreateSupplierMutationType } from '../graphql/__generated__/CreateSupplierMutation.graphql';

type SupplierFormData = {
  name: string;
};

const SuppliersPage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const data = useLazyLoadQuery<SuppliersQueryType>(SuppliersQuery, {});
  const [commitMutation, isMutationInFlight] = useMutation<CreateSupplierMutationType>(CreateSupplierMutation);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormData>({
    defaultValues: {
      name: '',
    },
  });

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    reset();
  };

  const onSubmit = (formData: SupplierFormData) => {
    commitMutation({
      variables: {
        input: {
          name: formData.name,
        },
      },
      onCompleted: () => {
        handleCloseDialog();
      },
      onError: (error) => {
        console.error('Error creating supplier:', error);
      },
    });
  };

  const suppliers = data.allSuppliers?.edges.map((edge) => edge.node) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Suppliers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Supplier
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length > 0 ? (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.id.split(':')[1]}</TableCell>
                  <TableCell>{supplier.name}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No suppliers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Supplier</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Supplier Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.name}
                  helperText={errors.name?.message}
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

export default SuppliersPage; 