import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Popover
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InfoIcon from '@mui/icons-material/Info';
import { useAuth } from '../context/AuthContext';
import { useHSA } from '../context/HSAContext';
import { ClaimStatus } from '../api/claims';

// Auto-create account component
const AutoCreateAccount: React.FC<{ createAccount: () => Promise<boolean> }> = ({ createAccount }) => {
  // Use effect to create account on mount
  React.useEffect(() => {
    createAccount();
  }, [createAccount]);
  
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" gutterBottom>
        Setting up your HSA account...
      </Typography>
      <CircularProgress sx={{ mt: 2 }} />
    </Box>
  );
};

// Card component
const HSACard: React.FC<{
  cardNumber: string;
  cardExpiryDate: string;
  cardholderName: string;
}> = ({ cardNumber, cardExpiryDate, cardholderName }) => {
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showCVC, setShowCVC] = useState(false);
  
  // Generate a CVC number (in a real app this would come from the backend)
  // For demo purposes, we'll derive it from the card number
  const cvc = cardNumber.slice(-3);
  
  // Format card number to show only last 4 digits or full with spaces
  const formatCardNumber = (number: string, showFull: boolean) => {
    // Ensure we have a 16-digit card number
    const cleanNumber = number.replace(/\D/g, '').slice(0, 16);
    
    if (showFull) {
      // Format: XXXX XXXX XXXX XXXX
      return cleanNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    } else {
      // Show only last 4 digits
      return `**** **** **** ${cleanNumber.slice(-4)}`;
    }
  };
  
  // Format expiry date
  const expiryDate = new Date(cardExpiryDate);
  const formattedExpiry = `${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;
  
  return (
    <Box 
      sx={{ 
        width: '100%',
        height: 200,
        bgcolor: 'primary.main',
        borderRadius: 2,
        color: 'white',
        p: 3,
        position: 'relative',
        backgroundImage: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <Typography variant="h6">HSA</Typography>
      </Box>
      
      <Box sx={{ mt: 5, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ letterSpacing: 1, fontFamily: 'monospace' }}>
          {formatCardNumber(cardNumber, showFullNumber)}
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setShowFullNumber(!showFullNumber)}
          sx={{ 
            color: 'white', 
            opacity: 0.8, 
            p: 0.5,
            '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          {showFullNumber ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
        </IconButton>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            CARDHOLDER NAME
          </Typography>
          <Typography variant="body2">
            {cardholderName}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            EXPIRES
          </Typography>
          <Typography variant="body2">
            {formattedExpiry}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Typography variant="caption" sx={{ opacity: 0.8, mr: 1 }}>
              CVC
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setShowCVC(!showCVC)}
              sx={{ 
                color: 'white', 
                opacity: 0.8, 
                p: 0.5,
                '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {showCVC ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Box>
          <Typography variant="body2">
            {showCVC ? cvc : '***'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// Status legend component
const StatusLegend: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const open = Boolean(anchorEl);
  
  const legendItems = [
    { status: ClaimStatus.PENDING, color: 'warning', label: 'Pending', description: 'Transaction is under review or awaiting approval' },
    { status: ClaimStatus.COVERED, color: 'success', label: 'Covered', description: 'Expense is HSA-eligible and has been approved' },
    { status: ClaimStatus.NOT_COVERED, color: 'error', label: 'Not Covered', description: 'Expense is not HSA-eligible' },
    { status: ClaimStatus.MORE_INFO_NEEDED, color: 'info', label: 'More Info Needed', description: 'Additional documentation required' }
  ];
  
  return (
    <>
      <IconButton size="small" onClick={handleClick} aria-label="Status information">
        <InfoIcon fontSize="small" color="action" />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Claim Status Legend
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {legendItems.map((item) => (
              <Box key={item.status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  size="small" 
                  color={item.color as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'} 
                  label={item.label} 
                />
                <Typography variant="body2">{item.description}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Popover>
    </>
  );
};

// Status chip component
const StatusChip: React.FC<{ status: ClaimStatus }> = ({ status }) => {
  let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
  let label: string = status.toString();
  
  switch (status) {
    case ClaimStatus.PENDING:
      color = 'warning';
      label = 'Pending';
      break;
    case ClaimStatus.COVERED:
      color = 'success';
      label = 'Covered';
      break;
    case ClaimStatus.NOT_COVERED:
      color = 'error';
      label = 'Not Covered';
      break;
    case ClaimStatus.MORE_INFO_NEEDED:
      color = 'info';
      label = 'More Info Needed';
      break;
    default:
      color = 'default';
  }
  
  return <Chip size="small" color={color} label={label} />;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { account, claims, loading, error, createAccount, depositFunds, issueCard, reissueCard, refreshData } = useHSA();
  
  const [openDepositFunds, setOpenDepositFunds] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [depositError, setDepositError] = useState('');
  
  // Handle deposit funds
  const handleDepositFunds = async () => {
    setDepositError('');
    
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setDepositError('Please enter a valid amount');
      return;
    }
    
    if (!routingNumber) {
      setDepositError('Please enter a routing number');
      return;
    }
    
    const success = await depositFunds(Number(depositAmount), routingNumber);
    if (success) {
      setOpenDepositFunds(false);
      setDepositAmount('');
      setRoutingNumber('');
    }
  };
  
  // Handle issue card
  const handleIssueCard = async () => {
    await issueCard();
  };

  // Handle reissue card
  const handleReissueCard = async () => {
    await reissueCard();
  };
  
  // Get pending claims count
  const pendingClaimsCount = claims.filter(claim => claim.status === ClaimStatus.PENDING).length;
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ marginTop: 4, marginBottom: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          HSA Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
          Manage your Health Savings Account
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ py: 2 }}>
            <Typography color="error">{error}</Typography>
            <Button variant="outlined" onClick={refreshData} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Box>
        ) : !account ? (
          // No account yet - Auto-create account instead of showing button
          <AutoCreateAccount createAccount={createAccount} />
        ) : (
          // Account exists
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* Left side: Debit Card */}
              <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h5" gutterBottom>
                    Your HSA Card
                  </Typography>
                  
                  {account.cardIssued && account.cardNumber && account.cardExpiryDate ? (
                    <HSACard 
                      cardNumber={account.cardNumber}
                      cardExpiryDate={account.cardExpiryDate}
                      cardholderName={`${user?.firstName} ${user?.lastName}`}
                    />
                  ) : (
                    <Box 
                      sx={{ 
                        height: 200, 
                        bgcolor: '#f5f5f5', 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                      }}
                    >
                      <Typography sx={{ mb: 2 }}>You haven't issued a debit card yet.</Typography>
                      <Button 
                        variant="contained"
                        onClick={handleIssueCard}
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Issue Virtual Card'}
                      </Button>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {account.cardIssued && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={handleReissueCard}
                        disabled={loading}
                      >
                        Reissue Card
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
              
              {/* Right side: Balance and Claims */}
              <Box sx={{ flex: '1 1 400px', minWidth: '300px' }}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h5" gutterBottom>
                      Account Summary
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setOpenDepositFunds(true)}
                      disabled={loading}
                    >
                      Deposit Funds
                    </Button>
                  </Box>
                  
                  <Box sx={{ mb: 4, mt: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {formatCurrency(account.balance)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle1" color="text.secondary">
                      Pending Claims
                    </Typography>
                    <Typography variant="h6">
                      {pendingClaimsCount} pending {pendingClaimsCount === 1 ? 'claim' : 'claims'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
            
            {/* Educational Link */}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                variant="text" 
                color="primary"
                component="a"
                href="https://www.healthequity.com/hsa-qme"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn about HSA-eligible expenses
              </Button>
            </Box>
            
            {/* Claims List */}
            <Box sx={{ mt: 4 }}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ mr: 1 }}>
                    Recent Claims
                  </Typography>
                  <StatusLegend />
                </Box>
                {claims.length === 0 ? (
                  <Typography variant="body1">
                    No claims to display. Your recent claims will appear here.
                  </Typography>
                ) : (
                  <List>
                    {claims.map((claim) => (
                      <React.Fragment key={claim.claimId}>
                        <ListItem>
                          <ListItemText
                            primary={claim.service}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                >
                                  {claim.providerName} - {new Date(claim.date).toLocaleDateString()}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ display: 'block' }}
                                >
                                  {formatCurrency(claim.amount)}
                                </Typography>
                              </>
                            }
                          />
                          <StatusChip status={claim.status} />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </Box>
          </>
        )}
      </Box>
      
      {/* Deposit Funds Dialog */}
      <Dialog open={openDepositFunds} onClose={() => setOpenDepositFunds(false)}>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the amount you want to deposit into your HSA account.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Bank Routing Number"
            fullWidth
            variant="outlined"
            value={routingNumber}
            onChange={(e) => setRoutingNumber(e.target.value)}
          />
          {depositError && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              {depositError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDepositFunds(false)}>Cancel</Button>
          <Button onClick={handleDepositFunds} variant="contained" disabled={loading}>
            {loading ? 'Processing...' : 'Deposit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
