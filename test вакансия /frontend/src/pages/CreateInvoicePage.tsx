import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { ClientsAndSuppliersQuery, CreateInvoiceMutation } from '../graphql/InvoiceQueries';
import type { ClientsAndSuppliersQuery as ClientsAndSuppliersQueryType } from '../graphql/__generated__/ClientsAndSuppliersQuery.graphql';
import type { CreateInvoiceMutation as CreateInvoiceMutationType } from '../graphql/__generated__/CreateInvoiceMutation.graphql';

type InvoiceFormData = {
  invoiceNumber: string;
  date: string;
  clientId: string;
  supplierId: string;
  description: string;
  items: {
    materialName: string;
    quantity: number;
    unitPrice: number;
    unit: string;
  }[];
};

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const data = useLazyLoadQuery<ClientsAndSuppliersQueryType>(ClientsAndSuppliersQuery, {});
  const [commitMutation] = useMutation<CreateInvoiceMutationType>(CreateInvoiceMutation);

  const clients = data.allClients?.edges.map((edge) => edge.node) || [];
  const suppliers = data.allSuppliers?.edges.map((edge) => edge.node) || [];

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      clientId: '',
      supplierId: '',
      description: '',
      items: [
        {
          materialName: '',
          quantity: 1,
          unitPrice: 0,
          unit: 'pcs',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const totalAmount = watchItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
    0
  );

  const selectedClient = clients.find(
    (client) => client.id === watch('clientId')
  );

  const markupAmount = selectedClient
    ? (totalAmount * selectedClient.markupPercentage) / 100
    : 0;

  const totalWithMarkup = totalAmount + markupAmount;

  const onSubmit = (data: InvoiceFormData) => {
    setIsSubmitting(true);
    setError(null);

    const input = {
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      clientId: parseInt(data.clientId.split(':')[1], 10),
      supplierId: parseInt(data.supplierId.split(':')[1], 10),
      description: data.description,
      items: data.items.map((item) => ({
        materialName: item.materialName,
        quantity: parseFloat(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
        unit: item.unit,
      })),
    };

    commitMutation({
      variables: { input },
      onCompleted: () => {
        setIsSubmitting(false);
        navigate('/invoices');
      },
      onError: (error) => {
        setIsSubmitting(false);
        setError(error.message);
      },
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Create Invoice
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Controller
                name="invoiceNumber"
                control={control}
                rules={{ required: 'Invoice number is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Invoice Number"
                    fullWidth
                    error={!!errors.invoiceNumber}
                    helperText={errors.invoiceNumber?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date}
                    helperText={errors.date?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="clientId"
                control={control}
                rules={{ required: 'Client is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Client"
                    fullWidth
                    error={!!errors.clientId}
                    helperText={errors.clientId?.message}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name} (Markup: {client.markupPercentage}%)
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="supplierId"
                control={control}
                rules={{ required: 'Supplier is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Supplier"
                    fullWidth
                    error={!!errors.supplierId}
                    helperText={errors.supplierId?.message}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Materials
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {fields.map((field, index) => (
                <Box key={field.id} sx={{ mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`items.${index}.materialName`}
                        control={control}
                        rules={{ required: 'Material name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Material Name"
                            fullWidth
                            error={!!errors.items?.[index]?.materialName}
                            helperText={errors.items?.[index]?.materialName?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        rules={{
                          required: 'Required',
                          min: { value: 0.01, message: 'Min 0.01' },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Quantity"
                            type="number"
                            fullWidth
                            InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                            error={!!errors.items?.[index]?.quantity}
                            helperText={errors.items?.[index]?.quantity?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Controller
                        name={`items.${index}.unit`}
                        control={control}
                        rules={{ required: 'Required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Unit"
                            fullWidth
                            error={!!errors.items?.[index]?.unit}
                            helperText={errors.items?.[index]?.unit?.message}
                          >
                            <MenuItem value="pcs">pcs</MenuItem>
                            <MenuItem value="kg">kg</MenuItem>
                            <MenuItem value="m">m</MenuItem>
                            <MenuItem value="l">l</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Controller
                        name={`items.${index}.unitPrice`}
                        control={control}
                        rules={{
                          required: 'Required',
                          min: { value: 0.01, message: 'Min 0.01' },
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Unit Price"
                            type="number"
                            fullWidth
                            InputProps={{ inputProps: { min: 0.01, step: 0.01 } }}
                            error={!!errors.items?.[index]?.unitPrice}
                            helperText={errors.items?.[index]?.unitPrice?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  append({
                    materialName: '',
                    quantity: 1,
                    unitPrice: 0,
                    unit: 'pcs',
                  })
                }
                sx={{ mt: 1 }}
              >
                Add Material
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">Total Amount:</Typography>
                <Typography variant="subtitle1">
                  {new Intl.NumberFormat('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                  }).format(totalAmount)}
                </Typography>
              </Box>
              {selectedClient && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">
                      Markup ({selectedClient.markupPercentage}%):
                    </Typography>
                    <Typography variant="subtitle1">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      }).format(markupAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total with Markup:
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                      }).format(totalWithMarkup)}
                    </Typography>
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/invoices')}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateInvoicePage; 