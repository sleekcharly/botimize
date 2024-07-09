import {
  ApolloClient,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';

// Disable all caching mechanisms
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  mutate: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

// Create a new Apollo Client instance
export const serverClient = new ApolloClient({
  ssrMode: true,
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT, // replace with your graphql endpoint
    headers: {
      Authorization: `Apikey ${process.env.GRAPHQL_TOKEN}`,
    },
    fetch,
  }),
  cache: new InMemoryCache(),
  defaultOptions,
});
