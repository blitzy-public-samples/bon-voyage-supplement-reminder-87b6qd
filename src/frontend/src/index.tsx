import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { ReminderProvider } from './context/ReminderContext';
import GlobalStyle from './styles/global';
import theme from './styles/theme';

/**
 * This is the entry point for the React application of the supplement reminder website.
 * It renders the main App component and sets up necessary providers and configurations.
 * 
 * Requirements addressed:
 * 1. Application Entry Point (Technical Requirements/Frontend Architecture)
 *    - Set up the main entry point for the React application
 * 2. React Rendering (Technical Requirements/Frontend Framework)
 *    - Render the main App component and set up necessary providers
 * 3. Global Styling (Technical Requirements/User Interface Design)
 *    - Apply global styles and theme using styled-components
 * 4. State Management (Technical Requirements/Frontend Architecture)
 *    - Set up ReminderProvider for global state management
 * 5. Routing (Technical Requirements/Frontend Architecture)
 *    - Set up BrowserRouter for handling client-side routing
 * 
 * @module index
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ReminderProvider>
        <Router>
          <App />
        </Router>
      </ReminderProvider>
    </ThemeProvider>
  </React.StrictMode>,
  rootElement
);

/**
 * Note: The reportWebVitals function has been removed as it was not implemented
 * in the project. If performance monitoring is required in the future, consider
 * implementing a custom solution or using a third-party analytics service.
 */

/**
 * React version: ^17.0.2 (as specified in the App.tsx dependencies)
 * ReactDOM version: ^17.0.2 (assumed to be the same as React)
 * react-router-dom version: ^5.2.0 (based on the usage of BrowserRouter and Switch in App.tsx)
 * styled-components version: ^5.3.0 (assumed based on common usage with React 17)
 */