# Bitcoiner-View
# Bitcoiner View 🧡

A comprehensive Bitcoin-focused financial dashboard that provides real-time insights, economic analysis, and Bitcoin-denominated price comparisons across various asset classes.

## 🚀 Features

### 📊 Bitcoin Dashboard
- **Real-time Bitcoin Price**: Live BTC/USD price with 24h change indicators
- **Interactive Charts**: TradingView integration for professional Bitcoin price analysis
- **Market Metrics**: Volume, market cap, and key Bitcoin statistics

### 📈 Stocks/BTC Analysis
- **Top 10 Stocks in Bitcoin**: View major stocks (AAPL, MSFT, GOOGL, etc.) priced in bits
- **Interactive Stock Charts**: Click any stock card to view 10-year historical performance vs Bitcoin
- **Logarithmic Scale**: Professional log-scale charts showing Bitcoin's superior performance
- **Real-time Conversion**: Live stock prices converted to Bitcoin equivalents

### 🏛️ Macro Economic Indicators
- **Asset Market Cap Treemap**: Interactive visualization of global asset classes ($900T total)
  - Real Estate ($330T), Bonds ($300T), Money ($120T), Equities ($115T)
  - Gold ($16T), Art ($18T), Cars & Collectibles ($6T), Bitcoin ($1T)
- **Historical Economic Data** (35+ years):
  - Core PCE inflation rates
  - Federal Funds Rate
  - US Treasury 10-Year Yields
  - Federal Budget Deficit/Surplus
- **Interactive Asset Explanations**: Click any asset for detailed descriptions

### 💰 Bitcoin Spending Calculator
- **Multi-Category Spending**: Add multiple spending categories with different amounts
- **Historical Price Integration**: Optional date selection for accurate historical Bitcoin prices
- **Real-time Calculations**: Live Bitcoin conversion using current or historical rates
- **Spending History**: Track and analyze past Bitcoin spending patterns
- **Savings Analysis**: Calculate Bitcoin saved vs traditional currency

### 🎓 College Tuition in Bitcoin
- **Harvard Tuition Tracker**: Historical Harvard tuition costs in Bitcoin
- **Top 5 Most Expensive Universities**: Bitcoin-denominated tuition comparison
- **Trend Analysis**: Visualize how education costs have changed in Bitcoin terms

### 🏠 Personal CPI Calculator
- **Custom Inflation Tracking**: Create personalized Consumer Price Index
- **12 Category System**: Animal products, grains, clothing, education, energy, etc.
- **Weighted Calculations**: Low (1x), Medium (5x), High (10x) importance weights
- **Bitcoin Hedge Analysis**: Compare personal inflation vs Bitcoin performance

### 📞 Contact & Consulting
- **Bitcoin Consulting Services**: Professional Bitcoin education and security guidance
- **Contact Form**: Direct messaging system for inquiries and support
- **Security Best Practices**: Expert guidance on Bitcoin storage and security

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js, D3.js, TradingView Widgets
- **APIs**: 
  - CoinGecko API (Bitcoin prices)
  - Formspree (contact form)
  - Alpha Vantage (stock data)
- **Styling**: Custom CSS with Bitcoin orange theme (#f7931a)
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
bitcoin-price-chart/
├── index.html              # Main dashboard page
├── spending.html           # Bitcoin spending calculator
├── macro.html             # Macro economic indicators
├── contact.html           # Contact and consulting page
├── styles.css             # Main stylesheet
├── script-new.js          # Core JavaScript functionality
├── server.js              # Local development server
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for live data feeds
- Optional: Node.js for local development server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bitcoiner-view.git
   cd bitcoiner-view
   ```

2. **Start local server** (optional)
   ```bash
   node server.js
   ```
   Or use any static file server:
   ```bash
   python -m http.server 3000
   # or
   npx serve .
   ```

3. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Or open `index.html` directly in your browser

## 🎯 Usage

### Navigation
- **Dashboard**: Main Bitcoin price and market overview
- **Bitcoin Spending**: Calculate and track Bitcoin expenditures
- **Macro**: Economic indicators and asset class analysis
- **Contact**: Bitcoin consulting and support services

### Key Interactions
- **Stock Cards**: Click any stock to view 10-year Bitcoin price history
- **Asset Treemap**: Click assets for detailed explanations
- **Spending Calculator**: Add multiple categories with optional historical dates
- **CPI Calculator**: Customize weights to match your spending patterns

## 🔧 Configuration

### API Keys
The application uses free APIs that don't require keys for basic functionality:
- **CoinGecko**: Free tier for Bitcoin prices
- **Formspree**: Contact form handling (configure endpoint in contact.html)

### Customization
- **Colors**: Modify CSS variables in `styles.css`
- **Data Sources**: Update API endpoints in `script-new.js`
- **Content**: Edit HTML files for custom messaging

## 📊 Data Sources

- **Bitcoin Prices**: CoinGecko API (real-time and historical)
- **Stock Data**: Alpha Vantage API integration
- **Economic Data**: Approximated historical values (35+ years)
- **Asset Market Caps**: Researched global asset valuations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bitcoin Community**: For inspiration and education
- **TradingView**: Professional charting widgets
- **CoinGecko**: Reliable Bitcoin price data
- **Chart.js & D3.js**: Powerful visualization libraries

## 📧 Contact

For Bitcoin consulting, education, and security guidance:
- **Website**: [Your Website]
- **Email**: thomassemaan10@gmail.com
- **Consulting**: Available for Bitcoin security best practices and education

## 🔮 Roadmap

- [ ] Real-time WebSocket price feeds
- [ ] Additional cryptocurrency support
- [ ] Portfolio tracking functionality
- [ ] Mobile app development
- [ ] Advanced technical analysis tools
- [ ] Multi-language support

---

**Disclaimer**: This tool is for educational and informational purposes only. Not financial advice. Always do your own research before making investment decisions.

Built with 🧡 for the Bitcoin community.

