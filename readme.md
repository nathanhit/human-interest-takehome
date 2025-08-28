# HSA Web Application

A comprehensive Health Savings Account (HSA) web application that demonstrates the core lifecycle of an HSA: account creation, funding, card issuance, and transaction processing with intelligent eligibility validation.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Human\ Interest
   ```

2. **Backend Setup**
   ```bash
   cd hsa-server
   npm install
   
   # Create .env file with your OpenAI API key
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env #placeholder message for default
   echo "JWT_SECRET=your_jwt_secret_here" >> .env #still works without jwt auth
   echo "PORT=5001" >> .env
   
   # Start the server
   npm run dev
   ```
   The backend will run on http://localhost:5001

3. **Frontend Setup**
   ```bash
   cd hsa-app
   npm install
   
   # Start the frontend (use PORT=3001 if 3000 is taken)
   PORT=3001 npm start
   ```
   The frontend will run on http://localhost:3001

4. **Access the Application**
   - Open your browser to http://localhost:3001
   - Register a new account or use the testing page

## 📱 Walkthrough

### Registration
- **User Registration**: Create account with name, email, date of birth, and password
- **Automatic HSA Setup**: HSA account is automatically created upon successful registration
- **Authentication**: JWT-based secure authentication with protected routes

### Dashboard
- **Account Overview**: View HSA balance and account details
- **Virtual Debit Card**: Issue, view, and reissue HSA debit cards with secure number masking
- **Claims Management**: Track submitted claims with color-coded status indicators
- **Recent Activity**: Monitor all HSA transactions and claim submissions

### Deposit Funds and Debit Card
- **Fund Deposits**: Add money to HSA account via routing number simulation
- **Card Issuance**: Generate 16-digit virtual debit card with CVV and expiration
- **Security Features**: Card numbers are masked by default with toggle visibility
- **Card Management**: Reissue new cards when needed

### Transaction Eligibility
- **Public Access**: Submit transactions without login using card number lookup
- **Smart Validation**: Multi-tier eligibility checking system
- **Supporting Documentation**: Upload prescriptions and medical necessity letters
- **Real-time Feedback**: Instant eligibility assessment with confidence scoring

## 🛠 Technical Choices

### Backend Architecture
- **Separated App & Server**: Clean separation for better maintainability and security
- **Express.js**: RESTful API with middleware-based authentication
- **Security Considerations**: JWT tokens, password hashing, input validation
- **In-Memory Database**: TypeScript objects for rapid development and testing

### Frontend Architecture
- **React with TypeScript**: Type-safe component development
- **Conditional Rendering**: UI components render based on authentication state and permissions
- **Context API**: Global state management for authentication and HSA data
- **Material-UI**: Consistent, modern UI components

### Database Design
- **TypeScript Objects**: Arrays instead of Sets/Maps for complex multi-column data
- **Indexing Strategy**: Multiple search patterns across various object properties
- **Data Structure**: Optimized for filtering, searching, and relationship mapping

### Validation System
1. **NLP Algorithm**: String matching against HSA-eligible services database
2. **AI Integration**: OpenAI API calls for confidence scores below 70%
3. **Human Review**: Documentation flagging for manual verification
4. **Multi-tier Confidence**: Graduated approval system based on certainty levels

## Features I Like:

### Status Updates
- **Real-time Claim Tracking**: Live status updates (Pending, Covered, Not Covered)
- **Color-coded Legend**: Visual status indicators with hover explanations
- **Progress Feedback**: Loading states and success confirmations

### User Experience
- **Educational Warnings**: Informative messages about prescription and documentation requirements
- **Proactive Guidance**: Advisory text for claim submissions and eligibility
- **Error Prevention**: Client-side validation before server requests

### Security & Privacy
- **Sensitive Data Masking**: Card numbers and CVV hidden by default
- **Toggle Visibility**: Eye icons for secure viewing of sensitive information
- **Authentication Gates**: Protected routes and API endpoints

### Validation Features
- **Date of Birth Verification**: Age validation for merchant transaction matching
- **Document Support**: File upload for prescriptions and medical necessity letters
- **Confidence Scoring**: Transparent AI assessment explanations

## 🔮 Future Extensions

### Documentation Parsing & Care Management
- **Document Parsing**: AI-powered prescription and letter analysis
- **Receipt Processing**: OCR for automatic expense categorization
- **Spending Analytics**: HSA usage insights and recommendations
- **Compliance Monitoring**: IRS regulation updates and alerts
- **Annual Care Management**: Preventive care checkup reminders and tracking
- **Health Milestone Tracking**: Checkboxes for common preventive services (mammograms, colonoscopies, annual physicals)
- **Care Plan Integration**: Personalized health maintenance schedules


### Enhanced Validation & Verification
- **Advanced Merchant Validation**: Cross-reference with provider databases and legal business verification
- **Identity Verification**: Enhanced date of birth and legal name matching with merchant records
- **Transaction Authentication**: Multi-point verification similar to current HSA/FSA industry standards
- **Real-time Provider Lookup**: Integration with healthcare provider licensing databases
- **Claim Documentation Analysis**: Automated parsing and validation of uploaded supporting documents

### Integration Capabilities
- **Payment API Integration**: Real banking and payment system connections
- **Merchant API**: Direct integration with healthcare providers
- **Insurance Networks**: Provider network validation

### Security Enhancements
- **Multi-factor Authentication**: SMS/email verification
- **Rate Limiting**: API request throttling
- **Audit Logging**: Comprehensive transaction tracking
- **Data Encryption**: Enhanced data protection

### General UI/UX Improvements
- **Enhanced Error Messages**: More specific and actionable user feedback
- **Mobile Responsiveness**: Optimized mobile experience
- **Accessibility Features**: Screen reader support and keyboard navigation

### Competitive Analysis
- **Current System Research**: Analysis of existing HSA platforms
- **Innovation Opportunities**: Identifying improvement areas
- **User Research**: Feedback-driven feature development

## 🧪 Testing

### Backend Tests
```bash
cd hsa-server
npm test
```

### Frontend Development
```bash
cd hsa-app
npm start
# Access testing page at /testing for transaction validation
```

## 📁 Project Structure

```
Human Interest/
├── hsa-app/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── context/        # React Context providers
│   │   ├── api/            # API communication layer
│   │   └── types/          # TypeScript type definitions
│   └── public/
├── hsa-server/             # Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── models/         # Data models
│   │   ├── services/       # Business logic services
│   │   ├── data/           # Static data and databases
│   │   └── __tests__/      # Test suites
│   └── .env               # Environment variables
└── readme.md              # This file
```

## 🔑 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
PORT=5001
NODE_ENV=development
```

## 🚦 Development Status

- ✅ **Core Features**: Complete user registration, HSA management, transaction validation
- ✅ **Security**: JWT authentication, data masking, input validation
- ✅ **AI Integration**: OpenAI-powered eligibility assessment
- ✅ **Documentation**: File upload support for claims
- 🔄 **Testing**: Comprehensive test suite implementation
- 📋 **Deployment**: Production environment setup

---