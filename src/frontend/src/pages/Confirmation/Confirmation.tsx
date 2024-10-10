import React from 'react';
import styled from 'styled-components';
import ConfirmationPage from '../../components/ConfirmationPage/ConfirmationPage';
import Layout from '../../components/Layout/Layout';
import { useReminderContext } from '../../context/ReminderContext';
import { Theme } from '../../types';

// Requirement: Mobile-Friendly Interface
// Location: 1. INTRODUCTION/1.2 SCOPE/Goals
// Description: Provide a simple, mobile-friendly interface for users to set up reminders quickly.
const ConfirmationPageWrapper = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }: { theme: Theme }) => theme.spacing.large};
  @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }: { theme: Theme }) => theme.spacing.medium};
  }
`;

/**
 * Confirmation component
 * This component renders the confirmation page after a reminder has been set.
 * 
 * Requirements addressed:
 * - User Confirmation (1. INTRODUCTION/1.2 SCOPE/Core Functionalities)
 * - Mobile-Friendly Interface (1. INTRODUCTION/1.2 SCOPE/Goals)
 */
const Confirmation: React.FC = () => {
  const reminderContext = useReminderContext();

  if (!reminderContext) {
    throw new Error('Confirmation must be used within a ReminderProvider');
  }

  return (
    <Layout>
      <ConfirmationPageWrapper>
        <ConfirmationPage />
      </ConfirmationPageWrapper>
    </Layout>
  );
};

export default Confirmation;