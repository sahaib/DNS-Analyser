# 🔍 DNS Analyzer

A modern, interactive DNS zone file analysis tool built with Next.js and TypeScript. This tool provides comprehensive DNS record analysis, security assessment, and visualization capabilities.

## ✨ Features

- 📊 Interactive DNS zone file parsing and analysis
- 🛡️ Security assessment and vulnerability detection
- ☁️ Cloud service integration detection
- 📧 Email configuration analysis (SPF, DKIM, DMARC)
- 🌐 Environment detection (Production, Staging, Development)
- 📈 Visual representation of DNS records
- 📑 Detailed record-by-record analysis
- 💾 Export analysis results to CSV

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sahaib/DNS-Analyser.git
cd DNS-Analyser
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Technology Stack

- **Framework**: Next.js 13+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **UI Components**: Radix UI
- **State Management**: React Hooks

## 🔎 Features in Detail

### DNS Record Analysis
- Parses and analyzes DNS zone files
- Supports all common DNS record types (A, AAAA, MX, CNAME, TXT, NS, etc.)
- TTL analysis and validation

### Security Assessment
- Identifies potential security vulnerabilities
- Detects misconfigured records
- Analyzes email security configurations
- Identifies exposed internal resources

### Cloud Service Detection
- AWS service identification
- Azure service detection
- Google Cloud Platform integration detection
- CDN configuration analysis

### Email Configuration Analysis
- SPF record validation
- DKIM record detection
- DMARC policy analysis
- MX record configuration review

### Visual Analytics
- Record type distribution
- Security status visualization
- Environment categorization
- Service mapping

## 📊 Data Export

The analyzer provides CSV export functionality with detailed information including:
- Record details (Name, TTL, Type, Value)
- Purpose analysis
- Security status
- Detailed record analysis

## 🔒 Security Considerations

The DNS Analyzer performs all analysis client-side, ensuring that sensitive DNS data never leaves your browser. No data is stored or transmitted to external servers.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Sahaib** - *Initial work* - [sahaib](https://github.com/sahaib)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Built with Next.js and TypeScript
- UI components powered by Radix UI and Tailwind CSS 