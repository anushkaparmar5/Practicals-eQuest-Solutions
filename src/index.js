import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';

const httpLink = new HttpLink({
  // uri: 'https://studio.apollographql.com/public/star-wars-swapi/home?variant=current',
  uri: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
);