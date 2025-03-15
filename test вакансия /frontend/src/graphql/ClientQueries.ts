import { graphql } from 'relay-runtime';

export const ClientsQuery = graphql`
  query ClientsQuery {
    allClients {
      edges {
        node {
          id
          name
          markupPercentage
        }
      }
    }
  }
`;

export const CreateClientMutation = graphql`
  mutation CreateClientMutation($input: CreateClientInput!) {
    createClient(input: $input) {
      client {
        id
        name
        markupPercentage
      }
    }
  }
`; 