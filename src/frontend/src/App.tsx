import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Home from './pages/Home/Home';
import Confirmation from './pages/Confirmation/Confirmation';
import { ReminderProvider } from './context/ReminderContext';
import GlobalStyle from './styles/global';
import theme from './styles/theme';

/**
 * Main App component for the supplement reminder website.
 * Sets up the routing, global styles, and context providers for the entire application.
 * 
 * Requirements addressed:
 * - Application Structure (Technical Requirements/Frontend Architecture)
 * - Responsive Design (1. INTRODUCTION/1.2 SCOPE)
 * - Consistent Styling (Technical Requirements/User Interface Design)
 */
const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ReminderProvider>
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/confirmation" component={Confirmation} />
          </Switch>
        </Router>
      </ReminderProvider>
    </ThemeProvider>
  );
};

export default App;