import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, getRedirectResult } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Divider, Snackbar } from '@mui/material';
import { LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to log in. Please check your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // First, try to sign in with a popup
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        // If popup is blocked, try redirect method
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error('Error signing in with Google (redirect):', redirectError);
          setError('Failed to sign in with Google. Please try again.');
        }
      } else {
        console.error('Error signing in with Google:', error);
        setError('Failed to sign in with Google. Please try again.');
      }
    }
  };

  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking redirect result:', error);
        setError('Failed to complete Google sign-in. Please try again.');
      }
    };

    checkRedirectResult();
  }, [navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
        <Divider sx={{ width: '100%', my: 2 }}>OR</Divider>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogIn />}
          onClick={handleGoogleSignIn}
          sx={{ mt: 1, mb: 2 }}
        >
          Sign in with Google
        </Button>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  );
};

export default Login;