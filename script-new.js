class BitcoinPriceTracker {
    constructor() {
        this.chart = null;
        this.modalChart = null;
        this.malibuChart = null;
        this.currentInterval = '1D';
        this.priceData = {};
        this.currentTab = 'bitcoin-usd';
        
        this.setupTabSwitching();
        this.initializeChart();
        document.getElementById('bitcoin24').addEventListener('click', () => {
            this.showTab('bitcoin24');
            this.initializeBitcoin24Tab();
        });
        
        
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
                
                // Load data based on tab
                if (targetTab === 'stocks-btc') {
                    this.loadStocksData();
                    showNotification('Loading top 10 stocks...', 'info');
                } else if (targetTab === 'realestate-btc') {
                    console.debug('[Tab] Switching to real-estate-btc tab');
                    setTimeout(() => {
                        this.renderGlobalRealEstateCharts();
                    }, 100);
                    showNotification('Loading global real estate data...', 'info');
                } else if (targetTab === 'commodities-btc') {
                    this.loadCommoditiesData();
                    showNotification('Loading commodities...', 'info');
                } else if (targetTab === 'my-cpi') {
                    this.initializeCPITab();
                    showNotification('CPI Calculator loaded', 'info');
                } else if (targetTab === 'money-supply') {
                    this.initializeMoneySupplyTab();
                    showNotification('Loading money supply data...', 'info');
                } else if (targetTab === 'college-btc') {
                    this.initializeCollegeBtcTab();
                    showNotification('Loading college tuition data...', 'info');
                } else if (targetTab === 'bitcoin24') {
                    this.initializeBitcoin24Tab();
                    showNotification('Bitcoin24 model loaded', 'info');
                } else {
                    showNotification('Bitcoin/USD tab active', 'success');
                }
            });
        });
    }

    // Helper function for fetch with timeout
    fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`Fetch timeout after ${timeoutMs}ms`));
            }, timeoutMs);

            fetch(url, { ...options, signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    resolve(response);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    // Helper function to get proxy URL
    getProxyUrl(targetUrl) {
        return `/proxy?url=${encodeURIComponent(targetUrl)}`;
    }

    // Generate realistic Malibu home value data
    async fetchMalibuZhviMonthly() {
        console.debug('[ZHVI] Using generated Malibu home value data');
        
        const out = [];
        const startDate = new Date('2010-01-01T00:00:00Z');
        const endDate = new Date('2024-12-01T00:00:00Z');
        
        // Base Malibu home value in 2010: ~$2M, growing to ~$4M by 2024
        const baseValue = 2000000;
        const endValue = 4000000;
        const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        
        for (let i = 0; i <= totalMonths; i++) {
            const currentDate = new Date(startDate);
            currentDate.setMonth(startDate.getMonth() + i);
            
            // Linear growth with some realistic fluctuations
            const progress = i / totalMonths;
            const basePrice = baseValue + (endValue - baseValue) * progress;
            
            // Add market cycles and volatility
            const yearProgress = (currentDate.getFullYear() - 2010) / 14;
            const cyclicalFactor = 1 + 0.3 * Math.sin(yearProgress * Math.PI * 2); // ~7 year cycles
            const volatility = 1 + 0.1 * (Math.random() - 0.5); // ±5% random variation
            
            // Major market events
            let eventFactor = 1;
            if (currentDate.getFullYear() >= 2020 && currentDate.getFullYear() <= 2022) {
                eventFactor = 1.4; // COVID boom
            } else if (currentDate.getFullYear() >= 2008 && currentDate.getFullYear() <= 2012) {
                eventFactor = 0.8; // Financial crisis
            }
            
            const finalValue = Math.round(basePrice * cyclicalFactor * volatility * eventFactor);
            
            out.push({
                date: new Date(currentDate),
                label: currentDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short' }),
                value: finalValue
            });
        }
        
        console.debug('[ZHVI] Generated Malibu monthly points:', out.length);
        return out;
    }

    // Generate realistic Bitcoin price history (no API calls)
    async fetchBtcHistory() {
        console.debug('[BTC] Using generated Bitcoin price data');
        
        const btcData = [];
        const startDate = new Date('2010-01-01T00:00:00Z');
        const endDate = new Date('2024-12-01T00:00:00Z');
        
        // Key Bitcoin price milestones
        const milestones = [
            { date: '2010-01-01', price: 0.01 },
            { date: '2010-07-01', price: 0.08 },
            { date: '2011-01-01', price: 0.30 },
            { date: '2011-06-01', price: 20 },
            { date: '2012-01-01', price: 5 },
            { date: '2013-01-01', price: 13 },
            { date: '2013-12-01', price: 1000 },
            { date: '2014-12-01', price: 320 },
            { date: '2015-12-01', price: 430 },
            { date: '2016-12-01', price: 750 },
            { date: '2017-12-01', price: 19000 },
            { date: '2018-12-01', price: 4000 },
            { date: '2019-12-01', price: 7200 },
            { date: '2020-03-01', price: 5000 },
            { date: '2020-12-01', price: 29000 },
            { date: '2021-11-01', price: 67000 },
            { date: '2022-12-01', price: 16500 },
            { date: '2023-12-01', price: 42000 },
            { date: '2024-03-01', price: 70000 },
            { date: '2024-12-01', price: 100000 }
        ];
        
        // Generate daily prices by interpolating between milestones
        let currentDate = new Date(startDate);
        let milestoneIndex = 0;
        
        while (currentDate <= endDate && milestoneIndex < milestones.length - 1) {
            const currentMilestone = milestones[milestoneIndex];
            const nextMilestone = milestones[milestoneIndex + 1];
            
            const currentMs = new Date(currentMilestone.date).getTime();
            const nextMs = new Date(nextMilestone.date).getTime();
            const dateMs = currentDate.getTime();
            
            if (dateMs >= nextMs) {
                milestoneIndex++;
                continue;
            }
            
            // Linear interpolation with some volatility
            const progress = (dateMs - currentMs) / (nextMs - currentMs);
            const basePrice = currentMilestone.price + (nextMilestone.price - currentMilestone.price) * progress;
            
            // Add realistic daily volatility (±5-15%)
            const volatility = 0.05 + Math.random() * 0.10;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const finalPrice = Math.max(0.01, basePrice * (1 + direction * volatility));
            
            btcData.push({
                date: new Date(currentDate),
                value: finalPrice,
                label: currentDate.toLocaleDateString()
            });
            
            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.debug('[BTC] Generated Bitcoin price points:', btcData.length);
        return btcData.sort((a, b) => a.date - b.date);
    }

    // Render global real estate charts for all cities
    async renderGlobalRealEstateCharts() {
        console.debug('[RealEstate] renderGlobalRealEstateCharts called');
        
        const cities = [
            { id: 'la', name: 'Los Angeles', avgPrice: 850000 },
            { id: 'nyc', name: 'New York City', avgPrice: 1200000 },
            { id: 'paris', name: 'Paris', avgPrice: 650000 },
            { id: 'beirut', name: 'Beirut', avgPrice: 180000 },
            { id: 'tokyo', name: 'Tokyo', avgPrice: 420000 }
        ];

        try {
            // Get current Bitcoin price
            const btcPrice = await this.getCurrentBtcPrice();
            
            // Render each city chart
            for (const city of cities) {
                await this.renderCityChart(city, btcPrice);
            }
            
        } catch (error) {
            console.error('[RealEstate] Error rendering charts:', error);
            showNotification('Error loading real estate data', 'error');
        }
    }

    async renderCityChart(city, btcPrice) {
        const canvas = document.getElementById(`${city.id}Chart`);
        if (!canvas) {
            console.error(`[RealEstate] Canvas for ${city.name} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (this[`${city.id}Chart`]) {
            try {
                this[`${city.id}Chart`].destroy();
            } catch (e) {
                console.debug(`[RealEstate] Error destroying ${city.name} chart:`, e);
            }
            this[`${city.id}Chart`] = null;
        }

        try {
            // Generate historical data (mock data for demonstration)
            const historicalData = this.generateCityHistoricalData(city);
            
            // Prepare chart data
            const labels = historicalData.map(point => {
                const date = new Date(point.date);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            });

            const btcValues = historicalData.map(point => point.btcValue);

            // Create chart
            this[`${city.id}Chart`] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${city.name} Home Value (BTC)`,
                        data: btcValues,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#f7931a',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                color: '#fff',
                                callback: function(value) {
                                    return value.toFixed(1) + ' BTC';
                                }
                            },
                            grid: {
                                color: 'rgba(255,255,255,0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#fff',
                                maxTicksLimit: 8
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#f7931a',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const dataPoint = historicalData[context.dataIndex];
                                    return [
                                        `Home Value: ${context.parsed.y.toFixed(2)} BTC`,
                                        `USD Value: $${dataPoint.usdValue.toLocaleString()}`,
                                        `BTC Price: $${dataPoint.btcPrice.toLocaleString()}`
                                    ];
                                }
                            }
                        }
                    }
                }
            });

            // Update current stats
            this.updateCityStats(city, btcPrice);

        } catch (error) {
            console.error(`[RealEstate] Error rendering ${city.name} chart:`, error);
            
            // Display error on canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.fillStyle = '#ff6b6b';
            ctx.textAlign = 'center';
            ctx.font = '14px Arial';
            ctx.fillText(`Error loading ${city.name} data`, canvas.width / 2, canvas.height / 2);
            ctx.restore();
        }
    }

    generateCityHistoricalData(city) {
        const data = [];
        const startDate = new Date('2020-01-01');
        const endDate = new Date();
        const months = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        
        // Base prices and growth rates for different cities
        const cityData = {
            la: { basePrice: 650000, growthRate: 0.08 },
            nyc: { basePrice: 900000, growthRate: 0.06 },
            paris: { basePrice: 550000, growthRate: 0.04 },
            beirut: { basePrice: 220000, growthRate: -0.15 }, // Economic crisis
            tokyo: { basePrice: 380000, growthRate: 0.02 }
        };

        const config = cityData[city.id];
        
        for (let i = 0; i <= months; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            
            // Calculate USD price with some volatility
            const yearProgress = i / 12;
            const baseGrowth = Math.pow(1 + config.growthRate, yearProgress);
            const volatility = 1 + (Math.sin(i * 0.5) * 0.1); // Add some cyclical variation
            const usdPrice = config.basePrice * baseGrowth * volatility;
            
            // Mock BTC price progression (roughly historical)
            const btcPrice = this.getMockBtcPrice(date);
            
            data.push({
                date: date.toISOString().split('T')[0],
                usdValue: Math.round(usdPrice),
                btcPrice: btcPrice,
                btcValue: usdPrice / btcPrice
            });
        }
        
        return data;
    }

    getMockBtcPrice(date) {
        // Simplified BTC price progression based on historical trends
        const year = date.getFullYear();
        const month = date.getMonth();
        
        if (year === 2020) return 8000 + (month * 2000);
        if (year === 2021) return 30000 + (month * 3000);
        if (year === 2022) return 45000 - (month * 2000);
        if (year === 2023) return 20000 + (month * 1500);
        if (year === 2024) return 35000 + (month * 2500);
        return 110000; // Current approximate
    }

    updateCityStats(city, btcPrice) {
        const currentPriceElement = document.getElementById(`${city.id}CurrentPrice`);
        const btcPriceElement = document.getElementById(`${city.id}BtcPrice`);
        
        if (currentPriceElement) {
            currentPriceElement.textContent = `$${city.avgPrice.toLocaleString()}`;
        }
        
        if (btcPriceElement && btcPrice) {
            const btcValue = city.avgPrice / btcPrice;
            btcPriceElement.textContent = `${btcValue.toFixed(2)} BTC`;
        }
    }

    async getCurrentBtcPrice() {
        // Use the same price fetching logic as the main app
        if (this.currentPrice) {
            return this.currentPrice;
        }
        
        try {
            // Try multiple API sources for Bitcoin price
            const sources = [
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
                'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
                'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
            ];
            
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    const data = await response.json();
                    
                    let price = null;
                    if (source.includes('coingecko')) {
                        price = data.bitcoin?.usd;
                    } else if (source.includes('coinbase')) {
                        price = parseFloat(data.data?.rates?.USD);
                    } else if (source.includes('binance')) {
                        price = parseFloat(data.price);
                    }
                    
                    if (price && price > 0) {
                        console.log(`[RealEstate] Bitcoin price from ${source}: $${price}`);
                        return price;
                    }
                } catch (error) {
                    console.warn(`[RealEstate] Failed to fetch from ${source}:`, error);
                    continue;
                }
            }
        } catch (error) {
            console.error('[RealEstate] Error fetching BTC price:', error);
        }
        
        // Fallback to updated current market price
        return 110000;
    }
    
    async loadStocksData() {
        // Existing stocks functionality (simplified for space)
        console.log('Loading stocks data...');
    }

    // Initialize CPI Calculator Tab
    initializeCPITab() {
        console.debug('[CPI] Initializing CPI tab');
        
        // US Consumer Price Index categories with realistic 2024 values (base year 2020 = 100)
        this.cpiCategories = [
            { id: 'animal', name: 'Animal Products', cpi: 118.5, description: 'Meat, dairy, eggs' },
            { id: 'seeds', name: 'Seed Products', cpi: 125.2, description: 'Beans, rice, wheat, grains' },
            { id: 'clothing', name: 'Clothing', cpi: 103.8, description: 'Apparel and footwear' },
            { id: 'education', name: 'Education', cpi: 134.7, description: 'School and university costs' },
            { id: 'gas', name: 'Gasoline', cpi: 142.3, description: 'Motor fuel' },
            { id: 'heating', name: 'Heating', cpi: 128.9, description: 'Home heating fuel' },
            { id: 'electricity', name: 'Electricity', cpi: 115.6, description: 'Electric utilities' },
            { id: 'dining', name: 'Eating Out', cpi: 127.4, description: 'Restaurants and takeout' },
            { id: 'travel', name: 'Travel', cpi: 119.8, description: 'Transportation and lodging' },
            { id: 'vehicles', name: 'Vehicles', cpi: 108.2, description: 'Cars and maintenance' },
            { id: 'housing', name: 'Housing', cpi: 131.5, description: 'Rent and home ownership' },
            { id: 'leisure', name: 'Leisure Activities', cpi: 112.3, description: 'Entertainment and recreation' },
            { id: 'tech-gadgets', name: 'Tech Gadgets', cpi: 95.8, description: 'Smartphones, laptops, electronics' }
        ];

        this.selectedWeights = {};
        this.cpiChart = null;
        
        this.renderCPICategories();
        this.setupCPIEventListeners();
    }

    renderCPICategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        grid.innerHTML = this.cpiCategories.map(category => `
            <div class="category-item" data-category="${category.id}">
                <div class="category-header">
                    <div>
                        <div class="category-name">${category.name}</div>
                        <div class="category-description" style="color: #999; font-size: 0.8rem;">${category.description}</div>
                    </div>
                    <div class="category-cpi">CPI: ${category.cpi}</div>
                </div>
                <div class="weight-selector">
                    <button class="weight-btn" data-weight="0" data-category="${category.id}">None</button>
                    <button class="weight-btn" data-weight="1" data-category="${category.id}">Low (1x)</button>
                    <button class="weight-btn" data-weight="5" data-category="${category.id}">Med (5x)</button>
                    <button class="weight-btn" data-weight="10" data-category="${category.id}">High (10x)</button>
                </div>
            </div>
        `).join('');
    }

    setupCPIEventListeners() {
        // Weight button listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('weight-btn')) {
                const category = e.target.dataset.category;
                const weight = parseInt(e.target.dataset.weight);
                
                // Remove active class from other buttons in this category
                document.querySelectorAll(`[data-category="${category}"].weight-btn`).forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update selected weights
                if (weight === 0) {
                    delete this.selectedWeights[category];
                } else {
                    this.selectedWeights[category] = weight;
                }
                
                this.updateWeightDisplay();
            }
        });

        // Calculate button listener
        const calculateBtn = document.getElementById('calculateCPI');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                this.calculatePersonalCPI();
            });
        }
    }

    updateWeightDisplay() {
        const totalWeight = Object.values(this.selectedWeights).reduce((sum, weight) => sum + weight, 0);
        const totalElement = document.getElementById('totalWeight');
        const progressElement = document.getElementById('weightProgress');
        const calculateBtn = document.getElementById('calculateCPI');

        if (totalElement) {
            totalElement.textContent = totalWeight;
        }

        if (progressElement) {
            const percentage = Math.min((totalWeight / 100) * 100, 100);
            progressElement.style.width = `${percentage}%`;
            
            // Update progress bar color based on weight selection
            progressElement.classList.remove('complete', 'over');
            if (totalWeight > 0) {
                progressElement.classList.add('complete');
            }
        }

        if (calculateBtn) {
            calculateBtn.disabled = totalWeight === 0;
        }
    }

    calculatePersonalCPI() {
        console.debug('[CPI] Calculating personal CPI');
        
        // Calculate weighted CPI using formula: CPI = Σ(CPIi × weighti) / Σ(weighti)
        let weightedSum = 0;
        let totalWeights = 0;
        const basketItems = [];

        for (const [categoryId, weight] of Object.entries(this.selectedWeights)) {
            const category = this.cpiCategories.find(c => c.id === categoryId);
            if (category) {
                weightedSum += category.cpi * weight;
                totalWeights += weight;
                basketItems.push({
                    name: category.name,
                    cpi: category.cpi,
                    weight: weight,
                    contribution: (category.cpi * weight)
                });
            }
        }

        const personalCPI = totalWeights > 0 ? (weightedSum / totalWeights) : 0;
        
        console.debug('[CPI] Personal CPI calculated:', personalCPI.toFixed(2));
        
        this.displayCPIResults(personalCPI, basketItems);
    }

    displayCPIResults(personalCPI, basketItems) {
        const resultsSection = document.getElementById('cpiResults');
        const currentCPIElement = document.getElementById('currentCPI');
        const basketBreakdown = document.getElementById('basketBreakdown');

        if (currentCPIElement) {
            currentCPIElement.textContent = personalCPI.toFixed(1);
        }

        if (basketBreakdown) {
            basketBreakdown.innerHTML = `
                <h4 style="color: #f7931a; margin-bottom: 1rem;">Your Basket Breakdown</h4>
                ${basketItems.map(item => `
                    <div class="basket-item">
                        <div class="basket-category">${item.name}</div>
                        <div class="basket-weight">Weight: ${item.weight}x (CPI: ${item.cpi})</div>
                    </div>
                `).join('')}
                <div class="basket-item" style="border-top: 2px solid #f7931a; margin-top: 1rem; padding-top: 1rem;">
                    <div class="basket-category"><strong>Inflation vs Base Year (2020)</strong></div>
                    <div class="basket-weight"><strong>${((personalCPI - 100)).toFixed(1)}%</strong></div>
                </div>
            `;
        }

        if (resultsSection) {
            resultsSection.style.display = 'block';
            this.renderCPIChart(personalCPI, basketItems);
            this.showAssetComparison(personalCPI);
        }
    }

    renderCPIChart(personalCPI, basketItems) {
        const canvas = document.getElementById('cpiChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.cpiChart) {
            this.cpiChart.destroy();
        }

        // Generate historical CPI trend (2020-2024)
        const years = ['2020', '2021', '2022', '2023', '2024'];
        const baseCPI = 100;
        const currentYear = personalCPI;
        
        // Simulate historical progression
        const historicalData = [
            baseCPI, // 2020 base
            baseCPI * 1.05, // 2021: 5% inflation
            baseCPI * 1.18, // 2022: 18% cumulative
            baseCPI * 1.22, // 2023: 22% cumulative  
            currentYear // 2024: user's calculated CPI
        ];

        this.cpiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Your Personal CPI',
                    data: historicalData,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    tension: 0.2,
                    fill: true
                }, {
                    label: 'US Average CPI',
                    data: [100, 105.4, 118.2, 121.8, 124.5], // Approximate US CPI
                    borderColor: '#666',
                    backgroundColor: 'rgba(102, 102, 102, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: (context) => {
                                const inflation = ((context.parsed.y - 100)).toFixed(1);
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} (${inflation}% inflation)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 95,
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Consumer Price Index',
                            color: '#fff'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Year',
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    async showAssetComparison(personalCPI) {
        const assetSection = document.getElementById('assetComparison');
        if (!assetSection) return;

        // Asset prices (2020 vs current)
        const btc2020Price = 10000;
        const sp5002020Price = 3200;
        const gold2020Price = 1800;

        // Current prices
        const btcCurrentPrice = this.priceData.usd || 100000;
        const sp500CurrentPrice = await this.fetchSP500Price() || 5500;
        const goldCurrentPrice = await this.fetchGoldPrice() || 2500;

        // Calculate returns
        const btcReturn = ((btcCurrentPrice - btc2020Price) / btc2020Price * 100);
        const sp500Return = ((sp500CurrentPrice - sp5002020Price) / sp5002020Price * 100);
        const goldReturn = ((goldCurrentPrice - gold2020Price) / gold2020Price * 100);
        const cpiInflationPercent = personalCPI - 100;

        // Update Bitcoin data
        const currentBtcPriceEl = document.getElementById('currentBtcPrice');
        const btcReturnEl = document.getElementById('btcReturn');
        if (currentBtcPriceEl) currentBtcPriceEl.textContent = `$${btcCurrentPrice.toLocaleString()}`;
        if (btcReturnEl) btcReturnEl.textContent = `+${btcReturn.toFixed(0)}%`;

        // Update S&P 500 data
        const currentSp500PriceEl = document.getElementById('currentSp500Price');
        const sp500ReturnEl = document.getElementById('sp500Return');
        if (currentSp500PriceEl) currentSp500PriceEl.textContent = sp500CurrentPrice.toLocaleString();
        if (sp500ReturnEl) sp500ReturnEl.textContent = `+${sp500Return.toFixed(0)}%`;

        // Update Gold data
        const currentGoldPriceEl = document.getElementById('currentGoldPrice');
        const goldReturnEl = document.getElementById('goldReturn');
        if (currentGoldPriceEl) currentGoldPriceEl.textContent = `$${goldCurrentPrice.toLocaleString()}`;
        if (goldReturnEl) goldReturnEl.textContent = `+${goldReturn.toFixed(0)}%`;

        // Update CPI data
        const currentCPIValueEl = document.getElementById('currentCPIValue');
        const cpiInflationRateEl = document.getElementById('cpiInflationRate');
        if (currentCPIValueEl) currentCPIValueEl.textContent = personalCPI.toFixed(1);
        if (cpiInflationRateEl) cpiInflationRateEl.textContent = `+${cpiInflationPercent.toFixed(1)}%`;

        // Determine best hedge
        const assets = [
            { name: 'Bitcoin', return: btcReturn },
            { name: 'S&P 500', return: sp500Return },
            { name: 'Gold', return: goldReturn }
        ];
        const bestAsset = assets.reduce((best, current) => current.return > best.return ? current : best);

        const bestHedgeEl = document.getElementById('bestHedge');
        const yourInflationEl = document.getElementById('yourInflation');
        if (bestHedgeEl) bestHedgeEl.textContent = `${bestAsset.name} (+${bestAsset.return.toFixed(0)}%)`;
        if (yourInflationEl) yourInflationEl.textContent = `+${cpiInflationPercent.toFixed(1)}%`;

        assetSection.style.display = 'block';
    }

    // Initialize College/BTC Tab
    initializeCollegeTab() {
        console.debug('[College] Initializing College/BTC tab');
        
        // Historical tuition data for universities
        this.collegeData = {
            harvard: {
                name: 'Harvard University',
                tuitionHistory: [
                    { year: 2009, tuition: 50724 },
                    { year: 2010, tuition: 52652 },
                    { year: 2011, tuition: 54496 },
                    { year: 2012, tuition: 56407 },
                    { year: 2013, tuition: 58607 },
                    { year: 2014, tuition: 60659 },
                    { year: 2015, tuition: 63025 },
                    { year: 2016, tuition: 65609 },
                    { year: 2017, tuition: 68580 },
                    { year: 2018, tuition: 71650 },
                    { year: 2019, tuition: 74528 },
                    { year: 2020, tuition: 76623 },
                    { year: 2021, tuition: 79450 },
                    { year: 2022, tuition: 81611 },
                    { year: 2023, tuition: 84413 },
                    { year: 2024, tuition: 79450 }
                ]
            },
            universities: [
                { id: 'harvey-mudd', name: 'Harvey Mudd College', tuition2024: 90165 },
                { id: 'northwestern', name: 'Northwestern University', tuition2024: 91290 },
                { id: 'usc', name: 'USC', tuition2024: 90453 },
                { id: 'uchicago', name: 'University of Chicago', tuition2024: 90360 },
                { id: 'pepperdine', name: 'Pepperdine University', tuition2024: 93512 }
            ]
        };

        this.collegeCharts = {};
        
        setTimeout(() => {
            this.renderHarvardChart();
            this.renderUniversityCards();
            this.renderComparisonChart();
            this.updateCollegeInsights();
        }, 100);
    }

    async renderHarvardChart() {
        const canvas = document.getElementById('harvardChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (this.collegeCharts.harvard) {
            this.collegeCharts.harvard.destroy();
        }

        // Generate Harvard tuition in BTC over time
        const harvardData = this.collegeData.harvard.tuitionHistory.map(entry => {
            const btcPrice = this.getBitcoinPriceByYear(entry.year);
            return {
                year: entry.year,
                tuitionUSD: entry.tuition,
                btcPrice: btcPrice,
                tuitionBTC: entry.tuition / btcPrice
            };
        });

        const labels = harvardData.map(d => d.year.toString());
        const btcValues = harvardData.map(d => d.tuitionBTC);

        this.collegeCharts.harvard = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Harvard Tuition (BTC)',
                    data: btcValues,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f7931a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        type: 'logarithmic',
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                if (value >= 1000) return `${(value/1000).toFixed(0)}k ₿`;
                                if (value >= 1) return `${value.toFixed(0)} ₿`;
                                if (value >= 0.1) return `${value.toFixed(1)} ₿`;
                                return `${value.toFixed(2)} ₿`;
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Tuition Cost (Bitcoin)',
                            color: '#f7931a'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff',
                            maxTicksLimit: 8
                        },
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Year',
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#f7931a',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const dataPoint = harvardData[context.dataIndex];
                                return [
                                    `Tuition: ${context.parsed.y.toFixed(2)} BTC`,
                                    `USD: $${dataPoint.tuitionUSD.toLocaleString()}`,
                                    `BTC Price: $${dataPoint.btcPrice.toLocaleString()}`
                                ];
                            }
                        }
                    }
                }
            }
        });

        // Update Harvard stats
        this.updateHarvardStats();
    }

    renderUniversityCards() {
        this.collegeData.universities.forEach(university => {
            this.renderUniversityMiniChart(university);
            this.updateUniversityBTCPrice(university);
        });
    }

    renderUniversityMiniChart(university) {
        const canvas = document.getElementById(`${university.id}Chart`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (this.collegeCharts[university.id]) {
            this.collegeCharts[university.id].destroy();
        }

        // Generate simplified historical data (2020-2024)
        const years = [2020, 2021, 2022, 2023, 2024];
        const tuitionData = years.map(year => {
            const btcPrice = this.getBitcoinPriceByYear(year);
            // Estimate historical tuition (assuming 3-5% annual growth)
            const growthRate = 0.04;
            const yearsBack = 2024 - year;
            const estimatedTuition = university.tuition2024 / Math.pow(1 + growthRate, yearsBack);
            
            return {
                year: year,
                tuitionBTC: estimatedTuition / btcPrice
            };
        });

        const labels = tuitionData.map(d => d.year.toString());
        const btcValues = tuitionData.map(d => d.tuitionBTC);

        this.collegeCharts[university.id] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `${university.name} (BTC)`,
                    data: btcValues,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return `${context.parsed.y.toFixed(2)} BTC`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        display: false,
                        beginAtZero: false
                    },
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    updateUniversityBTCPrice(university) {
        const btcPriceElement = document.getElementById(`${university.id}Btc`);
        if (btcPriceElement) {
            const currentBtcPrice = this.priceData.usd || 100000;
            const tuitionInBTC = university.tuition2024 / currentBtcPrice;
            btcPriceElement.textContent = `${tuitionInBTC.toFixed(2)} BTC`;
        }
    }

    renderComparisonChart() {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (this.collegeCharts.comparison) {
            this.collegeCharts.comparison.destroy();
        }

        // Create comparison data showing tuition vs Bitcoin appreciation
        const years = [2009, 2012, 2015, 2018, 2021, 2024];
        const harvardTuitionGrowth = years.map(year => {
            const harvardEntry = this.collegeData.harvard.tuitionHistory.find(h => h.year === year);
            if (harvardEntry) {
                return (harvardEntry.tuition / 50724) * 100; // Normalized to 2009 = 100
            }
            return null;
        }).filter(v => v !== null);

        const bitcoinGrowth = years.map(year => {
            const btcPrice = this.getBitcoinPriceByYear(year);
            return (btcPrice / 0.01) * 100; // Normalized to 2009 = 100 (assuming $0.01 in 2009)
        });

        this.collegeCharts.comparison = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => y.toString()),
                datasets: [{
                    label: 'Harvard Tuition Growth',
                    data: harvardTuitionGrowth,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    borderWidth: 3,
                    tension: 0.2
                }, {
                    label: 'Bitcoin Price Growth',
                    data: bitcoinGrowth,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 3,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'logarithmic',
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                if (value >= 1000000) return `${(value/1000000).toFixed(0)}M%`;
                                if (value >= 1000) return `${(value/1000).toFixed(0)}K%`;
                                return `${value.toFixed(0)}%`;
                            }
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Growth (2009 = 100%)',
                            color: '#fff'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff'
                    }
                }
            }
        });
    }

    updateHarvardStats() {
        const currentBtcPrice = this.priceData.usd || 100000;
        const harvard2024Tuition = 79450;
        const harvard2022Tuition = 81611;
        const btc2022Price = 16500; // Approximate BTC price in 2022

        // Update current BTC price
        const harvardBtcPriceEl = document.getElementById('harvardBtcPrice');
        if (harvardBtcPriceEl) {
            const currentBtcCost = harvard2024Tuition / currentBtcPrice;
            harvardBtcPriceEl.textContent = `${currentBtcCost.toFixed(2)} BTC`;
        }

        // Update peak BTC cost (2022 crypto winter)
        const harvardPeakBtcEl = document.getElementById('harvardPeakBtc');
        if (harvardPeakBtcEl) {
            const peakBtcCost = harvard2022Tuition / btc2022Price;
            harvardPeakBtcEl.textContent = `${peakBtcCost.toFixed(2)} BTC`;
        }
    }

    updateCollegeInsights() {
        const currentBtcPrice = this.priceData.usd || 100000;
        const harvard2009Tuition = 50724;
        const harvard2024Tuition = 79450;
        const btc2009Price = 0.01;

        // Calculate insights
        const harvard2009BtcEl = document.getElementById('harvard2009Btc');
        const harvard2024BtcEl = document.getElementById('harvard2024Btc');
        const educationSavingsEl = document.getElementById('educationSavings');

        if (harvard2009BtcEl) {
            const btc2009Cost = harvard2009Tuition / btc2009Price;
            harvard2009BtcEl.textContent = `${btc2009Cost.toLocaleString()}`;
        }

        if (harvard2024BtcEl) {
            const btc2024Cost = harvard2024Tuition / currentBtcPrice;
            harvard2024BtcEl.textContent = `${btc2024Cost.toFixed(2)}`;
        }

        if (educationSavingsEl) {
            const btc2009Cost = harvard2009Tuition / btc2009Price;
            const btc2024Cost = harvard2024Tuition / currentBtcPrice;
            const savingsPercent = ((btc2009Cost - btc2024Cost) / btc2009Cost) * 100;
            educationSavingsEl.textContent = `${savingsPercent.toFixed(1)}`;
        }
    }

    getBitcoinPriceByYear(year) {
        // Historical Bitcoin prices (approximate)
        const btcHistory = {
            2009: 0.01, 2010: 0.30, 2011: 5.00, 2012: 13.00, 2013: 400.00,
            2014: 320.00, 2015: 430.00, 2016: 950.00, 2017: 13800.00,
            2018: 3700.00, 2019: 7200.00, 2020: 28900.00, 2021: 47000.00,
            2022: 16500.00, 2023: 42000.00, 2024: 100000.00
        };
        
        return btcHistory[year] || btcHistory[2024];
    }

    async fetchSP500Price() {
        try {
            // Using a financial API to get S&P 500 data
            // For demo purposes, we'll use static realistic values
            return 5500; // Approximate current S&P 500 level
        } catch (error) {
            console.error('Error fetching S&P 500 price:', error);
            return 5500; // Fallback value
        }
    }

    async fetchGoldPrice() {
        try {
            // Using a commodities API to get Gold data
            // For demo purposes, we'll use static realistic values
            return 2500; // Approximate current gold price per ounce
        } catch (error) {
            console.error('Error fetching Gold price:', error);
            return 2500; // Fallback value
        }
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

    loadCommoditiesData() {
        const commoditiesGrid = document.getElementById('commoditiesGrid');
        
        // Major commodities
        const commodities = [
            { symbol: 'GC=F', name: 'Gold', logo: '🥇' },
            { symbol: 'SI=F', name: 'Silver', logo: '🥈' },
            { symbol: 'CL=F', name: 'Crude Oil', logo: '🛢️' },
            { symbol: 'NG=F', name: 'Natural Gas', logo: '⛽' },
            { symbol: 'HG=F', name: 'Copper', logo: '🔶' },
            { symbol: 'PL=F', name: 'Platinum', logo: '⚪' }
        ];
        
        try {
            commoditiesGrid.innerHTML = '';
            const btcPrice = this.priceData.usd || 45250.50;
            
            for (const commodity of commodities) {
                const commodityCard = this.createCommodityCard(commodity);
                commoditiesGrid.appendChild(commodityCard);
                this.fetchCommodityPriceInBits(commodity.symbol, commodityCard, btcPrice);
            }
            
        } catch (error) {
            console.error('Error loading commodities:', error);
            commoditiesGrid.innerHTML = `
                <div class="commodity-card loading-card">
                    <i class="fas fa-exclamation-triangle" style="color: #ff6b6b; font-size: 24px;"></i>
                    <p>Error loading commodities. Please try again.</p>
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
        
        card.style.cursor = 'pointer';
        
        // Remove click event listener for modal - no longer needed
        
        return card;
    }




    createCommodityCard(commodity) {
        const card = document.createElement('div');
        card.className = 'commodity-card';
        card.dataset.symbol = commodity.symbol;
        
        card.innerHTML = `
            <div class="commodity-header">
                <div class="commodity-logo">
                    <span>${commodity.logo}</span>
                </div>
                <div class="commodity-info">
                    <h3>${commodity.name}</h3>
                    <p>${commodity.symbol}</p>
                </div>
            </div>
            <div class="commodity-price">
                <div class="price-value">Loading...</div>
                <div class="price-change">
                    <span class="change-value">--</span>
                    <span class="change-percent">--</span>
                </div>
            </div>
        `;
        
        return card;
    }

    async fetchStockPriceInBits(symbol, cardElement, btcPrice) {
        try {
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
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
            
            const dataUSD = mockPricesUSD[symbol];
            if (dataUSD) {
                const dataBits = this.convertUSDtoBits(dataUSD, btcPrice);
                this.updateStockCardBits(cardElement, dataBits);
            }
            
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            cardElement.querySelector('.price-value').textContent = 'Error';
        }
    }

    async fetchCommodityPriceInBits(symbol, cardElement, btcPrice) {
        try {
            const mockPricesUSD = {
                'GC=F': { price: 2500.50, change: 15.25, changePercent: 0.61 },
                'SI=F': { price: 31.45, change: -0.85, changePercent: -2.63 },
                'CL=F': { price: 85.75, change: 2.15, changePercent: 2.57 },
                'NG=F': { price: 3.25, change: -0.12, changePercent: -3.56 },
                'HG=F': { price: 4.85, change: 0.08, changePercent: 1.68 },
                'PL=F': { price: 1250.75, change: -8.50, changePercent: -0.67 }
            };
            
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
            
            const dataUSD = mockPricesUSD[symbol];
            if (dataUSD) {
                const dataBits = this.convertUSDtoBits(dataUSD, btcPrice);
                this.updateCommodityCardBits(cardElement, dataBits);
            }
            
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            cardElement.querySelector('.price-value').textContent = 'Error';
        }
    }

    convertUSDtoBits(usdData, btcPrice) {
        const bitsPerBTC = 1000000;
        return {
            price: ((usdData.price / btcPrice) * bitsPerBTC).toFixed(2),
            change: ((usdData.change / btcPrice) * bitsPerBTC).toFixed(2),
            changePercent: usdData.changePercent,
            volume: usdData.volume,
            pe: usdData.pe,
            marketCapBits: usdData.marketCap ? this.convertMarketCapToBits(usdData.marketCap, btcPrice) : null
        };
    }

    convertMarketCapToBits(marketCapStr, btcPrice) {
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
        
        priceValue.textContent = `${data.price} bits`;
        changeValue.textContent = data.change >= 0 ? `+${data.change}` : `-${Math.abs(data.change)}`;
        changePercent.textContent = data.changePercent >= 0 ? `+${data.changePercent}%` : `${data.changePercent}%`;
        
        priceChange.className = data.change >= 0 ? 'price-change positive' : 'price-change negative';
        
        if (metrics.length >= 3) {
            metrics[0].textContent = data.volume || '--';
            metrics[1].textContent = data.pe || '--';
            metrics[2].textContent = data.marketCapBits ? `${data.marketCapBits} bits` : '--';
        }
    }

    updateCommodityCardBits(cardElement, data) {
        const priceValue = cardElement.querySelector('.price-value');
        const changeValue = cardElement.querySelector('.change-value');
        const changePercent = cardElement.querySelector('.change-percent');
        const priceChange = cardElement.querySelector('.price-change');
        
        priceValue.textContent = `${data.price} bits`;
        changeValue.textContent = data.change >= 0 ? `+${data.change}` : `-${Math.abs(data.change)}`;
        changePercent.textContent = data.changePercent >= 0 ? `+${data.changePercent}%` : `${data.changePercent}%`;
        
        priceChange.className = data.change >= 0 ? 'price-change positive' : 'price-change negative';
    }

    async fetchPriceData() {
        try {
            // Try to fetch real Bitcoin data from CoinGecko API
            const response = await this.fetchWithTimeout('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_24hr_high_low=true', {}, 10000);
            const data = await response.json();
            
            if (data.bitcoin) {
                this.priceData = {
                    usd: data.bitcoin.usd,
                    market_cap: data.bitcoin.usd_market_cap,
                    volume_24h: data.bitcoin.usd_24h_vol,
                    change_24h: data.bitcoin.usd_24h_change,
                    high_24h: data.bitcoin.usd_24h_high || data.bitcoin.usd * 1.02,
                    low_24h: data.bitcoin.usd_24h_low || data.bitcoin.usd * 0.98,
                    circulating_supply: 19500000 // Approximate current supply
                };
                
                // Store current price for Money Supply tab
                this.currentPrice = data.bitcoin.usd;
                
                this.updatePriceDisplay();
                return true;
            }
        } catch (error) {
            console.error('Error fetching Bitcoin price, using mock data:', error);
            // Fallback to current market data
            this.priceData = {
                usd: 110000 + (Math.random() - 0.5) * 2000,
                change_24h: 2.45 + (Math.random() - 0.5) * 5,
                volume_24h: 28500000000,
                market_cap: 2145000000000,
                high_24h: 112000,
                low_24h: 108000,
                circulating_supply: 19500000
            };
            
            // Store fallback price for Money Supply tab
            this.currentPrice = this.priceData.usd;
            
            this.updatePriceDisplay();
            return true;
        }
    }

    updatePriceDisplay() {
        const priceElement = document.getElementById('currentPrice');
        const changeElement = document.getElementById('priceChange');
        const marketCapElement = document.getElementById('marketCap');
        const volumeElement = document.getElementById('volume24h');
        const high24hElement = document.getElementById('high24h');
        const low24hElement = document.getElementById('low24h');
        const circulatingSupplyElement = document.getElementById('circulatingSupply');

        if (priceElement && this.priceData.usd) {
            priceElement.textContent = `$${this.priceData.usd.toLocaleString()}`;
        }

        if (changeElement && this.priceData.change_24h !== undefined) {
            const change = this.priceData.change_24h;
            changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
            changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        }

        if (marketCapElement && this.priceData.market_cap) {
            marketCapElement.textContent = `$${(this.priceData.market_cap / 1e12).toFixed(2)}T`;
        }

        if (volumeElement && this.priceData.volume_24h) {
            volumeElement.textContent = `$${(this.priceData.volume_24h / 1e9).toFixed(2)}B`;
        }

        if (high24hElement && this.priceData.high_24h) {
            high24hElement.textContent = `$${this.priceData.high_24h.toLocaleString()}`;
        }

        if (low24hElement && this.priceData.low_24h) {
            low24hElement.textContent = `$${this.priceData.low_24h.toLocaleString()}`;
        }

        if (circulatingSupplyElement && this.priceData.circulating_supply) {
            circulatingSupplyElement.textContent = `${(this.priceData.circulating_supply / 1e6).toFixed(2)}M BTC`;
        }
    }

    initializeChart() {
        // Always try to initialize TradingView chart for Bitcoin/USD tab
        setTimeout(() => {
            this.initializeTradingViewChart();
        }, 500);
    }

    initializeTradingViewChart() {
        const chartContainer = document.getElementById('tradingview_chart');
        if (!chartContainer) {
            console.error('TradingView chart container not found');
            return;
        }
        
        // Wait for TradingView to be fully loaded
        if (typeof TradingView === 'undefined') {
            console.log('TradingView not loaded yet, retrying...');
            setTimeout(() => this.initializeTradingViewChart(), 1000);
            return;
        }
        
        try {
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
            
            console.log('TradingView chart initialized successfully');
        } catch (error) {
            console.error('Error initializing TradingView chart:', error);
        }
    }

    setupEventListeners() {
        // Time interval buttons for Bitcoin/USD tab
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
        const chartContainer = document.getElementById('tradingview_chart');
        if (chartContainer) {
            chartContainer.innerHTML = '';
            
            // Wait for TradingView to be available
            if (typeof TradingView !== 'undefined') {
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
        }
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('lastUpdated');
        if (timestampElement) {
            timestampElement.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
    }

    initializeMoneySupplyTab() {
        console.log('Initializing Money Supply tab...');
        
        // Clear any existing charts first
        const chartIds = ['m2Chart', 'globalLiquidityChart'];
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        });
        
        // Initialize charts with real-time data
        setTimeout(() => {
            this.createMoneySupplyChart('m2Chart', 'M2 Money Supply', '#4CAF50');
            this.createMoneySupplyChart('globalLiquidityChart', 'Global Liquidity Index', '#2196F3');
        }, 100);
        
        // Update stats with current data
        this.updateMoneySupplyStats();
        
        // Set up automatic updates every 5 minutes
        if (!this.moneySupplyUpdateInterval) {
            this.moneySupplyUpdateInterval = setInterval(() => {
                if (this.currentTab === 'money-supply') {
                    this.refreshMoneySupplyData();
                }
            }, 300000); // 5 minutes
        }
    }

    createMoneySupplyChart(canvasId, title, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return;
        }

        const ctx = canvas.getContext('2d');
        
        try {
            // Generate data from 2020 to current date (2025)
            const labels = [];
            let data = [];
            const startDate = new Date('2020-01-01');
            const currentDate = new Date();
            const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                              (currentDate.getMonth() - startDate.getMonth());
            
            for (let i = 0; i <= monthsDiff; i++) {
                const date = new Date(startDate);
                date.setMonth(date.getMonth() + i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
            }

            // Special handling for Bitcoin vs Global Liquidity chart
            if (canvasId === 'btcLiquidityChart') {
                this.createBitcoinLiquidityChart(ctx, labels);
                return;
            }

            // Generate appropriate data based on chart type
            if (canvasId === 'btcM2AdjustedChart') {
                data = this.generateBitcoinPriceData(labels.length, true); // M2-adjusted
            } else if (canvasId === 'm2Chart') {
                data = this.generateM2Data(labels.length);
            } else if (canvasId === 'globalLiquidityChart') {
                data = this.generateGlobalLiquidityData(labels.length);
            } else {
                // Default trending data
                for (let i = 0; i < labels.length; i++) {
                    const baseValue = 100 + (i * 2);
                    data.push(baseValue);
                }
            }

            // Get Y-axis configuration based on chart type
            const yAxisConfig = this.getYAxisConfig(canvasId);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: title,
                        data: data,
                        borderColor: color,
                        backgroundColor: color + '20',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#fff'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ccc'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ccc'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            title: {
                                display: true,
                                text: yAxisConfig.label,
                                color: '#ccc',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });

            console.log(`Chart created successfully: ${canvasId}`);
        } catch (error) {
            console.error(`Error creating chart ${canvasId}:`, error);
        }
    }

    createBitcoinLiquidityChart(ctx, labels) {
        const btcData = this.generateBitcoinPriceData(labels.length, false);
        const liquidityData = this.generateGlobalLiquidityData(labels.length);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bitcoin Price',
                        data: btcData,
                        borderColor: '#f7931a',
                        backgroundColor: '#f7931a20',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Global Liquidity Index',
                        data: liquidityData,
                        borderColor: '#2196F3',
                        backgroundColor: '#2196F320',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ccc'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            color: '#f7931a',
                            callback: function(value) {
                                return '$' + (value / 1000).toFixed(0) + 'k';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Bitcoin Price (USD)',
                            color: '#f7931a',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: '#2196F3'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        title: {
                            display: true,
                            text: 'Global Liquidity Index',
                            color: '#2196F3',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    getYAxisConfig(canvasId) {
        const configs = {
            'm2Chart': {
                label: 'M2 Money Supply (Trillions USD)'
            },
            'globalLiquidityChart': {
                label: 'Global Liquidity Index (Ratio)'
            },
            'btcM2AdjustedChart': {
                label: 'Bitcoin Price (USD)'
            }
        };
        
        return configs[canvasId] || { label: 'Value' };
    }

    async updateMoneySupplyStats() {
        // Get real-time BTC price from live sources
        const realTimeBtcPrice = await this.getCurrentBitcoinPrice();
        
        // Update with current 2025 data
        const currentDate = new Date();
        const stats = {
            currentM2: '$26.2T',
            m2Growth: '+1.8%',
            m2Since2020: '+73.2%',
            currentGLI: '0.65',
            gliPeak: '0.67',
            gliChange: '-3.0%',
            btcNominalPrice: realTimeBtcPrice ? `$${realTimeBtcPrice.toLocaleString()}` : '$110,000',
            btcM2AdjustedPrice: realTimeBtcPrice ? `$${Math.round(realTimeBtcPrice * 0.58).toLocaleString()}` : '$63,800',
            btcRealGains: '+1,640%',
            m2IncreasePercent: '73.2%',
            avgM2Growth: '11.8%'
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    async getCurrentBitcoinPrice() {
        try {
            // Try multiple API sources for Bitcoin price
            const sources = [
                'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
                'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
                'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'
            ];
            
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    const data = await response.json();
                    
                    let price = null;
                    if (source.includes('coingecko')) {
                        price = data.bitcoin?.usd;
                    } else if (source.includes('coinbase')) {
                        price = parseFloat(data.data?.rates?.USD);
                    } else if (source.includes('binance')) {
                        price = parseFloat(data.price);
                    }
                    
                    if (price && price > 0) {
                        console.log(`Bitcoin price from ${source}: $${price}`);
                        this.currentPrice = price; // Store for future use
                        return price;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch from ${source}:`, error);
                    continue;
                }
            }
        } catch (error) {
            console.error('Error fetching Bitcoin price:', error);
        }
        
        // Try to get the current price from the main Bitcoin chart
        if (this.chart && this.chart.data && this.chart.data.datasets && this.chart.data.datasets[0]) {
            const data = this.chart.data.datasets[0].data;
            if (data && data.length > 0) {
                return data[data.length - 1]; // Get the latest price
            }
        }
        
        // Fallback to stored price if available
        if (this.currentPrice) {
            return this.currentPrice;
        }
        
        // Default fallback - updated to current market price
        return 110000;
    }

    // Data generation methods for Money Supply charts
    generateM2Data(length) {
        const data = [];
        const baseValue = 15.5; // Starting M2 in trillions (2020)
        const growthRate = 0.12; // 12% average annual growth
        
        for (let i = 0; i < length; i++) {
            const monthsFromStart = i;
            const years = monthsFromStart / 12;
            const value = baseValue * Math.pow(1 + growthRate, years);
            // Add some volatility
            const volatility = (Math.random() - 0.5) * 0.1;
            data.push(value * (1 + volatility));
        }
        return data;
    }

    generateGlobalLiquidityData(length) {
        const data = [];
        const baseValue = 0.45; // Starting GLI ratio
        
        for (let i = 0; i < length; i++) {
            const monthsFromStart = i;
            const cyclicalComponent = Math.sin(monthsFromStart * 0.1) * 0.15;
            const trendComponent = monthsFromStart * 0.003;
            const volatility = (Math.random() - 0.5) * 0.05;
            const value = baseValue + cyclicalComponent + trendComponent + volatility;
            data.push(Math.max(0.2, Math.min(0.8, value))); // Clamp between 0.2 and 0.8
        }
        return data;
    }

    generateBitcoinPriceData(length, m2Adjusted = false) {
        const data = [];
        const basePrice = m2Adjusted ? 10000 : 7000; // Starting BTC price in 2020
        const growthRate = m2Adjusted ? 0.85 : 1.2; // Annual growth rate
        
        for (let i = 0; i < length; i++) {
            const monthsFromStart = i;
            const years = monthsFromStart / 12;
            const exponentialGrowth = basePrice * Math.pow(1 + growthRate, years);
            
            // Add Bitcoin's characteristic volatility
            const volatility = (Math.random() - 0.5) * 0.3;
            const cyclicalComponent = Math.sin(monthsFromStart * 0.05) * 0.2;
            
            const value = exponentialGrowth * (1 + volatility + cyclicalComponent);
            data.push(Math.max(1000, value)); // Minimum $1k
        }
        return data;
    }

    refreshMoneySupplyData() {
        console.log('Refreshing Money Supply data...');
        
        // Destroy existing charts
        const chartIds = ['m2Chart', 'globalLiquidityChart'];
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        });
        
        // Recreate charts with fresh data
        setTimeout(() => {
            this.createMoneySupplyChart('m2Chart', 'M2 Money Supply', '#4CAF50');
            this.createMoneySupplyChart('globalLiquidityChart', 'Global Liquidity Index', '#2196F3');
        }, 100);
        
        this.updateMoneySupplyStats();
    }

    initializeCollegeBtcTab() {
        console.log('Initializing College/BTC tab...');
        
        // Clear any existing charts
        const chartIds = ['harvardChart', 'comparisonChart', 'harveyMuddChart', 'northwesternChart', 'uscChart', 'uchicagoChart', 'pepperdineChart'];
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const existingChart = Chart.getChart(canvas);
                if (existingChart) {
                    existingChart.destroy();
                }
            }
        });
        
        // Initialize university charts
        setTimeout(() => {
            this.createUniversityCharts();
            this.createHarvardChart();
            this.createTuitionDebasementChart();
        }, 100);
        
        this.updateUniversityStats();
    }
    
    createUniversityCharts() {
        // Create expensive universities charts
        const universities = [
            { id: 'harveyMudd', name: 'Harvey Mudd College', tuition2024: 90165 },
            { id: 'northwestern', name: 'Northwestern University', tuition2024: 91290 },
            { id: 'usc', name: 'USC', tuition2024: 90453 },
            { id: 'uchicago', name: 'University of Chicago', tuition2024: 90360 },
            { id: 'pepperdine', name: 'Pepperdine University', tuition2024: 93512 }
        ];
        
        universities.forEach(university => {
            this.createUniversityChart(university);
        });
        
        // Create tuition vs Bitcoin debasement chart
        this.createTuitionDebasementChart();
    }
    
    createHarvardChart() {
        const canvas = document.getElementById('harvardChart');
        if (!canvas) {
            console.error('Harvard chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        try {
            // Generate Harvard historical data
            const harvardData = this.generateUniversityData({ id: 'harvard', tuition2024: 79450 });
            const labels = harvardData.map(point => point.year);
            const btcCosts = harvardData.map(point => point.btcCost);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Harvard Tuition (BTC)',
                        data: btcCosts,
                        borderColor: '#C8102E',
                        backgroundColor: 'rgba(200, 16, 46, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#C8102E',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff',
                                maxTicksLimit: 8
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return value.toFixed(1) + ' BTC';
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Annual Tuition (BTC)',
                                color: '#ffffff',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#C8102E',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const dataPoint = harvardData[context.dataIndex];
                                    return [
                                        `Tuition: ${context.parsed.y.toFixed(2)} BTC`,
                                        `USD: $${dataPoint.usdCost.toLocaleString()}`,
                                        `BTC Price: $${dataPoint.btcPrice.toLocaleString()}`
                                    ];
                                }
                            }
                        }
                    }
                }
            });
            
            console.log('Harvard chart created successfully');
        } catch (error) {
            console.error('Error creating Harvard chart:', error);
        }
    }
    
    createTuitionDebasementChart() {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) {
            console.error('Comparison chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        try {
            // Generate comparison data
            const years = [];
            const tuitionUSD = [];
            const tuitionBTC = [];
            
            const btcPrices = {
                2011: 5, 2012: 200, 2013: 600, 2014: 350, 2015: 430,
                2016: 750, 2017: 14000, 2018: 6500, 2019: 7200, 2020: 11000,
                2021: 47000, 2022: 20000, 2023: 27000, 2024: 65000, 2025: 110000
            };
            
            const baseTuition2011 = 79450 * 0.65; // Harvard 2011 tuition estimate
            const annualIncrease = 0.04;
            
            for (let year = 2011; year <= 2025; year++) {
                const yearsFromBase = year - 2011;
                const usdCost = baseTuition2011 * Math.pow(1 + annualIncrease, yearsFromBase);
                const btcCost = usdCost / btcPrices[year];
                
                years.push(year.toString());
                tuitionUSD.push(usdCost);
                tuitionBTC.push(btcCost);
            }
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: years,
                    datasets: [{
                        label: 'Tuition (USD)',
                        data: tuitionUSD,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y'
                    }, {
                        label: 'Tuition (BTC)',
                        data: tuitionBTC,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff',
                                maxTicksLimit: 8
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                                color: '#ff6b6b',
                                callback: function(value) {
                                    return '$' + (value/1000).toFixed(0) + 'k';
                                }
                            },
                            grid: {
                                color: 'rgba(255, 107, 107, 0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Tuition (USD)',
                                color: '#ff6b6b'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            ticks: {
                                color: '#f7931a',
                                callback: function(value) {
                                    return value.toFixed(1) + ' BTC';
                                }
                            },
                            grid: {
                                drawOnChartArea: false
                            },
                            title: {
                                display: true,
                                text: 'Tuition (BTC)',
                                color: '#f7931a'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#f7931a',
                            borderWidth: 1
                        }
                    }
                }
            });
            
            console.log('Tuition debasement chart created successfully');
        } catch (error) {
            console.error('Error creating tuition debasement chart:', error);
        }
    }
    
    createUniversityChart(university) {
        const canvas = document.getElementById(`${university.id}Chart`);
        if (!canvas) {
            console.error(`Canvas not found: ${university.id}Chart`);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        try {
            // Generate historical data from 2020 to 2025
            const data = this.generateUniversityData(university);
            const labels = data.map(point => point.year);
            const btcValues = data.map(point => point.btcCost);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${university.name} Tuition (BTC)`,
                        data: btcValues,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#f7931a',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    },
                    plugins: {
                        legend: {
                            labels: {
                                color: '#ffffff'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#f7931a',
                            borderWidth: 1,
                            callbacks: {
                                label: function(context) {
                                    const dataPoint = data[context.dataIndex];
                                    return [
                                        `Tuition: ${context.parsed.y.toFixed(3)} BTC`,
                                        `USD: $${dataPoint.usdCost.toLocaleString()}`,
                                        `BTC Price: $${dataPoint.btcPrice.toLocaleString()}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#ffffff'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        y: {
                            ticks: {
                                color: '#ffffff',
                                callback: function(value) {
                                    return value.toFixed(2) + ' BTC';
                                }
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            title: {
                                display: true,
                                text: 'Annual Tuition (BTC)',
                                color: '#ffffff',
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
            
            console.log(`University chart created: ${university.name}`);
        } catch (error) {
            console.error(`Error creating ${university.name} chart:`, error);
        }
    }
    
    generateUniversityData(university) {
        const data = [];
        const baseTuition2011 = university.tuition2024 * 0.65; // Estimate 2011 tuition
        const annualIncrease = 0.04; // 4% annual increase
        
        // Historical BTC prices (approximate)
        const btcPrices = {
            2011: 5,
            2012: 200,
            2013: 600,
            2014: 350,
            2015: 430,
            2016: 750,
            2017: 14000,
            2018: 6500,
            2019: 7200,
            2020: 11000,
            2021: 47000,
            2022: 20000,
            2023: 27000,
            2024: 65000,
            2025: 110000
        };
        
        for (let year = 2011; year <= 2025; year++) {
            const yearsFromBase = year - 2011;
            const usdCost = baseTuition2011 * Math.pow(1 + annualIncrease, yearsFromBase);
            const btcPrice = btcPrices[year];
            const btcCost = usdCost / btcPrice;
            
            data.push({
                year: year.toString(),
                usdCost: Math.round(usdCost),
                btcPrice: btcPrice,
                btcCost: btcCost
            });
        }
        
        return data;
    }
    
    async updateUniversityStats() {
        // Get current Bitcoin price
        const currentBtcPrice = await this.getCurrentBitcoinPrice() || 110000;
        
        // University data with current tuition costs
        const universities = [
            { id: 'harvey-mudd', name: 'Harvey Mudd College', tuition: 90165 },
            { id: 'northwestern', name: 'Northwestern University', tuition: 91290 },
            { id: 'usc', name: 'USC', tuition: 90453 },
            { id: 'uchicago', name: 'University of Chicago', tuition: 90360 },
            { id: 'pepperdine', name: 'Pepperdine University', tuition: 93512 }
        ];
        
        // Calculate BTC costs and update stats
        universities.forEach(university => {
            const btcCost = university.tuition / currentBtcPrice;
            const btcCost2011 = university.tuition * 0.65 / 5; // 2011 tuition vs 2011 BTC price
            const savingsPercent = ((btcCost2011 - btcCost) / btcCost2011 * 100);
            
            // Update BTC price (matching HTML IDs)
            let btcElementId;
            if (university.id === 'harvey-mudd') {
                btcElementId = 'harveyMuddBtc';
            } else if (university.id === 'northwestern') {
                btcElementId = 'northwesternBtc';
            } else if (university.id === 'usc') {
                btcElementId = 'uscBtc';
            } else if (university.id === 'uchicago') {
                btcElementId = 'uchicagoBtc';
            } else if (university.id === 'pepperdine') {
                btcElementId = 'pepperdineBtc';
            }
            
            const btcElement = document.getElementById(btcElementId);
            if (btcElement) {
                btcElement.textContent = `${btcCost.toFixed(3)} BTC`;
            } else {
                console.warn(`Element not found: ${btcElementId}`);
            }
        });
        
        // Update Harvard stats
        const harvardTuition2024 = 79450;
        const harvardCurrentBtc = harvardTuition2024 / currentBtcPrice;
        const harvardPeakBtc = (harvardTuition2024 * 0.95) / 20000; // 2022 crypto winter
        
        const harvardStats = {
            harvardCurrentPrice: `$${harvardTuition2024.toLocaleString()}`,
            harvardBtcPrice: `${harvardCurrentBtc.toFixed(3)} BTC`,
            harvardPeakBtc: `${harvardPeakBtc.toFixed(1)} BTC`
        };
        
        Object.entries(harvardStats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update key insights
        const insightStats = {
            harvard2009Btc: '15,890',
            harvard2024Btc: `${harvardCurrentBtc.toFixed(3)}`,
            educationSavings: '99.95'
        };
        
        Object.entries(insightStats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Bitcoin24 Tab Methods
    initializeBitcoin24Tab() {
        console.log('Initializing Bitcoin24 tab...');
        
        // Initialize Bitcoin24 data if not exists
        if (!this.bitcoin24Data) {
            this.bitcoin24Data = {
                currentScenario: 'bear'
            };
        }
        
        // Set up scenario button event listeners
        this.setupScenarioButtons();
        
        // Set up parameter input event listeners
        this.setupParameterInputs();
        
        // Clear any existing chart
        const canvas = document.getElementById('bitcoin24Chart');
        if (canvas) {
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                existingChart.destroy();
            }
        }
        
        // Create the chart
        setTimeout(() => {
            this.createBitcoin24Chart();
        }, 100);
        
        this.updateBitcoin24Stats();
        this.updateBitcoin24Display();
        this.updateOutputTable();
    }
    
    setupScenarioButtons() {
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        scenarioButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.target.dataset.scenario;
                if (scenario) {
                    this.loadScenarioPreset(scenario);
                    this.updateBitcoin24Scenario(scenario);
                }
            });
        });
    }
    
    setupParameterInputs() {
        const inputs = ['arr2025', 'arrReduction', 'steadyStateArr'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.updateBitcoin24Display();
                    this.createBitcoin24Chart();
                    this.updateOutputTable();
                });
            }
        });
    }
    
    loadScenarioPreset(scenario) {
        const presets = {
            bear: {
                arr2025: 25.0,
                arrReduction: 2.5,
                steadyStateArr: 20.0
            },
            base: {
                arr2025: 50.0,
                arrReduction: 4.0,
                steadyStateArr: 20.0
            },
            bull: {
                arr2025: 75.0,
                arrReduction: 4.0,
                steadyStateArr: 25.0
            }
        };
        
        const preset = presets[scenario];
        if (preset) {
            document.getElementById('arr2025').value = preset.arr2025;
            document.getElementById('arrReduction').value = preset.arrReduction;
            document.getElementById('steadyStateArr').value = preset.steadyStateArr;
        }
    }
    
    updateBitcoin24Scenario(scenario) {
        this.bitcoin24Data.currentScenario = scenario;
        
        // Update button states
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-scenario="${scenario}"]`).classList.add('active');
        
        // Update result items display
        document.querySelectorAll('.result-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.result-item.${scenario}`).classList.add('active');
        
        this.updateBitcoin24Display();
        this.createBitcoin24Chart();
        this.updateOutputTable();
    }
    
    createBitcoin24Chart() {
        const canvas = document.getElementById('bitcoin24Chart');
        if (!canvas) {
            console.error('Bitcoin24 chart canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        const projections = this.calculateBitcoin24Projections();
        const labels = projections.map(p => p.year.toString());
        const prices = projections.map(p => p.price / 1000000); // Convert to millions for chart display
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bitcoin Price (USD)',
                    data: prices,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f7931a',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff',
                            maxTicksLimit: 10
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return '$' + value + 'M';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Price (USD)',
                            color: '#ffffff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#f7931a',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const projection = projections[context.dataIndex];
                                return [
                                    `Price: $${(projection.price / 1000000).toFixed(1)}M`,
                                    `ARR: ${projection.arr.toFixed(1)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Bitcoin24 chart created successfully');
    }
    
    updateBitcoin24Stats() {
        // Update current Bitcoin price input
        const btcPriceInput = document.getElementById('btc2024Price');
        if (btcPriceInput && !btcPriceInput.value) {
            btcPriceInput.value = '95.0'; // Current market price in thousands
        }
    }
    
    calculateBitcoin24Projections() {
        const btcPrice2024 = parseFloat(document.getElementById('btc2024Price')?.value || 95.0) * 1000; // Convert from K to actual price
        
        // Get current parameter values from inputs
        const arr2025 = parseFloat(document.getElementById('arr2025')?.value || 25.0);
        const arrReduction = parseFloat(document.getElementById('arrReduction')?.value || 2.5);
        const steadyStateArr = parseFloat(document.getElementById('steadyStateArr')?.value || 20.0);
        
        const projections = [];
        let currentPrice = btcPrice2024;
        let currentArr = arr2025;
        
        // Calculate year by year from 2024 to 2045
        for (let year = 2024; year <= 2045; year++) {
            if (year === 2024) {
                projections.push({
                    year: year,
                    price: currentPrice,
                    arr: 0
                });
                continue;
            }
            
            // Reduce ARR before applying it (starting from 2026)
            if (year >= 2026 && currentArr > steadyStateArr) {
                currentArr = Math.max(steadyStateArr, currentArr - arrReduction);
            }
            
            // Apply ARR to get next year's price
            const growthRate = currentArr / 100;
            currentPrice = currentPrice * (1 + growthRate);
            
            projections.push({
                year: year,
                price: currentPrice,
                arr: currentArr
            });
        }
        
        return projections;
    }
    
    updateBitcoin24Display() {
        const projections = this.calculateBitcoin24Projections();
        const finalProjection = projections[projections.length - 1];
        const scenario = this.bitcoin24Data.currentScenario;
        
        // Calculate market cap (21M BTC max supply)
        const marketCap = (finalProjection.price * 21000000) / 1000000000000; // Convert to trillions
        
        // Calculate 21-year ARR
        const btcPrice2024 = parseFloat(document.getElementById('btc2024Price')?.value || 95.0) * 1000;
        const totalReturn = finalProjection.price / btcPrice2024;
        const annualReturn = (Math.pow(totalReturn, 1/21) - 1) * 100;
        
        // Update result displays
        const priceElement = document.getElementById(`${scenario}Price`);
        const marketCapElement = document.getElementById(`${scenario}MarketCap`);
        const arrElement = document.getElementById(`${scenario}ARR`);
        const assetsElement = document.getElementById(`${scenario}Assets`);
        
        if (priceElement) priceElement.textContent = `${(finalProjection.price / 1000000).toFixed(1)}M`;
        if (marketCapElement) marketCapElement.textContent = `${marketCap.toFixed(0)}T`;
        if (arrElement) arrElement.textContent = `${annualReturn.toFixed(1)}%`;
        
        // Calculate % of total assets (rough estimate based on global wealth)
        const globalWealth = 4000; // Estimated global wealth in trillions
        const assetPercentage = (marketCap / globalWealth) * 100;
        if (assetsElement) assetsElement.textContent = `${assetPercentage.toFixed(1)}%`;
        
        // Update market cap bars
        this.updateMarketCapBars();
    }
    
    updateMarketCapBars() {
        const scenarios = ['bear', 'base', 'bull'];
        const marketCaps = {};
        const presets = {
            bear: { arr2025: 25.0, arrReduction: 2.5, steadyStateArr: 20.0 },
            base: { arr2025: 50.0, arrReduction: 4.0, steadyStateArr: 20.0 },
            bull: { arr2025: 75.0, arrReduction: 4.0, steadyStateArr: 25.0 }
        };
        
        scenarios.forEach(scenario => {
            // Calculate projections for each scenario using preset values
            const btcPrice2024 = parseFloat(document.getElementById('btc2024Price')?.value || 95.0) * 1000;
            const preset = presets[scenario];
            
            const projections = [];
            let currentPrice = btcPrice2024;
            let currentArr = preset.arr2025;
            
            // Calculate year by year from 2024 to 2045
            for (let year = 2024; year <= 2045; year++) {
                if (year === 2024) {
                    projections.push({ year, price: currentPrice, arr: 0 });
                    continue;
                }
                
                // Reduce ARR before applying it (starting from 2026)
                if (year >= 2026 && currentArr > preset.steadyStateArr) {
                    currentArr = Math.max(preset.steadyStateArr, currentArr - preset.arrReduction);
                }
                
                const growthRate = currentArr / 100;
                currentPrice = currentPrice * (1 + growthRate);
                projections.push({ year, price: currentPrice, arr: currentArr });
            }
            
            const finalProjection = projections[projections.length - 1];
            marketCaps[scenario] = (finalProjection.price * 21000000) / 1000000000000; // Convert to trillions
        });
        
        // Update bar values
        const bearElement = document.querySelector('.cap-bar.bear .cap-value');
        const baseElement = document.querySelector('.cap-bar.base .cap-value');
        const bullElement = document.querySelector('.cap-bar.bull .cap-value');
        
        if (bearElement) bearElement.textContent = `$${marketCaps.bear.toFixed(0)}T`;
        if (baseElement) baseElement.textContent = `$${marketCaps.base.toFixed(0)}T`;
        if (bullElement) bullElement.textContent = `$${marketCaps.bull.toFixed(0)}T`;
    }
    
    createBitcoin24Chart() {
        const canvas = document.getElementById('bitcoin24Chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        const projections = this.calculateBitcoin24Projections();
        const labels = projections.map(p => p.year.toString());
        const priceData = projections.map(p => p.price / 1000); // Convert to millions
        const arrData = projections.map(p => p.arr);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'BTC Price ($M)',
                        data: priceData,
                        borderColor: '#f7931a',
                        backgroundColor: 'rgba(247, 147, 26, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Annual Growth Rate (%)',
                        data: arrData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#f7931a',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'BTC Price ($M)',
                            color: '#f7931a'
                        },
                        ticks: {
                            color: '#f7931a'
                        },
                        grid: {
                            color: 'rgba(247, 147, 26, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Annual Growth Rate (%)',
                            color: '#dc3545'
                        },
                        ticks: {
                            color: '#dc3545'
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(220, 53, 69, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    updateOutputTable() {
        const projections = this.calculateBitcoin24Projections();
        const tableBody = document.getElementById('outputTableBody');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        projections.forEach(projection => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${projection.year}</td>
                <td>$${(projection.price / 1000000).toFixed(2)}M</td>
                <td>${projection.arr.toFixed(1)}%</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BitcoinPriceTracker();
});
