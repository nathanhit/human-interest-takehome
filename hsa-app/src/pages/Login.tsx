import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Enhanced validation
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      }
      // If not successful, authError will be set in the context and displayed
    } catch (err) {
      setError('Connection error. Please check your internet connection and try again.');
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // More specific field validation
    if (!firstName) {
      setError('First name is required');
      return;
    }
    
    if (!lastName) {
      setError('Last name is required');
      return;
    }
    
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (!dateOfBirth) {
      setError('Date of birth is required');
      return;
    }



    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Date validation
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      setError('Please enter a valid date of birth');
      return;
    }
    
    if (birthDate > today) {
      setError('Date of birth cannot be in the future');
      return;
    }
    
    // Age validation (must be at least 18)
    const ageDiff = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const isAtLeast18 = ageDiff > 18 || (ageDiff === 18 && monthDiff >= 0 && today.getDate() >= birthDate.getDate());
    
    if (!isAtLeast18) {
      setError('You must be at least 18 years old to register');
      return;
    }
    
    try {
      const success = await register(firstName, lastName, email, password, dateOfBirth);
      if (success) {
        navigate('/dashboard');
      }
      // If not successful, authError will be set in the context and displayed
    } catch (err) {
      setError('Connection error. Please check your internet connection and try again.');
    }
  };

  return (
    <div>
      {/* Header with gradient */}
      <Box
        sx={{
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          color: 'white',
          padding: '2rem 0',
          textAlign: 'center',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        }}
      >
        <Container>
          <Typography variant="h3" component="h1" gutterBottom>
            HSA Service
          </Typography>
          <Typography variant="h6">
            Your Health Savings Account Partner
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Login Section */}
        <Box
          sx={{
            marginTop: 4,
            marginBottom: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              maxWidth: 500, 
              width: '100%',
              borderRadius: 2,
            }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
            
            {(error || authError) && (
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: 'error.light', 
                  color: 'error.contrastText', 
                  p: 1.5, 
                  mb: 2, 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'error.main'
                }}
              >
                <Typography variant="body2" align="center">
                  {error || authError}
                </Typography>
              </Paper>
            )}
            
            {tabValue === 0 ? (
              // Login Form
              <form onSubmit={handleLogin}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address or ID Number"
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
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                    }
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
                <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                  For demo: use email "john@example.com" and password "password123"
                </Typography>
              </form>
            ) : (
              // Registration Form
              <form onSubmit={handleRegister}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="register-email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="register-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="register-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="dateOfBirth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                    }
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </Paper>
        </Box>
        
        {/* Info Section */}
        <Box sx={{ marginTop: 4, marginBottom: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
            What Our HSA Service Provides
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* Debit Card Online Banking */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: '#2196F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                  }}
                >
                  💳
                </CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Debit Card Online Banking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Access your HSA funds easily with our debit card. Make qualified medical purchases directly 
                    and manage your card online through our secure dashboard.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            {/* Claim Management */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: '#4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                  }}
                >
                  📋
                </CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Claim Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Submit and track medical expense claims through our intuitive platform. 
                    Get real-time updates on claim status and reimbursements.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            
            {/* HSA Qualifications */}
            <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
              <Card sx={{ height: '100%' }}>
                <CardMedia
                  component="div"
                  sx={{
                    height: 140,
                    backgroundColor: '#FF9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '3rem',
                  }}
                >
                  ✅
                </CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    HSA Qualifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Easily verify if your medical expenses qualify for HSA funds. 
                    Our service helps ensure compliance with IRS regulations for HSA-eligible expenses.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
        
        {/* Additional Info */}
        <Box sx={{ marginTop: 6, marginBottom: 8 }}>
          <Paper sx={{ padding: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
              About Health Savings Accounts
            </Typography>
            <Typography paragraph>
              A Health Savings Account (HSA) is a tax-advantaged savings account available to individuals enrolled
              in high-deductible health plans (HDHPs). Contributions to your HSA are tax-deductible, the funds grow
              tax-free, and withdrawals for qualified medical expenses are tax-free as well.
            </Typography>
            <Typography paragraph>
              With our HSA service, you can easily manage your account, make contributions, track your spending,
              and ensure compliance with IRS regulations.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
