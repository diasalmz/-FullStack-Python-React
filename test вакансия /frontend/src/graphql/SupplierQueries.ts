import { graphql } from 'relay-runtime';

export const SuppliersQuery = graphql`
  query SuppliersQuery {
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

export const CreateSupplierMutation = graphql`
  mutation CreateSupplierMutation($input: CreateSupplierInput!) {
    createSupplier(input: $input) {
      supplier {
        id
        name
      }
    }
  }
`; 