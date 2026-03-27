# StellarPay - Premium Stellar Wallet dApp

## Project Showcase

### Submission Requirements


### Live Demo
https://stellarpay-eta.vercel.app/

### Pitch Video
https://www.veed.io/view/81316d35-19e5-4715-9ca7-9fde1845e327?source=Homepage&panel=share

### Test Results
![App Screenshot](https://raw.githubusercontent.com/welson-ai/BELT---3/main/public/image.png)

---

A modern, feature-rich Stellar wallet decentralized application with a premium Phantom/Coinbase-style interface. Built with React, Vite, and the Stellar SDK for seamless blockchain interactions on the Stellar Testnet.

## Features

- **Wallet Management**: Create new wallets or import existing ones using secret keys
- **XLM Transactions**: Send and receive Stellar Lumen (XLM) transactions
- **Testnet Integration**: Built-in Friendbot integration for free testnet XLM funding
- **Transaction History**: View detailed transaction history with status tracking
- **Premium UI**: Modern dark theme with glass-morphism effects and smooth animations
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Real-time Updates**: Live balance updates and transaction status tracking

## System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React Application Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  ├── WalletSetup.jsx     - Wallet creation/import UI        │
│  ├── Dashboard.jsx       - Main dashboard interface         │
│  ├── SendPanel.jsx       - Send XLM transaction UI          │
│  └── TransactionList.jsx - Transaction history display      │
├─────────────────────────────────────────────────────────────┤
│  State Management: React Hooks (useState, useEffect, etc.)  │
├─────────────────────────────────────────────────────────────┤
│                    Stellar SDK Layer                        │
│  ├── stellar.js         - Stellar utilities and helpers     │
│  ├── Horizon Server     - Stellar network communication    │
│  └── Transaction Builder - Transaction creation/signing     │
├─────────────────────────────────────────────────────────────┤
│                    Stellar Testnet                           │
│  ├── Friendbot API      - Free XLM funding                 │
│  ├── Horizon Testnet     - Network access                   │
│  └── Stellar Explorer   - Transaction verification        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Wallet Creation**: Generates new keypair using Stellar SDK
2. **Account Funding**: Uses Friendbot API for testnet XLM
3. **Transaction Sending**: Builds, signs, and submits transactions to Horizon
4. **Balance Updates**: Fetches real-time account data from Stellar network
5. **History Tracking**: Retrieves and displays transaction history

## Project Structure

```
stellar-wallet-dapp/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── WalletSetup.jsx      # Wallet creation/import component
│   │   ├── Dashboard.jsx        # Main dashboard with account info
│   │   ├── SendPanel.jsx        # XLM sending interface
│   │   └── TransactionList.jsx  # Transaction history display
│   ├── utils/
│   │   └── stellar.js           # Stellar SDK utilities and API calls
│   ├── tests/
│   │   ├── setup.js            # Test environment configuration
│   │   └── stellar.test.js      # Comprehensive test suite
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles and theme
│   └── App.css                  # App-specific styles
├── index.html                   # HTML template with font imports
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration with testing
└── README.md                   # This file
```

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **CSS3** - Custom CSS with CSS variables and animations

### Blockchain Integration
- **@stellar/stellar-sdk** - Official Stellar JavaScript SDK
- **Stellar Horizon** - Stellar network API client
- **Stellar Testnet** - Development network for testing

### Testing
- **Vitest** - Fast unit testing framework
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM testing utilities
- **jsdom** - DOM environment for testing

### Development Tools
- **ESLint** - Code linting and formatting
- **Google Fonts** - Inter and JetBrains Mono typography

## Key Components

### Stellar Utilities (`src/utils/stellar.js`)
Core blockchain interaction layer providing:
- **Keypair Management**: Generate, validate, and restore Stellar keypairs
- **Account Operations**: Balance checking, transaction history
- **Transaction Building**: Create and sign XLM payment transactions
- **Network Integration**: Horizon server communication and Friendbot funding

### Wallet Setup (`src/components/WalletSetup.jsx`)
Onboarding interface with:
- **New Wallet Creation**: Generate fresh keypairs with secure display
- **Wallet Import**: Restore existing wallets from secret keys
- **Security Features**: Copy-to-clipboard functionality and key warnings
- **Validation**: Real-time secret key validation

### Dashboard (`src/components/Dashboard.jsx`)
Main user interface featuring:
- **Account Overview**: Balance display and account metadata
- **Quick Actions**: Friendbot funding and refresh functionality
- **Tab Navigation**: Overview, Send, and History sections
- **Real-time Updates**: Live balance and transaction status

### Send Panel (`src/components/SendPanel.jsx`)
Transaction interface with:
- **Recipient Validation**: Public key validation and formatting
- **Amount Controls**: XLM amount input with validation
- **Memo Support**: Optional transaction memos
- **Success Handling**: Transaction confirmation and explorer links

## Testing

Comprehensive test suite covering:
- **Keypair Generation**: Validation of keypair creation and restoration
- **Address Validation**: Public key and secret key validation
- **Formatting Utilities**: Address and XLM amount formatting
- **Integration Tests**: End-to-end workflow validation

Run tests:
```bash
npm test                # Run all tests
npm run test:watch     # Run tests in watch mode
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Git for version control

### Installation
1. Clone the repository:
```bash
git clone https://github.com/welson-ai/BELT---3.git
cd BELT---3
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open http://localhost:5173 in your browser

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## Network Configuration

### Stellar Testnet
The application runs on the Stellar Testnet, providing:
- **Free XLM**: Use Friendbot to fund accounts with 10,000 XLM
- **No Real Value**: Safe environment for testing and development
- **Full Features**: Access to all Stellar network capabilities

### Network Endpoints
- **Horizon Server**: https://horizon-testnet.stellar.org
- **Friendbot**: https://friendbot.stellar.org
- **Explorer**: https://stellar.expert/explorer/testnet

## Security Considerations

### Key Management
- **Client-side**: Private keys never leave the user's browser
- **No Storage**: Keys are not persisted in localStorage or cookies
- **User Responsibility**: Users must securely store their own secret keys

### Best Practices
- **Testnet Only**: Designed for Stellar Testnet, not mainnet
- **Education Focus**: Teaches users about secure key management
- **Warning Systems**: Clear warnings about secret key security

## UI/UX Design

### Design System
- **Dark Theme**: Professional dark color palette with indigo/purple accents
- **Glass-morphism**: Modern blur effects and transparency
- **Typography**: Inter for UI, JetBrains Mono for code/addresses
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first responsive design

### Key Design Elements
- **Premium Cards**: Elevated card designs with subtle shadows
- **Ambient Effects**: Background gradients and glow effects
- **Interactive States**: Hover effects and loading animations
- **Accessibility**: Semantic HTML and keyboard navigation

## Future Enhancements

### Planned Features
- **Mainnet Support**: Optional mainnet deployment
- **Multi-asset Support**: Support for Stellar tokens
- **Advanced Transactions**: Multi-signature and path payments
- **Portfolio Tracking**: Enhanced asset management
- **QR Code Support**: Mobile-friendly QR scanning

### Technical Improvements
- **State Management**: Redux/Zustand for complex state
- **PWA Support**: Progressive Web App capabilities
- **Offline Support**: Service worker for offline functionality
- **Performance**: Code splitting and lazy loading

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For questions, suggestions, or issues:
- Create an issue on GitHub
- Review the Stellar documentation at https://stellar.org/developers
- Join the Stellar community Discord

---

**Built with love for the Stellar ecosystem**
