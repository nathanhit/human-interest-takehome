import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppBar 
      position="static"
      sx={{ 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to={isAuthenticated ? '/dashboard' : '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
            HSA Service
          </Link>
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Always show Transaction Submission */}
          <Button color="inherit" component={Link} to="/testing">
            Transaction Submission
          </Button>
          
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1976d2', mr: 1 }}>
                    {user.firstName.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    {user.firstName}
                  </Typography>
                </Box>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
