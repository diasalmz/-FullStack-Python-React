import React from 'react';
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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useLazyLoadQuery } from 'react-relay';
import { InvoicesQuery } from '../graphql/InvoiceQueries';
import type { InvoicesQuery as InvoicesQueryType } from '../graphql/__generated__/InvoicesQuery.graphql';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount);
};

const InvoicesPage: React.FC = () => {
  const data = useLazyLoadQuery<InvoicesQueryType>(InvoicesQuery, {});
  const invoices = data.allInvoices?.edges.map((edge) => edge.node) || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Invoices
        </Typography>
        <Button
          component={Link}
          to="/invoices/create"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Create Invoice
        </Button>
      </Box>

      {invoices.length > 0 ? (
        invoices.map((invoice) => (
          <Accordion key={invoice.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                <Typography sx={{ width: '20%', flexShrink: 0 }}>
                  #{invoice.invoiceNumber}
                </Typography>
                <Typography sx={{ width: '20%' }}>
                  {formatDate(invoice.date)}
                </Typography>
                <Typography sx={{ width: '20%' }}>
                  Client: {invoice.client.name}
                </Typography>
                <Typography sx={{ width: '20%' }}>
                  Supplier: {invoice.supplier.name}
                </Typography>
                <Typography sx={{ width: '20%', color: 'primary.main' }}>
                  {formatCurrency(invoice.totalWithMarkup)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Invoice Details
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Chip
                    label={`Base Amount: ${formatCurrency(invoice.totalAmount)}`}
                    color="default"
                    variant="outlined"
                  />
                  <Chip
                    label={`Markup: ${invoice.client.markupPercentage}%`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Markup Amount: ${formatCurrency(invoice.markupAmount)}`}
                    color="secondary"
                    variant="outlined"
                  />
                  <Chip
                    label={`Total with Markup: ${formatCurrency(invoice.totalWithMarkup)}`}
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Materials
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.edges.map(({ node }) => (
                      <TableRow key={node.id}>
                        <TableCell>{node.materialName}</TableCell>
                        <TableCell align="right">{node.quantity}</TableCell>
                        <TableCell align="right">{node.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(node.unitPrice)}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(node.quantity * node.unitPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {invoice.description && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">{invoice.description}</Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No invoices found. Create your first invoice!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default InvoicesPage; 