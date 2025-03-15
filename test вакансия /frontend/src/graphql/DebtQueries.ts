import { graphql } from 'relay-runtime';

export const DebtsQuery = graphql`
  query DebtsQuery {
    allDebts {
      edges {
        node {
          id
          amount
          debtType
          isPaid
          dueDate
          client {
            id
            name
          }
          supplier {
            id
            name
          }
          invoice {
            id
            invoiceNumber
            date
          }
        }
      }
    }
  }
`; 