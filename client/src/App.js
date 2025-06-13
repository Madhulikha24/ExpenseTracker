import React, { useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  useMutation,
  gql // Import gql for dummy mutation
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Import your components and pages
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Transactions from "./pages/Transactions"; // Correctly import the Transactions PAGE component
import TransactionForm from "./components/TransactionForm"; // Correctly import the TransactionForm COMPONENT
import Analysis from "./pages/Analysis";
import Footer from "./components/Footer";

// Import your formatDate helper to initialize date
import { formatDate } from './utils/helpers';

// --- Placeholder for your GraphQL Mutation ---
// You MUST replace this with your actual GraphQL mutation query.
// Example: import { ADD_TRANSACTION } from './utils/mutations';
const ADD_TRANSACTION = null; // REPLACE 'null' with your actual imported ADD_TRANSACTION

// Define a minimal dummy mutation to satisfy the `useMutation` hook if ADD_TRANSACTION is null.
// This prevents React Hook errors related to conditional calls.
const EMPTY_MUTATION = gql`
  mutation EmptyMutation {
    _ {
      id
    }
  }
`;

const httpLink = createHttpLink({
  uri: "/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("id_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Create a component that uses hooks and then render it inside ApolloProvider
function AppContent() {
  const [transactions, setTransactions] = useState([]);

  // State for the transaction form, initialized to prevent 'undefined' errors
  const [transactionFormState, setTransactionFormState] = useState({
    date: formatDate(new Date().getTime()), // Initialize with current date
    amount: '',
    highLevelCategory: 'Essential',
    category: 'Housing',
    description: '',
  });

  // Call useMutation unconditionally as per React Hooks rules.
  // It uses EMPTY_MUTATION if ADD_TRANSACTION is null, preventing a crash.
  const [addTransactionApollo] = useMutation(ADD_TRANSACTION || EMPTY_MUTATION);

  // Define the 'addTransaction' function that will be passed down.
  // It conditionally uses the actual Apollo mutation function or the mock,
  // based on whether ADD_TRANSACTION has been defined by the user.
  let addTransaction;
  if (ADD_TRANSACTION) { // Only use the Apollo result if ADD_TRANSACTION is actually defined
    addTransaction = addTransactionApollo;
  } else {
    // Mock addTransaction function for demonstration if ADD_TRANSACTION is not defined
    addTransaction = async ({ variables }) => {
      console.warn("Using mock addTransaction. Please define and import your ADD_TRANSACTION GraphQL mutation.");
      return new Promise(resolve => {
        setTimeout(() => {
          const newTransaction = {
            _id: Date.now().toString(), // Use _id as Apollo often expects it for cache updates
            ...variables.variables, // Correctly access variables from the passed object
          };
          resolve({ data: { addTransaction: newTransaction } }); // Simulate Apollo response structure
        }, 500);
      });
    };
  }

  return (
    <>
      <Navbar /> {/* Navbar outside Routes if it should be on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/transactions"
          element={
            <Transactions
              transactions={transactions}
              setTransactions={setTransactions}
            />
          }
        />
        <Route
          path="/add-transaction"
          element={
            <TransactionForm
              addTransaction={addTransaction}
              transactions={transactions}
              setTransactions={setTransactions}
              transactionFormState={transactionFormState}
              setTransactionFormState={setTransactionFormState}
            />
          }
        />
        <Route
          path="/analysis"
          element={<Analysis transactions={transactions} setTransactions={setTransactions} />}
        />
        <Route
          path="*"
          element={<h1 className="display-2">Wrong page!</h1>}
        />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <Router basename={process.env.PUBLIC_URL}>
        <AppContent /> {/* AppContent now contains the hooks and main logic */}
      </Router>
    </ApolloProvider>
  );
}

export default App;
