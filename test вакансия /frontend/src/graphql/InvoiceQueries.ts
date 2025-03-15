import { graphql } from 'relay-runtime';

export const InvoicesQuery = graphql`
  query InvoicesQuery {
    allInvoices {
      edges {
        node {
          id
          invoiceNumber
          date
          totalAmount
          description
          totalWithMarkup
          markupAmount
          client {
            id
            name
            markupPercentage
          }
          supplier {
            id
            name
          }
          items {
            edges {
              node {
                id
                materialName
                quantity
                unitPrice
                unit
              }
            }
          }
        }
      }
    }
  }
`;

export const CreateInvoiceMutation = graphql`
  mutation CreateInvoiceMutation($input: CreateInvoiceInput!) {
    createInvoice(input: $input) {
      invoice {
        id
        invoiceNumber
        date
        totalAmount
        description
        totalWithMarkup
        markupAmount
      }
      transaction {
        id
        amount
      }
      clientDebt {
        id
        amount
      }
      supplierDebt {
        id
        amount
      }
    }
  }
`;

export const ClientsAndSuppliersQuery = graphql`
  query ClientsAndSuppliersQuery {
    allClients {
      edges {
        node {
          id
          name
          markupPercentage
        }
      }
    }
    allSuppliers {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`; 