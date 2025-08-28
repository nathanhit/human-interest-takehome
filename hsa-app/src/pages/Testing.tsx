import React, { useState, useRef } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { useHSA } from '../context/HSAContext';
import { claimsAPI } from '../api';
import axios from 'axios';

interface EligibilityResult {
  eligible: boolean;
  confidence: number;
  service?: {
    name: string;
    category: string;
    irsQualified: boolean;
    requiresPrescription?: boolean;
    requiresLetterOfMedicalNecessity?: boolean;
    description?: string;
  };
  message?: string;
  explanation?: string;
  suggestedServices?: string[];
  suggestedAlternative?: string;
  requiresReview?: boolean;
}

const Testing: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, isAuthenticated } = useAuth();
  const { account, createClaim } = useHSA();
  
  const [cardNumber, setCardNumber] = useState('');
  const [service, setService] = useState('');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<EligibilityResult | null>(null);
  
  const [openClaimDialog, setOpenClaimDialog] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  
  // File upload states
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check eligibility
  const handleCheck = async () => {
    // For non-authenticated flow, require card number
    if (!isAuthenticated && !cardNumber) {
      setError('Please enter your HSA card number');
      return;
    }
    
    if (!service) {
      setError('Please enter a service description');
      return;
    }
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Use appropriate endpoint based on authentication status
      let response;
      if (isAuthenticated) {
        response = await axios.post('http://localhost:5001/api/claims/check-eligibility', {
          service: service
        });
      } else {
        response = await axios.post('http://localhost:5001/api/public/check-eligibility', {
          service: service
        });
      }
      
      setResult(response.data);
      
      if (response.data.suggestedServices) {
        setSuggestions(response.data.suggestedServices);
      } else if (response.data.suggestedAlternative) {
        setSuggestions([response.data.suggestedAlternative]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while checking eligibility');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle selecting a suggested service
  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    setOpenClaimDialog(true);
  };
  
  // File handling functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      
      // Validate file size (max 5MB per file)
      const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setFileError(`Some files exceed the 5MB size limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
        return;
      }
      
      // Add new files to existing files
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
    
    // Reset the input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Submit a claim
  const handleSubmitClaim = async () => {
    if (!providerName || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter valid provider name and amount');
      return;
    }
    
    // For non-authenticated flow, require card number
    if (!isAuthenticated && !cardNumber) {
      setError('Please enter your HSA card number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let success = false;
      // Check if documentation was uploaded - this will force the claim to pending status
      const hasDocumentation = files.length > 0;
      
      // Prepare payload with documentation flag
      const claimData = {
        providerName,
        service: selectedService || service,
        amount: Number(amount),
        hasDocumentation: hasDocumentation,
        documentCount: files.length
      };
      
      if (isAuthenticated) {
        // Use authenticated endpoint
        // In a real implementation, we would upload the files to a server
        if (hasDocumentation) {
          console.log('Supporting documents to upload:', files);
          // Here you would typically upload files to a server using FormData
          // const formData = new FormData();
          // files.forEach(file => formData.append('documents', file));
          // await axios.post('/api/upload', formData);
        }
        
        // Pass documentation flag to backend
        success = await createClaim(
          providerName, 
          selectedService || service, 
          Number(amount), 
          hasDocumentation
        );
      } else {
        // Use public endpoint
        if (hasDocumentation) {
          console.log('Supporting documents to upload:', files);
          // Similar upload logic would go here for public endpoint
        }
        
        const response = await axios.post('http://localhost:5001/api/public/card-transaction', {
          cardNumber,
          ...claimData
        });
        success = response.status === 201;
      }
      
      if (success) {
        setClaimSuccess(true);
        setOpenClaimDialog(false);
        // Reset form
        setService('');
        setCardNumber('');
        setProviderName('');
        setAmount('');
        setResult(null);
        setSuggestions([]);
        setFiles([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred while submitting the claim');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ marginTop: 4, marginBottom: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          HSA Transaction Submission
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
          Process transactions and check HSA eligibility before making a purchase
        </Typography>
        
        {claimSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Claim submitted successfully! View your claim status on the Dashboard.
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Merchant Testing Portal
          </Typography>
          
          <Box component="form" sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Card Number"
              variant="outlined"
              margin="normal"
              value={cardNumber || (account?.cardNumber ? `**** **** **** ${account.cardNumber.slice(-4)}` : '')}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter your HSA card number"
              disabled={isAuthenticated && account?.cardIssued}
              helperText={account?.cardIssued ? "Using your issued HSA card" : "Enter full card number if testing without login"}
              InputProps={{
                style: account?.cardNumber && !cardNumber ? { opacity: 0.7 } : {}
              }}
            />
            
            <TextField
              fullWidth
              label="Service Description"
              variant="outlined"
              margin="normal"
              value={service}
              onChange={(e) => {
                setService(e.target.value);
                // Clear results when user starts typing again
                if (result) {
                  setResult(null);
                  setSuggestions([]);
                }
              }}
              placeholder="Enter the medical service or product"
              multiline
              rows={2}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button 
                variant="contained" 
                onClick={handleCheck}
                disabled={loading || !service}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Checking...' : 'Check Eligibility'}
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
          
          {result && (
            <Box sx={{ mt: 4, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Eligibility Results
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Service: <strong>{service}</strong>
                </Typography>
                <Chip 
                  label={result.eligible ? 'Eligible' : 'Not Eligible'} 
                  color={result.eligible ? 'success' : 'error'} 
                  size="small"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Confidence: {result.confidence}%
                </Typography>
              </Box>
              
              {result.service && (
                <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  {result.service.requiresPrescription && (
                    <Typography variant="body2" color="warning.main">
                      ⚠️ Requires prescription
                    </Typography>
                  )}
                  {result.service.requiresLetterOfMedicalNecessity && (
                    <Typography variant="body2" color="warning.main">
                      ⚠️ Requires letter of medical necessity
                    </Typography>
                  )}
                  {result.service.description && (
                    <Typography variant="body2" color="text.secondary">
                      {result.service.description}
                    </Typography>
                  )}
                </Box>
              )}
              
              {result.explanation && (
                <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    "{result.explanation}"
                  </Typography>
                </Paper>
              )}
              
              {/* Show advisory message for prescription or letter of medical necessity */}
              {(result.service?.requiresPrescription || result.service?.requiresLetterOfMedicalNecessity) && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  {result.service?.requiresPrescription && (
                    <>This service requires a prescription. Please upload your prescription document when submitting.</>
                  )}
                  {result.service?.requiresLetterOfMedicalNecessity && (
                    <>This service requires a letter of medical necessity from your healthcare provider. Please upload it when submitting.</>
                  )}
                </Alert>
              )}
              
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => {
                  setSelectedService(service);
                  setOpenClaimDialog(true);
                }}
                sx={{ mt: 1 }}
                startIcon={
                  (result.service?.requiresPrescription || result.service?.requiresLetterOfMedicalNecessity) ? 
                  <AttachFileIcon /> : undefined
                }
              >
                {(result.service?.requiresPrescription || result.service?.requiresLetterOfMedicalNecessity) ? 
                  'Submit with Documentation' : 
                  (result.eligible ? 'Submit Claim' : 'Submit for Review')}
              </Button>
              
              {!result.eligible && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Non-eligible claims will be submitted for manual review
                </Typography>
              )}
            </Box>
          )}
          
          {suggestions.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Suggested HSA-Eligible Services
              </Typography>
              <Paper variant="outlined" sx={{ mt: 2 }}>
                <List>
                  {suggestions.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        secondaryAction={
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleSelectService(item)}
                          >
                            Use This
                          </Button>
                        }
                      >
                        <ListItemText primary={item} />
                      </ListItem>
                      {index < suggestions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </Paper>
        
        <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            About HSA-Eligible Expenses
          </Typography>
          <Typography paragraph>
            The IRS determines which medical expenses are eligible for tax-free withdrawal using HSA funds.
            Generally, HSA funds can be used to pay for qualified medical expenses such as:
          </Typography>
          <Typography component="ul" sx={{ pl: 3 }}>
            <li>Doctor visits and hospital care</li>
            <li>Dental and vision care</li>
            <li>Prescription medications</li>
            <li>Medical equipment and supplies</li>
            <li>Mental health services</li>
          </Typography>
          <Typography paragraph sx={{ mt: 2 }}>
            This tool helps you verify if a specific service qualifies before making a purchase.
          </Typography>
        </Paper>
      </Box>
      
      {/* Claim Dialog */}
      <Dialog open={openClaimDialog} onClose={() => setOpenClaimDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit HSA Claim</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Submit a claim for the service: <strong>{selectedService || service}</strong>
          </DialogContentText>
          
          {/* Show advisory for documentation requirements */}
          {result && (result.service?.requiresPrescription || result.service?.requiresLetterOfMedicalNecessity) && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2">
                {result.service?.requiresPrescription && 
                  "This service requires a prescription. Please upload your prescription document."}
                {result.service?.requiresLetterOfMedicalNecessity && 
                  "This service requires a letter of medical necessity. Please upload documentation from your healthcare provider."}
              </Typography>
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Provider/Merchant Name"
            fullWidth
            variant="outlined"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          {/* Supporting Documents Upload */}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Supporting Documentation
            </FormLabel>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={handleUploadClick}
                sx={{ mr: 1 }}
              >
                Upload Files
              </Button>
              <Typography variant="caption" color="text.secondary">
                Prescriptions, letters of medical necessity, receipts
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </Box>
            {fileError && (
              <FormHelperText error>{fileError}</FormHelperText>
            )}
            
            {/* File List */}
            {files.length > 0 && (
              <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, mt: 1 }}>
                {files.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </FormControl>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClaimDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitClaim} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Testing;
