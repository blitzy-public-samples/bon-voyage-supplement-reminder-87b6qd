import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { useReminderContext } from '../../context/ReminderContext';
import { formatTimeForDisplay, convertToUserTimeZone } from '../../utils/timeZone';
import { Reminder, Theme } from '../../types';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

// Styled components
const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }: { theme: Theme }) => theme.spacing.large};
  background-color: ${({ theme }: { theme: Theme }) => theme.colors.background};
  border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }: { theme: Theme }) => theme.shadows.medium};
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: ${({ theme }: { theme: Theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }: { theme: Theme }) => theme.spacing.medium};
  }
`;

const SuccessMessage = styled.h2`
  color: ${({ theme }: { theme: Theme }) => theme.colors.primary};
  font-size: ${({ theme }: { theme: Theme }) => theme.fontSizes.xlarge};
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.spacing.medium};
  text-align: center;
`;

const ReminderDetails = styled.p`
  font-size: ${({ theme }: { theme: Theme }) => theme.fontSizes.medium};
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.spacing.small};
  text-align: center;
`;

const Button = styled.button`
  padding: ${({ theme }: { theme: Theme }) => `${theme.spacing.small} ${theme.spacing.medium}`};
  border: none;
  border-radius: ${({ theme }: { theme: Theme }) => theme.borderRadius.small};
  font-size: ${({ theme }: { theme: Theme }) => theme.fontSizes.medium};
  cursor: pointer;
  transition: ${({ theme }: { theme: Theme }) => theme.transitions.short};
  margin: ${({ theme }: { theme: Theme }) => theme.spacing.small} 0;
  width: 100%;
  max-width: 250px;
`;

const ModifyButton = styled(Button)`
  background-color: ${({ theme }: { theme: Theme }) => theme.colors.secondary};
  color: ${({ theme }: { theme: Theme }) => theme.colors.background};
  &:hover {
    background-color: ${({ theme }: { theme: Theme }) => theme.colors.primary};
  }
`;

const CancelButton = styled(Button)`
  background-color: ${({ theme }: { theme: Theme }) => theme.colors.error};
  color: ${({ theme }: { theme: Theme }) => theme.colors.background};
  &:hover {
    opacity: 0.8;
  }
`;

const NextStepsList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  text-align: left;
  width: 100%;
  max-width: 400px;
`;

const NextStepItem = styled.li`
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.spacing.small};
  &:before {
    content: '✓';
    color: ${({ theme }: { theme: Theme }) => theme.colors.success};
    margin-right: ${({ theme }: { theme: Theme }) => theme.spacing.xsmall};
  }
`;

/**
 * ConfirmationPage component displays the confirmation details after setting a reminder.
 * It shows the scheduled time, masked phone number, and options to modify or cancel the reminder.
 * 
 * Requirements addressed:
 * - Confirmation Page (Technical Requirements/User Interface Design)
 * - User Feedback (Technical Requirements/User Interface Design)
 * - Data Privacy (Technical Requirements/Security)
 * - Responsive Design (Technical Requirements/User Interface Design)
 */
const ConfirmationPage: React.FC = () => {
  const { user, reminders, deleteReminder } = useReminderContext();
  const navigate = useNavigate();

  // Get the most recent reminder
  const latestReminder: Reminder | undefined = reminders[reminders.length - 1];

  const handleModifyReminder = useCallback(() => {
    navigate('/modify-reminder');
  }, [navigate]);

  const handleCancelReminder = useCallback(() => {
    if (latestReminder) {
      deleteReminder(latestReminder.id);
      alert('Reminder cancelled successfully');
      navigate('/');
    }
  }, [latestReminder, deleteReminder, navigate]);

  if (!user || !latestReminder) {
    return (
      <Layout>
        <ConfirmationContainer>
          <ErrorMessage message="Error: User or reminder not found" />
        </ConfirmationContainer>
      </Layout>
    );
  }

  const reminderTime = convertToUserTimeZone(latestReminder.scheduledAt, user.timezone);
  const formattedTime = formatTimeForDisplay(reminderTime);

  // Mask the phone number for privacy
  const maskedPhoneNumber = user.phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) XXX-$3');

  return (
    <Layout>
      <ConfirmationContainer>
        <SuccessMessage>Reminder Set Successfully!</SuccessMessage>
        <ReminderDetails>
          Your reminder for <strong>{latestReminder.supplementName}</strong> is scheduled for: <strong>{formattedTime}</strong>
        </ReminderDetails>
        <ReminderDetails>
          Phone Number: <strong>{maskedPhoneNumber}</strong>
        </ReminderDetails>
        <ModifyButton onClick={handleModifyReminder}>
          Modify Reminder
        </ModifyButton>
        <CancelButton onClick={handleCancelReminder}>
          Cancel Reminder
        </CancelButton>
        <ReminderDetails>
          What's next?
        </ReminderDetails>
        <NextStepsList>
          <NextStepItem>Look out for our text message reminder</NextStepItem>
          <NextStepItem>Take your supplement as scheduled</NextStepItem>
          <NextStepItem>Enjoy the benefits of consistent supplement use!</NextStepItem>
        </NextStepsList>
      </ConfirmationContainer>
    </Layout>
  );
};

export default ConfirmationPage;