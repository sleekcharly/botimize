import {
  ApolloClient,
  DefaultOptions,
  InMemoryCache,
  createHttpLink,
} from '@apollo/client';

export const BASE_URL =
  process.env.NODE_ENV !== 'development'
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : 'http://localhost:3000';

const httpLink = createHttpLink({
  uri: `${BASE_URL}/api/graphql`, // Point to the new API route
});

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

// crete client
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions,
});

export default client;
