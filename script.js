class BitcoinPriceTracker {
    constructor() {
        this.chart = null;
        this.currentInterval = '1D';
        this.priceData = {};
        this.currentTab = 'bitcoin-usd';
        
        this.setupTabSwitching();
        this.initializeChart();
        this.setupEventListeners();
        this.fetchPriceData();
        this.updateTimestamp();
        
        // Update price data every 30 seconds
        setInterval(() => {
            this.fetchPriceData();
            this.updateTimestamp();
        }, 30000);
    }
    
    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                e.currentTarget.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                this.currentTab = targetTab;
                
                // Load stocks data if switching to stocks tab
                if (targetTab === 'stocks-btc') {
                    this.loadStocksData();
                    showNotification('Loading top 10 stocks...', 'info');
                } else {
                    showNotification('Bitcoin/USD tab active', 'success');
                }
            });
        });
    }
    
    async loadStocksData() {
        const stocksGrid = document.getElementById('stocksGrid');
        
        // Top 10 stocks by market cap (as of 2024)
        const topStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', logo: 'A' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', logo: 'M' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'G' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', logo: 'A' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'N' },
            { symbol: 'TSLA', name: 'Tesla Inc.', logo: 'T' },
            { symbol: 'META', name: 'Meta Platforms', logo: 'M' },
            { symbol: 'BRK.B', name: 'Berkshire Hathaway', logo: 'B' },
            { symbol: 'V', name: 'Visa Inc.', logo: 'V' },
            { symbol: 'JNJ', name: 'Johnson & Johnson', logo: 'J' }
        ];
        
        try {
            // Clear loading card
            stocksGrid.innerHTML = '';
            
            // Get current Bitcoin price for conversion
            const btcPrice = this.priceData.usd || 45250.50; // Use current BTC price or fallback
            
            // Create stock cards
            for (const stock of topStocks) {
                const stockCard = this.createStockCard(stock);
                stocksGrid.appendChild(stockCard);
                
                // Fetch stock price data and convert to bits
                this.fetchStockPriceInBits(stock.symbol, stockCard, btcPrice);
            }
            
        } catch (error) {
            console.error('Error loading stocks:', error);
            stocksGrid.innerHTML = `
                <div class="stock-card loading-card">
                    <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 24px;"></i>
                    <p>Error loading stocks. Please try again.</p>
                </div>
            `;
        }
    }
    
    createStockCard(stock) {
        const card = document.createElement('div');
        card.className = 'stock-card';
        card.dataset.symbol = stock.symbol;
        
        card.innerHTML = `
            <div class="stock-header">
                <div class="stock-logo">
                    <span>${stock.logo}</span>
                </div>
                <div class="stock-info">
                    <h3>${stock.name}</h3>
                    <p>${stock.symbol}</p>
                </div>
            </div>
            <div class="stock-price">
                <div class="price-value">Loading...</div>
                <div class="price-change">
                    <span class="change-value">--</span>
                    <span class="change-percent">--</span>
                </div>
            </div>
            <div class="stock-metrics">
                <span>
                    <div class="metric-label">Volume</div>
                    <div class="metric-value">--</div>
                </span>
                <span>
                    <div class="metric-label">P/E</div>
                    <div class="metric-value">--</div>
                </span>
                <span>
                    <div class="metric-label">Mkt Cap (bits)</div>
                    <div class="metric-value">--</div>
                </span>
            </div>
        `;
        
        // Add click event to open individual chart
        card.addEventListener('click', (e) => {
            e.preventDefault();
            console.log(`Clicked on ${stock.symbol} - ${stock.name}`);
            this.openStockChart(stock.symbol, stock.name);
        });
        
        // Add cursor pointer style
        card.style.cursor = 'pointer';
        
        return card;
    }
    
    async fetchStockPriceInBits(symbol, cardElement, btcPrice) {
        try {
            // Simulate API call with mock data for demo (USD prices)
            const mockPricesUSD = {
                'AAPL': { price: 175.43, change: 2.15, changePercent: 1.24, volume: '45.2M', pe: '28.5', marketCap: '2.7T' },
                'MSFT': { price: 378.85, change: -1.23, changePercent: -0.32, volume: '23.1M', pe: '32.1', marketCap: '2.8T' },
                'GOOGL': { price: 138.21, change: 3.45, changePercent: 2.56, volume: '28.7M', pe: '25.8', marketCap: '1.7T' },
                'AMZN': { price: 145.86, change: -0.87, changePercent: -0.59, volume: '35.4M', pe: '45.2', marketCap: '1.5T' },
                'NVDA': { price: 875.28, change: 15.67, changePercent: 1.82, volume: '42.8M', pe: '65.3', marketCap: '2.2T' },
                'TSLA': { price: 248.50, change: -5.23, changePercent: -2.06, volume: '78.9M', pe: '62.1', marketCap: '790B' },
                'META': { price: 298.75, change: 8.45, changePercent: 2.91, volume: '18.3M', pe: '24.7', marketCap: '760B' },
                'BRK.B': { price: 421.35, change: 1.85, changePercent: 0.44, volume: '3.2M', pe: '8.9', marketCap: '920B' },
                'V': { price: 267.89, change: 0.95, changePercent: 0.36, volume: '6.8M', pe: '33.2', marketCap: '580B' },
                'JNJ': { price: 156.73, change: -0.45, changePercent: -0.29, volume: '8.1M', pe: '15.4', marketCap: '420B' }
            };
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
            
            const dataUSD = mockPricesUSD[symbol];
            if (dataUSD) {
                // Convert USD prices to bits
                const dataBits = this.convertUSDtoBits(dataUSD, btcPrice);
                this.updateStockCardBits(cardElement, dataBits);
            }
            
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            cardElement.querySelector('.price-value').textContent = 'Error';
        }
    }
    
    convertUSDtoBits(usdData, btcPrice) {
        // 1 BTC = 1,000,000 bits
        const bitsPerBTC = 1000000;
        return {
            price: ((usdData.price / btcPrice) * bitsPerBTC).toFixed(2), // Convert to bits with 2 decimal places
            change: ((usdData.change / btcPrice) * bitsPerBTC).toFixed(2),
            changePercent: usdData.changePercent, // Percentage stays the same
            volume: usdData.volume,
            pe: usdData.pe,
            marketCapBits: this.convertMarketCapToBits(usdData.marketCap, btcPrice)
        };
    }
    
    convertMarketCapToBits(marketCapStr, btcPrice) {
        // Convert market cap from USD to bits (1 BTC = 1,000,000 bits)
        const multipliers = { 'T': 1e12, 'B': 1e9, 'M': 1e6, 'K': 1e3 };
        const match = marketCapStr.match(/^([\d.]+)([TBMK])$/);
        const bitsPerBTC = 1000000;
        
        if (match) {
            const value = parseFloat(match[1]);
            const multiplier = multipliers[match[2]];
            const usdValue = value * multiplier;
            const bitsValue = (usdValue / btcPrice) * bitsPerBTC;
            
            if (bitsValue >= 1e12) {
                return (bitsValue / 1e12).toFixed(2) + 'T';
            } else if (bitsValue >= 1e9) {
                return (bitsValue / 1e9).toFixed(2) + 'B';
            } else if (bitsValue >= 1e6) {
                return (bitsValue / 1e6).toFixed(2) + 'M';
            } else if (bitsValue >= 1e3) {
                return (bitsValue / 1e3).toFixed(2) + 'K';
            } else {
                return bitsValue.toFixed(0);
            }
        }
        return marketCapStr;
    }
    
    updateStockCardBits(cardElement, data) {
        const priceValue = cardElement.querySelector('.price-value');
        const changeValue = cardElement.querySelector('.change-value');
        const changePercent = cardElement.querySelector('.change-percent');
        const priceChange = cardElement.querySelector('.price-change');
        const metrics = cardElement.querySelectorAll('.metric-value');
        
        // Display prices in bits
        priceValue.textContent = `${data.price} bits`;
        changeValue.textContent = data.change >= 0 ? `+${data.change}` : `-${Math.abs(data.change)}`;
        changePercent.textContent = data.changePercent >= 0 ? `+${data.changePercent}%` : `${data.changePercent}%`;
        
        // Set color based on change
        priceChange.className = data.change >= 0 ? 'price-change positive' : 'price-change negative';
        
        // Update metrics (volume stays in original units, market cap in bits)
        metrics[0].textContent = data.volume;
        metrics[1].textContent = data.pe;
        metrics[2].textContent = `${data.marketCapBits} bits`;
    }
    
    openStockChart(symbol, name) {
        console.log(`Opening chart for ${symbol} - ${name}`);
        showNotification(`Opening ${name} chart in bits...`, 'info');
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'chart-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${name} (${symbol}) - Priced in Bitcoin</h2>
                    <button class="close-btn" onclick="this.closest('.chart-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="chart-info">
                        <p>Historical price chart showing ${name} denominated in Bitcoin</p>
                        <small>1 bit = 100 satoshis • 1 Bitcoin = 1,000,000 bits</small>
                    </div>
                    <div class="chart-controls">
                        <div class="time-period-controls">
                            <button class="time-period-btn" data-period="3M">3M</button>
                            <button class="time-period-btn" data-period="6M">6M</button>
                            <button class="time-period-btn" data-period="1Y">1Y</button>
                            <button class="time-period-btn" data-period="2Y">2Y</button>
                            <button class="time-period-btn" data-period="5Y">5Y</button>
                            <button class="time-period-btn active" data-period="lifetime">Lifetime</button>
                        </div>
                        <div class="scale-toggle">
                            <label>Linear</label>
                            <label class="scale-switch">
                                <input type="checkbox" id="scaleToggle-${symbol}">
                                <span class="scale-slider"></span>
                            </label>
                            <label>Log</label>
                        </div>
                    </div>
                    <div class="bits-chart-container" id="bitsChart-${symbol}">
                        <div class="loading-chart">Loading ${name} chart in Bitcoin...</div>
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    // Initialize the bits chart
    setTimeout(() => {
        this.initializeBitsChart(symbol, name);
    }, 500);
}

initializeBitsChart(symbol, name) {
    const containerId = `bitsChart-${symbol}`;
    const container = document.getElementById(containerId);

    if (!container) return;

    // Clear container and create canvas for Chart.js
    container.innerHTML = '<canvas id="btcChart-' + symbol + '" width="400" height="200"></canvas>';

    // Generate historical BTC-denominated data
    const chartData = this.generateBTCHistoricalData(symbol);

    const ctx = document.getElementById('btcChart-' + symbol).getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: `${name} Price in BTC`,
                data: chartData.btcPrices,
                borderColor: '#f7931a',
                backgroundColor: 'rgba(247, 147, 26, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${name} vs Bitcoin - Full History`,
                    color: '#f7931a',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#888'
                    },
                    grid: {
                        color: '#363c4e'
                    }
                },
                y: {
                    type: 'linear',
                    ticks: {
                        color: '#888',
                        callback: function(value) {
                            return '₿' + value.toFixed(6);
                        }
                    },
                    grid: {
                        color: '#363c4e'
                    },
                    title: {
                        display: true,
                        text: 'Price in Bitcoin (₿)',
                        color: '#f7931a'
                    }
                }
            },
            elements: {
                point: {
                    backgroundColor: '#f7931a',
                    borderColor: '#f7931a',
                    radius: 3,
                    hoverRadius: 6
                }
            }
        });

        // Add event listeners for controls
        this.setupChartControls(symbol, name);
        
        // Add conversion info
        const stock = {
            'AAPL': { ipo: '1980', name: 'Apple' },
            'MSFT': { ipo: '1986', name: 'Microsoft' },
            'GOOGL': { ipo: '2004', name: 'Google' },
            'AMZN': { ipo: '1997', name: 'Amazon' },
            'NVDA': { ipo: '1999', name: 'NVIDIA' },
            'TSLA': { ipo: '2010', name: 'Tesla' },
            'META': { ipo: '2012', name: 'Meta' },
            'BRK.B': { ipo: '1996', name: 'Berkshire Hathaway' },
            'V': { ipo: '2008', name: 'Visa' },
            'JNJ': { ipo: '1944', name: 'Johnson & Johnson' }
        }[symbol];
        
        const startYear = Math.max(parseInt(stock.ipo), 2009);
        
        const noteDiv = document.createElement('div');
        noteDiv.className = 'bits-conversion-note';
        noteDiv.innerHTML = `
            <i class="fas fa-bitcoin"></i>
            <span>Full history from ${startYear} to 2024 showing ${name} priced in Bitcoin. Current: <strong>₿${this.getCurrentStockPriceInBTC(symbol)} BTC</strong> (${this.getCurrentStockPriceInBits(symbol)} bits)</span>
        `;
        container.parentElement.insertBefore(noteDiv, container);
    }
    
    setupChartControls(symbol, name) {
        const modal = document.querySelector('.chart-modal');
        const periodButtons = modal.querySelectorAll('.time-period-btn');
        const scaleToggle = modal.querySelector(`#scaleToggle-${symbol}`);
        
        // Time period button handlers
        periodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                periodButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChartData(symbol, name, btn.dataset.period, scaleToggle.checked);
            });
        });
        
        // Scale toggle handler
        scaleToggle.addEventListener('change', () => {
            const activePeriod = modal.querySelector('.time-period-btn.active').dataset.period;
            this.updateChartData(symbol, name, activePeriod, scaleToggle.checked);
        });
    }
    
    updateChartData(symbol, name, period, isLogScale) {
        const containerId = `bitsChart-${symbol}`;
        const container = document.getElementById(containerId);
        
        if (!container) return;
        
        // Clear and recreate canvas
        container.innerHTML = '<canvas id="btcChart-' + symbol + '" width="400" height="200"></canvas>';
        
        // Generate data for selected period
        const chartData = this.generateBTCHistoricalData(symbol, period);
        
        const ctx = document.getElementById('btcChart-' + symbol).getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: `${name} Price in BTC`,
                    data: chartData.btcPrices,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${name} vs Bitcoin - ${period === 'lifetime' ? 'Full History' : period.toUpperCase()}`,
                        color: '#f7931a',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#888'
                        },
                        grid: {
                            color: '#363c4e'
                        }
                    },
                    y: {
                        type: isLogScale ? 'logarithmic' : 'linear',
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return '₿' + value.toFixed(6);
                            }
                        },
                        grid: {
                            color: '#363c4e'
                        },
                        title: {
                            display: true,
                            text: `Price in Bitcoin (₿) - ${isLogScale ? 'Log' : 'Linear'} Scale`,
                            color: '#f7931a'
                        }
                    }
                },
                elements: {
                    point: {
                        backgroundColor: '#f7931a',
                        borderColor: '#f7931a',
                        radius: 3,
                        hoverRadius: 6
    }
    
    getCurrentStockPriceInBits(symbol) {
        const mockPricesUSD = {
            'AAPL': 175.43, 'MSFT': 378.85, 'GOOGL': 138.21, 'AMZN': 145.86,
            'NVDA': 875.28, 'TSLA': 248.50, 'META': 298.75, 'BRK.B': 421.35,
            'V': 267.89, 'JNJ': 156.73
        };
        
        const usdPrice = mockPricesUSD[symbol] || 100;
        const btcPrice = this.priceData.usd || 45250.50;
        const bitsPrice = ((usdPrice / btcPrice) * 1000000).toFixed(2);
        
        return bitsPrice;
    }
    
    getCurrentStockPriceInBTC(symbol) {
        const mockPricesUSD = {
            'AAPL': 175.43, 'MSFT': 378.85, 'GOOGL': 138.21, 'AMZN': 145.86,
            'NVDA': 875.28, 'TSLA': 248.50, 'META': 298.75, 'BRK.B': 421.35,
            'V': 267.89, 'JNJ': 156.73
        };
        
        const usdPrice = mockPricesUSD[symbol] || 100;
        const btcPrice = this.priceData.usd || 45250.50;
        const btcPriceFormatted = (usdPrice / btcPrice).toFixed(8);
        
        return btcPriceFormatted;
    }
    
    generateBTCHistoricalData(symbol, period = 'lifetime') {
        const labels = [];
        const btcPrices = [];
        
        // Stock IPO dates and Bitcoin genesis
        const stockData = {
            'AAPL': { ipo: new Date('1980-12-12'), currentPrice: 175.43 },
            'MSFT': { ipo: new Date('1986-03-13'), currentPrice: 378.85 },
            'GOOGL': { ipo: new Date('2004-08-19'), currentPrice: 138.21 },
            'AMZN': { ipo: new Date('1997-05-15'), currentPrice: 145.86 },
            'NVDA': { ipo: new Date('1999-01-22'), currentPrice: 875.28 },
            'TSLA': { ipo: new Date('2010-06-29'), currentPrice: 248.50 },
            'META': { ipo: new Date('2012-05-18'), currentPrice: 298.75 },
            'BRK.B': { ipo: new Date('1996-05-09'), currentPrice: 421.35 },
            'V': { ipo: new Date('2008-03-19'), currentPrice: 267.89 },
            'JNJ': { ipo: new Date('1944-09-25'), currentPrice: 156.73 }
        };
        
        const bitcoinGenesis = new Date('2009-01-03');
        const today = new Date();
        const stock = stockData[symbol];
        
        // Start from the later of Bitcoin genesis or stock IPO
        const startDate = stock.ipo > bitcoinGenesis ? stock.ipo : bitcoinGenesis;
        
        // Generate yearly data points from start to present
        const totalYears = today.getFullYear() - startDate.getFullYear();
        
        for (let year = 0; year <= totalYears; year++) {
            const currentDate = new Date(startDate);
            currentDate.setFullYear(startDate.getFullYear() + year);
            
            if (currentDate > today) break;
            
            labels.push(currentDate.getFullYear().toString());
            
            // Historical Bitcoin prices (approximate)
            const btcPriceHistory = this.getBitcoinPriceByYear(currentDate.getFullYear());
            
            // Historical stock prices (simulated growth from IPO)
            const yearsFromIPO = currentDate.getFullYear() - stock.ipo.getFullYear();
            const stockGrowthRate = Math.pow(stock.currentPrice / 10, 1 / (today.getFullYear() - stock.ipo.getFullYear())); // Assume started at $10
            const historicalStockPrice = 10 * Math.pow(stockGrowthRate, yearsFromIPO);
            
            // Calculate stock price in BTC terms
            const stockInBTC = historicalStockPrice / btcPriceHistory;
            btcPrices.push(stockInBTC);
        }
        
        return { labels, btcPrices };
    }
    
    getBitcoinPriceByYear(year) {
        // Approximate historical Bitcoin prices
        const btcHistory = {
            2009: 0.01, 2010: 0.30, 2011: 5.00, 2012: 13.00, 2013: 400.00,
            2014: 320.00, 2015: 430.00, 2016: 950.00, 2017: 13800.00,
            2018: 3700.00, 2019: 7200.00, 2020: 28900.00, 2021: 47000.00,
            2022: 16500.00, 2023: 42000.00, 2024: 45250.00
        };
        
        return btcHistory[year] || btcHistory[2024];
    }
    
    initializeChart() {
        // Wait for TradingView script to load
        if (typeof TradingView === 'undefined') {
            setTimeout(() => this.initializeChart(), 100);
            return;
        }
        
        // Initialize TradingView chart
        this.chart = new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "BITSTAMP:BTCUSD",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#1a1a2e",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": false,
            "container_id": "tradingview_chart",
            "studies": [
                "Volume@tv-basicstudies"
            ],
            "overrides": {
                "paneProperties.background": "#1a1a2e",
                "paneProperties.vertGridProperties.color": "#363c4e",
                "paneProperties.horzGridProperties.color": "#363c4e",
                "symbolWatermarkProperties.transparency": 90,
                "scalesProperties.textColor": "#AAA",
                "mainSeriesProperties.candleStyle.wickUpColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.wickDownColor": "#ff6b6b",
                "mainSeriesProperties.candleStyle.upColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.downColor": "#ff6b6b",
                "mainSeriesProperties.candleStyle.borderUpColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.borderDownColor": "#ff6b6b"
            }
        });
    }
    
    setupEventListeners() {
        // Time interval buttons
        const timeButtons = document.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const interval = e.target.dataset.interval;
                this.changeTimeInterval(interval);
            });
        });
    }
    
    changeTimeInterval(interval) {
        // Update active button
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-interval="${interval}"]`).classList.add('active');
        
        this.currentInterval = interval;
        
        // Map intervals to TradingView format
        const intervalMap = {
            '1D': 'D',
            '1W': 'W',
            '1M': 'M',
            '3M': '3M',
            '1Y': '12M'
        };
        
        // Recreate chart with new interval
        document.getElementById('tradingview_chart').innerHTML = '';
        
        // Wait for TradingView to be available
        if (typeof TradingView === 'undefined') {
            setTimeout(() => this.changeInterval(interval), 100);
            return;
        }
        
        this.chart = new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "BITSTAMP:BTCUSD",
            "interval": intervalMap[interval] || 'D',
            "timezone": "Etc/UTC",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#1a1a2e",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": false,
            "container_id": "tradingview_chart",
            "studies": [
                "Volume@tv-basicstudies"
            ],
            "overrides": {
                "paneProperties.background": "#1a1a2e",
                "paneProperties.vertGridProperties.color": "#363c4e",
                "paneProperties.horzGridProperties.color": "#363c4e",
                "symbolWatermarkProperties.transparency": 90,
                "scalesProperties.textColor": "#AAA",
                "mainSeriesProperties.candleStyle.wickUpColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.wickDownColor": "#ff6b6b",
                "mainSeriesProperties.candleStyle.upColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.downColor": "#ff6b6b",
                "mainSeriesProperties.candleStyle.borderUpColor": "#00d4aa",
                "mainSeriesProperties.candleStyle.borderDownColor": "#ff6b6b"
            }
        });
        
        showNotification(`Chart updated to ${interval} view`, 'success');
    }
    
    async fetchPriceData() {
        try {
            // Mock Bitcoin price data for demo
            const mockData = {
                usd: 45250.50 + (Math.random() - 0.5) * 1000, // Simulate price fluctuation
                usd_24h_change: 2.45 + (Math.random() - 0.5) * 5,
                usd_24h_vol: 28500000000,
                market_cap: 885000000000,
                circulating_supply: 19500000,
                high_24h: 46100.25,
                low_24h: 44200.75
            };
            
            this.priceData = mockData;
            this.updatePriceDisplay(mockData);
            
        } catch (error) {
            console.error('Error fetching price data:', error);
            showNotification('Failed to fetch price data', 'error');
        }
    }
    
    updatePriceDisplay(data) {
        // Update Bitcoin price info in the stats cards
        document.getElementById('high24h').textContent = `$${data.high_24h.toLocaleString()}`;
        document.getElementById('low24h').textContent = `$${data.low_24h.toLocaleString()}`;
        document.getElementById('marketCap').textContent = `$${(data.market_cap / 1e9).toFixed(1)}B`;
        document.getElementById('volume24h').textContent = `$${(data.usd_24h_vol / 1e9).toFixed(1)}B`;
        document.getElementById('circulatingSupply').textContent = `${(data.circulating_supply / 1e6).toFixed(2)}M BTC`;
    }
    
    updateTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('lastUpdated').textContent = timeString;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    });
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #00d4aa, #00b894)',
        error: 'linear-gradient(135deg, #ff6b6b, #e55656)',
        info: 'linear-gradient(135deg, #f7931a, #ffb347)'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Initialize the Bitcoin Price Tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for TradingView script to fully load
    setTimeout(() => {
        window.tracker = new BitcoinPriceTracker();
        showNotification('Bitcoin price tracker loaded successfully!', 'success');
    }, 1000);
});

// Handle errors
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please refresh the page.', 'error');
});

// Handle TradingView widget errors
window.addEventListener('message', (event) => {
    if (event.data && event.data.name === 'tv-widget-error') {
        console.error('TradingView widget error:', event.data);
        showNotification('Chart loading failed. Please refresh the page.', 'error');
    }
});
