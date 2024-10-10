import React from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout/Layout';
import ReminderForm from '../../components/ReminderForm/ReminderForm';
import { Theme } from '../../styles/theme';

// Styled components for the Home page
const HomeContainer = styled.div<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.large};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.medium};
  }
`;

const Title = styled.h1<{ theme: Theme }>`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Subtitle = styled.p<{ theme: Theme }>`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.large};
  text-align: center;
  max-width: 600px;
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

/**
 * Home component - The main landing page for the supplement reminder website.
 * This component serves as the entry point for users after scanning the QR code.
 * 
 * Requirements addressed:
 * - Landing Page (6. USER INTERFACE DESIGN/6.4 Landing Page)
 * - Mobile-Friendly Interface (1. INTRODUCTION/1.2 SCOPE)
 * - Consistent Styling (Technical Requirements/User Interface Design)
 */
const Home: React.FC = () => {
  return (
    <Layout>
      <HomeContainer>
        <Title>Welcome to Supplement Reminder</Title>
        <Subtitle>
          Set up your daily reminder to ensure you never miss taking your supplements.
          It's quick, easy, and helps you stay on track with your health goals.
        </Subtitle>
        <ReminderForm />
      </HomeContainer>
    </Layout>
  );
};

export default Home;