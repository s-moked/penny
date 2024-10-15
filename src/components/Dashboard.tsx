import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Typography, Container, Box, Tabs, Tab } from '@mui/material';
import AgencyManagement from './AgencyManagement';
import CommercialManagement from './CommercialManagement';
import IntroducerManagement from './IntroducerManagement';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" gutterBottom>
          Welcome, {currentUser?.email}!
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Agency Management" />
            <Tab label="Commercial Management" />
            <Tab label="Introducer Management" />
          </Tabs>
        </Box>
        {tabValue === 0 && <AgencyManagement />}
        {tabValue === 1 && <CommercialManagement />}
        {tabValue === 2 && <IntroducerManagement />}
      </Box>
    </Container>
  );
};

export default Dashboard;