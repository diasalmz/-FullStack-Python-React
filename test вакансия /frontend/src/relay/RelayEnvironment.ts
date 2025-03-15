import {
  Environment,
  Network,
  RecordSource,
  Store,
  FetchFunction,
} from 'relay-runtime';

const API_URL = 'http://localhost:5000/graphql';

const fetchFn: FetchFunction = async (request, variables) => {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  });

  return await resp.json();
};

// Export a singleton instance of Relay Environment
export default new Environment({
  network: Network.create(fetchFn),
  store: new Store(new RecordSource()),
}); 