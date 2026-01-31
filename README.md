# Stellar Frontend - SmoothSend Gasless Demo

A modern, gasless transaction demo built on Stellar, powered by **SmoothSend SDK**.

![Stellar](https://img.shields.io/badge/Stellar-Testnet-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-6-646CFF)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

## ✨ Features

- **🚀 Gasless Transactions** - Send XLM, USDC, and other Stellar assets without paying gas fees
- **💳 Multi-Wallet Support** - Works with Freighter, Lobstr, xBull, and more via Stellar Wallets Kit
- **🎨 Deep Space Theme** - Premium dark UI with glassmorphism and modern aesthetics
- **📦 Claimable Balances** - Send to recipients without trustlines using Stellar's claimable balance feature
- **🔗 Trustline Management** - Easily add trustlines for new assets
- **📊 Real-time Balances** - View your token balances in real-time

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS with custom "Deep Space" theme
- **Stellar SDK**: `@stellar/stellar-sdk`
- **Wallet Integration**: `@creit.tech/stellar-wallets-kit`
- **UI Components**: Custom components with Radix UI primitives

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Stellar wallet (Freighter recommended for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/SmoothSend/stellar-frontend.git
cd stellar-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

The app connects to the SmoothSend Relayer for gasless transactions. By default, it points to `http://localhost:3000`.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Input, etc.)
│   ├── Header.tsx    # App header with navigation
│   ├── Footer.tsx    # App footer
│   ├── WalletConnect.tsx
│   ├── BalanceDisplay.tsx
│   ├── TransferForm.tsx
│   ├── TokenSelector.tsx
│   └── ClaimableBalanceList.tsx
├── lib/
│   ├── stellar.ts    # Stellar SDK utilities
│   ├── wallet.ts     # Wallet integration
│   ├── config.ts     # App configuration
│   └── utils.ts      # Utility functions
└── App.tsx           # Main application
```

## 🔗 Related

- [SmoothSend SDK](https://github.com/SmoothSend/smoothsend-sdk) - The core SDK
- [Stellar Relayer](https://github.com/SmoothSend/stellar-relayer) - The gasless relayer service
- [SmoothSend Docs](https://docs.smoothsend.xyz) - Full documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [SmoothSend](https://smoothsend.xyz)
