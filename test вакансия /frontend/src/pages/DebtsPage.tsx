import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useLazyLoadQuery } from 'react-relay';
import { DebtsQuery } from '../graphql/DebtQueries';
import type { DebtsQuery as DebtsQueryType } from '../graphql/__generated__/DebtsQuery.graphql';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`debt-tabpanel-${index}`}
      aria-labelledby={`debt-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

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

const DebtsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const data = useLazyLoadQuery<DebtsQueryType>(DebtsQuery, {});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const debts = data.allDebts?.edges.map((edge) => edge.node) || [];
  const clientDebts = debts.filter((debt) => debt.debtType === 'client');
  const supplierDebts = debts.filter((debt) => debt.debtType === 'supplier');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Debts
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Client Debts" />
          <Tab label="Supplier Debts" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientDebts.length > 0 ? (
                  clientDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>{debt.invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(debt.invoice.date)}</TableCell>
                      <TableCell>{debt.client.name}</TableCell>
                      <TableCell>{formatCurrency(debt.amount)}</TableCell>
                      <TableCell>{formatDate(debt.dueDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={debt.isPaid ? 'Paid' : 'Unpaid'}
                          color={debt.isPaid ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No client debts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {supplierDebts.length > 0 ? (
                  supplierDebts.map((debt) => (
                    <TableRow key={debt.id}>
                      <TableCell>{debt.invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(debt.invoice.date)}</TableCell>
                      <TableCell>{debt.supplier.name}</TableCell>
                      <TableCell>{formatCurrency(debt.amount)}</TableCell>
                      <TableCell>{formatDate(debt.dueDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={debt.isPaid ? 'Paid' : 'Unpaid'}
                          color={debt.isPaid ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No supplier debts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default DebtsPage; 