/**
 * HYTRADE TRADING ALGORITHMS
 * ===========================
 * 
 * This file contains the complete implementation of trading algorithms
 * used in the HYTRADE dashboard. These algorithms demonstrate:
 * 
 * 1. Technical Analysis Implementation
 * 2. Risk Management Systems
 * 3. Performance Metrics Calculation
 * 4. Real-time Signal Generation
 * 5. Position Sizing and Portfolio Management
 * 
 * Author: HYTRADE Development Team
 * Date: 2024
 * Version: 1.0.0
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate Simple Moving Average (SMA)
 * @param {Array} prices - Array of price values
 * @param {number} period - Number of periods for calculation
 * @returns {number|null} - SMA value or null if insufficient data
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * @param {Array} prices - Array of price values
 * @param {number} period - Number of periods for calculation
 * @returns {Array} - Array of EMA values
 */
function calculateEMA(prices, period) {
  if (prices.length < period) return [];
  
  const multiplier = 2 / (period + 1);
  const ema = [prices[0]]; // Start with first price
  
  for (let i = 1; i < prices.length; i++) {
    ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 * @param {Array} prices - Array of price values
 * @param {number} period - RSI calculation period (default: 14)
 * @returns {number|null} - RSI value or null if insufficient data
 */
function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return null;
  
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate average gains and losses
  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate Bollinger Bands
 * @param {Array} prices - Array of price values
 * @param {number} period - Moving average period (default: 20)
 * @param {number} stdDev - Standard deviation multiplier (default: 2)
 * @returns {Object|null} - Bollinger Bands object or null if insufficient data
 */
function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return null;
  
  const sma = calculateSMA(prices, period);
  if (!sma) return null;
  
  // Calculate standard deviation
  const recentPrices = prices.slice(-period);
  const variance = recentPrices.reduce((sum, price) => {
    return sum + Math.pow(price - sma, 2);
  }, 0) / period;
  
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (stdDev * standardDeviation),
    middle: sma,
    lower: sma - (stdDev * standardDeviation),
    bandwidth: (2 * stdDev * standardDeviation) / sma
  };
}

/**
 * Calculate Sharpe Ratio
 * @param {Array} returns - Array of return values
 * @param {number} riskFreeRate - Risk-free rate (default: 0.02)
 * @returns {number} - Sharpe ratio
 */
function calculateSharpeRatio(returns, riskFreeRate = 0.02) {
  if (returns.length === 0) return 0;
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - avgReturn, 2);
  }, 0) / returns.length;
  
  const volatility = Math.sqrt(variance);
  return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
}

// ============================================================================
// MOVING AVERAGE CROSSOVER ALGORITHM
// ============================================================================

/**
 * Moving Average Crossover Algorithm
 * 
 * This algorithm generates buy/sell signals when short-term moving average
 * crosses above/below long-term moving average. It's a trend-following strategy.
 */
class MovingAverageCrossover {
  constructor(shortPeriod = 10, longPeriod = 30, riskPerTrade = 2.0) {
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.riskPerTrade = riskPerTrade;
    this.positions = new Map();
    this.tradeHistory = [];
    this.algorithmName = 'Moving Average Crossover';
    this.algorithmType = 'Trend Following';
  }

  /**
   * Generate trading signal based on moving average crossover
   * @param {string} symbol - Stock symbol
   * @param {Array} prices - Historical price data
   * @param {number} currentPrice - Current market price
   * @returns {Object|null} - Trading signal object
   */
  generateSignal(symbol, prices, currentPrice) {
    const shortMA = calculateSMA(prices, this.shortPeriod);
    const longMA = calculateSMA(prices, this.longPeriod);
    
    if (!shortMA || !longMA) return null;

    const currentPosition = this.positions.get(symbol);
    const isLong = currentPosition && currentPosition.side === 'LONG';
    
    // Buy signal: short MA crosses above long MA
    if (shortMA > longMA && !isLong) {
      return {
        action: 'BUY',
        confidence: this.calculateConfidence(shortMA, longMA),
        stopLoss: currentPrice * 0.98, // 2% stop loss
        takeProfit: currentPrice * 1.06, // 6% take profit
        positionSize: this.calculatePositionSize(currentPrice),
        reasoning: `Short MA (${shortMA.toFixed(2)}) crossed above Long MA (${longMA.toFixed(2)})`,
        algorithm: this.algorithmName,
        timestamp: new Date()
      };
    }
    
    // Sell signal: short MA crosses below long MA
    if (shortMA < longMA && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateConfidence(longMA, shortMA),
        stopLoss: null,
        takeProfit: null,
        positionSize: currentPosition.quantity,
        reasoning: `Short MA (${shortMA.toFixed(2)}) crossed below Long MA (${longMA.toFixed(2)})`,
        algorithm: this.algorithmName,
        timestamp: new Date()
      };
    }
    
    return { 
      action: 'HOLD', 
      confidence: 0.5,
      reasoning: 'No crossover detected',
      algorithm: this.algorithmName,
      timestamp: new Date()
    };
  }

  /**
   * Calculate signal confidence based on MA separation
   * @param {number} ma1 - First moving average
   * @param {number} ma2 - Second moving average
   * @returns {number} - Confidence level (0-1)
   */
  calculateConfidence(ma1, ma2) {
    const separation = Math.abs(ma1 - ma2) / ma2;
    return Math.min(0.95, 0.5 + separation * 10);
  }

  /**
   * Calculate position size based on risk management
   * @param {number} price - Current price
   * @param {number} accountBalance - Account balance (default: 100000)
   * @returns {number} - Position size in shares
   */
  calculatePositionSize(price, accountBalance = 100000) {
    const riskAmount = accountBalance * (this.riskPerTrade / 100);
    const stopLossDistance = price * 0.02; // 2% stop loss
    return Math.floor(riskAmount / stopLossDistance);
  }

  /**
   * Execute trade
   * @param {string} symbol - Stock symbol
   * @param {Object} signal - Trading signal
   * @param {number} timestamp - Trade timestamp
   */
  executeTrade(symbol, signal, timestamp) {
    if (signal.action === 'BUY') {
      this.positions.set(symbol, {
        side: 'LONG',
        quantity: signal.positionSize,
        entryPrice: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        timestamp,
        algorithm: this.algorithmName
      });
    } else if (signal.action === 'SELL') {
      const position = this.positions.get(symbol);
      if (position) {
        const pnl = (signal.price - position.entryPrice) * position.quantity;
        this.tradeHistory.push({
          symbol,
          side: 'LONG',
          entryPrice: position.entryPrice,
          exitPrice: signal.price,
          quantity: position.quantity,
          pnl,
          pnlPercent: (pnl / (position.entryPrice * position.quantity)) * 100,
          entryDate: new Date(position.timestamp),
          exitDate: new Date(timestamp),
          duration: Math.ceil((timestamp - position.timestamp) / (1000 * 60 * 60 * 24)),
          algorithm: this.algorithmName,
          confidence: signal.confidence
        });
        this.positions.delete(symbol);
      }
    }
  }

  /**
   * Calculate algorithm performance metrics
   * @returns {Object} - Performance metrics
   */
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const returns = this.tradeHistory.map(trade => trade.pnlPercent / 100);
    const sharpeRatio = calculateSharpeRatio(returns);
    
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0;
    
    const losingTrades = this.tradeHistory.filter(trade => trade.pnl < 0);
    const avgLoss = losingTrades.length > 0 ?
      losingTrades.reduce((sum, trade) => sum + trade.pnl, 0) / losingTrades.length : 0;
    
    const maxDrawdown = this.calculateMaxDrawdown();
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalPnL,
      avgWin,
      avgLoss,
      sharpeRatio,
      maxDrawdown,
      avgConfidence: this.tradeHistory.length > 0 ? 
        this.tradeHistory.reduce((sum, trade) => sum + trade.confidence, 0) / this.tradeHistory.length : 0
    };
  }

  /**
   * Calculate maximum drawdown
   * @returns {number} - Maximum drawdown percentage
   */
  calculateMaxDrawdown() {
    if (this.tradeHistory.length === 0) return 0;
    
    let peak = 0;
    let maxDD = 0;
    let runningPnL = 0;
    
    for (const trade of this.tradeHistory) {
      runningPnL += trade.pnl;
      if (runningPnL > peak) peak = runningPnL;
      const drawdown = ((peak - runningPnL) / peak) * 100;
      if (drawdown > maxDD) maxDD = drawdown;
    }
    
    return maxDD;
  }
}

// ============================================================================
// RSI MEAN REVERSION ALGORITHM
// ============================================================================

/**
 * RSI Mean Reversion Algorithm
 * 
 * This algorithm uses RSI oscillator to identify overbought/oversold conditions
 * and generates mean reversion signals.
 */
class RSIMeanReversion {
  constructor(rsiPeriod = 14, oversoldLevel = 30, overboughtLevel = 70, riskPerTrade = 1.5) {
    this.rsiPeriod = rsiPeriod;
    this.oversoldLevel = oversoldLevel;
    this.overboughtLevel = overboughtLevel;
    this.riskPerTrade = riskPerTrade;
    this.positions = new Map();
    this.tradeHistory = [];
    this.algorithmName = 'RSI Mean Reversion';
    this.algorithmType = 'Mean Reversion';
  }

  /**
   * Generate trading signal based on RSI
   * @param {string} symbol - Stock symbol
   * @param {Array} prices - Historical price data
   * @param {number} currentPrice - Current market price
   * @returns {Object|null} - Trading signal object
   */
  generateSignal(symbol, prices, currentPrice) {
    const rsi = calculateRSI(prices, this.rsiPeriod);
    if (!rsi) return null;

    const currentPosition = this.positions.get(symbol);
    const isLong = currentPosition && currentPosition.side === 'LONG';
    
    // Buy signal: RSI oversold
    if (rsi < this.oversoldLevel && !isLong) {
      return {
        action: 'BUY',
        confidence: this.calculateRSIConfidence(rsi, this.oversoldLevel),
        stopLoss: currentPrice * 0.95, // 5% stop loss
        takeProfit: currentPrice * 1.10, // 10% take profit
        positionSize: this.calculateRSIPositionSize(rsi),
        reasoning: `RSI oversold at ${rsi.toFixed(1)}, mean reversion opportunity`,
        algorithm: this.algorithmName,
        rsi: rsi,
        timestamp: new Date()
      };
    }
    
    // Sell signal: RSI overbought
    if (rsi > this.overboughtLevel && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateRSIConfidence(rsi, this.overboughtLevel),
        stopLoss: null,
        takeProfit: null,
        positionSize: currentPosition.quantity,
        reasoning: `RSI overbought at ${rsi.toFixed(1)}, potential reversal`,
        algorithm: this.algorithmName,
        rsi: rsi,
        timestamp: new Date()
      };
    }
    
    return { 
      action: 'HOLD', 
      confidence: 0.5,
      reasoning: `RSI at ${rsi.toFixed(1)} - neutral zone`,
      algorithm: this.algorithmName,
      rsi: rsi,
      timestamp: new Date()
    };
  }

  /**
   * Calculate confidence based on RSI extreme values
   * @param {number} rsi - Current RSI value
   * @param {number} threshold - RSI threshold (oversold/overbought)
   * @returns {number} - Confidence level (0-1)
   */
  calculateRSIConfidence(rsi, threshold) {
    const distance = Math.abs(rsi - threshold);
    return Math.min(0.95, 0.5 + (distance / threshold) * 0.5);
  }

  /**
   * Position sizing based on RSI strength
   * @param {number} rsi - Current RSI value
   * @param {number} baseSize - Base position size (default: 100)
   * @returns {number} - Position size in shares
   */
  calculateRSIPositionSize(rsi, baseSize = 100) {
    const rsiStrength = Math.abs(rsi - 50) / 50; // Distance from neutral
    return Math.floor(baseSize * (1 + rsiStrength));
  }

  /**
   * Execute trade with RSI-based position sizing
   * @param {string} symbol - Stock symbol
   * @param {Object} signal - Trading signal
   * @param {number} timestamp - Trade timestamp
   */
  executeTrade(symbol, signal, timestamp) {
    if (signal.action === 'BUY') {
      const positionSize = this.calculateRSIPositionSize(signal.rsi);
      this.positions.set(symbol, {
        side: 'LONG',
        quantity: positionSize,
        entryPrice: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        rsi: signal.rsi,
        timestamp,
        algorithm: this.algorithmName
      });
    } else if (signal.action === 'SELL') {
      const position = this.positions.get(symbol);
      if (position) {
        const pnl = (signal.price - position.entryPrice) * position.quantity;
        this.tradeHistory.push({
          symbol,
          side: 'LONG',
          entryPrice: position.entryPrice,
          exitPrice: signal.price,
          quantity: position.quantity,
          pnl,
          pnlPercent: (pnl / (position.entryPrice * position.quantity)) * 100,
          entryDate: new Date(position.timestamp),
          exitDate: new Date(timestamp),
          duration: Math.ceil((timestamp - position.timestamp) / (1000 * 60 * 60 * 24)),
          algorithm: this.algorithmName,
          confidence: signal.confidence,
          entryRSI: position.rsi,
          exitRSI: signal.rsi
        });
        this.positions.delete(symbol);
      }
    }
  }

  /**
   * Calculate performance with RSI-specific metrics
   * @returns {Object} - Performance metrics
   */
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgRSIEntry = this.tradeHistory.length > 0 ? 
      this.tradeHistory.reduce((sum, trade) => sum + trade.entryRSI, 0) / this.tradeHistory.length : 0;
    const avgRSIExit = this.tradeHistory.length > 0 ?
      this.tradeHistory.reduce((sum, trade) => sum + trade.exitRSI, 0) / this.tradeHistory.length : 0;
    
    const returns = this.tradeHistory.map(trade => trade.pnlPercent / 100);
    const sharpeRatio = calculateSharpeRatio(returns);
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      winRate,
      totalPnL,
      sharpeRatio,
      avgRSIEntry,
      avgRSIExit,
      rsiEffectiveness: this.calculateRSIEffectiveness()
    };
  }

  /**
   * Calculate RSI strategy effectiveness
   * @returns {Object} - RSI effectiveness metrics
   */
  calculateRSIEffectiveness() {
    const oversoldTrades = this.tradeHistory.filter(trade => trade.entryRSI < 35);
    const overboughtTrades = this.tradeHistory.filter(trade => trade.entryRSI > 65);
    
    const oversoldWinRate = oversoldTrades.length > 0 ? 
      oversoldTrades.filter(trade => trade.pnl > 0).length / oversoldTrades.length : 0;
    
    const overboughtWinRate = overboughtTrades.length > 0 ?
      overboughtTrades.filter(trade => trade.pnl > 0).length / overboughtTrades.length : 0;
    
    return {
      oversoldWinRate,
      overboughtWinRate,
      totalOversoldTrades: oversoldTrades.length,
      totalOverboughtTrades: overboughtTrades.length
    };
  }
}

// ============================================================================
// BOLLINGER BANDS STRATEGY ALGORITHM
// ============================================================================

/**
 * Bollinger Bands Strategy Algorithm
 * 
 * This algorithm uses Bollinger Bands to identify volatility-based trading
 * opportunities including mean reversion and breakout strategies.
 */
class BollingerBandsStrategy {
  constructor(period = 20, standardDeviations = 2, riskPerTrade = 2.5) {
    this.period = period;
    this.standardDeviations = standardDeviations;
    this.riskPerTrade = riskPerTrade;
    this.positions = new Map();
    this.tradeHistory = [];
    this.algorithmName = 'Bollinger Bands Strategy';
    this.algorithmType = 'Volatility';
  }

  /**
   * Generate trading signal based on Bollinger Bands
   * @param {string} symbol - Stock symbol
   * @param {Array} prices - Historical price data
   * @param {number} currentPrice - Current market price
   * @returns {Object|null} - Trading signal object
   */
  generateSignal(symbol, prices, currentPrice) {
    const bands = calculateBollingerBands(prices, this.period, this.standardDeviations);
    if (!bands) return null;

    const currentPosition = this.positions.get(symbol);
    const isLong = currentPosition && currentPosition.side === 'LONG';
    
    // Buy signal: Price touches lower band (oversold)
    if (currentPrice <= bands.lower && !isLong) {
      return {
        action: 'BUY',
        confidence: this.calculateBandConfidence(currentPrice, bands.lower, bands.middle),
        stopLoss: bands.lower * 0.98, // 2% below lower band
        takeProfit: bands.middle, // Target middle band
        positionSize: this.calculateVolatilityPositionSize(bands.bandwidth),
        reasoning: `Price touched lower band at ${bands.lower.toFixed(2)}, mean reversion opportunity`,
        algorithm: this.algorithmName,
        bands: bands,
        timestamp: new Date()
      };
    }
    
    // Sell signal: Price touches upper band (overbought)
    if (currentPrice >= bands.upper && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateBandConfidence(currentPrice, bands.upper, bands.middle),
        stopLoss: null,
        takeProfit: null,
        positionSize: currentPosition.quantity,
        reasoning: `Price touched upper band at ${bands.upper.toFixed(2)}, potential reversal`,
        algorithm: this.algorithmName,
        bands: bands,
        timestamp: new Date()
      };
    }
    
    // Breakout signal: Price breaks above upper band
    if (currentPrice > bands.upper && !isLong) {
      return {
        action: 'BUY',
        confidence: this.calculateBreakoutConfidence(currentPrice, bands.upper, bands.bandwidth),
        stopLoss: bands.middle, // Stop at middle band
        takeProfit: bands.upper + (bands.upper - bands.middle), // Target equal distance above
        positionSize: this.calculateVolatilityPositionSize(bands.bandwidth),
        reasoning: `Price broke above upper band at ${bands.upper.toFixed(2)}, breakout signal`,
        algorithm: this.algorithmName,
        bands: bands,
        signalType: 'BREAKOUT',
        timestamp: new Date()
      };
    }
    
    return { 
      action: 'HOLD', 
      confidence: 0.5,
      reasoning: `Price within bands: ${bands.lower.toFixed(2)} - ${bands.upper.toFixed(2)}`,
      algorithm: this.algorithmName,
      bands: bands,
      timestamp: new Date()
    };
  }

  /**
   * Calculate confidence based on band position
   * @param {number} price - Current price
   * @param {number} band - Band value (upper/lower)
   * @param {number} middle - Middle band value
   * @returns {number} - Confidence level (0-1)
   */
  calculateBandConfidence(price, band, middle) {
    const distance = Math.abs(price - band) / middle;
    return Math.min(0.95, 0.5 + distance * 5);
  }

  /**
   * Calculate breakout confidence
   * @param {number} price - Current price
   * @param {number} upperBand - Upper band value
   * @param {number} bandwidth - Band width
   * @returns {number} - Confidence level (0-1)
   */
  calculateBreakoutConfidence(price, upperBand, bandwidth) {
    const breakoutStrength = (price - upperBand) / upperBand;
    const volatilityFactor = Math.min(1, bandwidth * 10);
    return Math.min(0.95, 0.6 + breakoutStrength * 10 + volatilityFactor);
  }

  /**
   * Position sizing based on volatility
   * @param {number} bandwidth - Bollinger Bands width
   * @param {number} baseSize - Base position size (default: 100)
   * @returns {number} - Position size in shares
   */
  calculateVolatilityPositionSize(bandwidth, baseSize = 100) {
    const volatilityFactor = Math.max(0.5, Math.min(2.0, 1 / bandwidth));
    return Math.floor(baseSize * volatilityFactor);
  }

  /**
   * Execute trade with volatility-based position sizing
   * @param {string} symbol - Stock symbol
   * @param {Object} signal - Trading signal
   * @param {number} timestamp - Trade timestamp
   */
  executeTrade(symbol, signal, timestamp) {
    if (signal.action === 'BUY') {
      const positionSize = this.calculateVolatilityPositionSize(signal.bands.bandwidth);
      this.positions.set(symbol, {
        side: 'LONG',
        quantity: positionSize,
        entryPrice: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        bands: signal.bands,
        signalType: signal.signalType || 'MEAN_REVERSION',
        timestamp,
        algorithm: this.algorithmName
      });
    } else if (signal.action === 'SELL') {
      const position = this.positions.get(symbol);
      if (position) {
        const pnl = (signal.price - position.entryPrice) * position.quantity;
        this.tradeHistory.push({
          symbol,
          side: 'LONG',
          entryPrice: position.entryPrice,
          exitPrice: signal.price,
          quantity: position.quantity,
          pnl,
          pnlPercent: (pnl / (position.entryPrice * position.quantity)) * 100,
          entryDate: new Date(position.timestamp),
          exitDate: new Date(timestamp),
          duration: Math.ceil((timestamp - position.timestamp) / (1000 * 60 * 60 * 24)),
          algorithm: this.algorithmName,
          confidence: signal.confidence,
          signalType: position.signalType,
          entryBandwidth: position.bands.bandwidth,
          exitBandwidth: signal.bands.bandwidth
        });
        this.positions.delete(symbol);
      }
    }
  }

  /**
   * Calculate performance with volatility metrics
   * @returns {Object} - Performance metrics
   */
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const meanReversionTrades = this.tradeHistory.filter(trade => trade.signalType === 'MEAN_REVERSION');
    const breakoutTrades = this.tradeHistory.filter(trade => trade.signalType === 'BREAKOUT');
    
    const returns = this.tradeHistory.map(trade => trade.pnlPercent / 100);
    const sharpeRatio = calculateSharpeRatio(returns);
    
    return {
      totalTrades,
      winningTrades: winningTrades.length,
      winRate,
      totalPnL,
      sharpeRatio,
      meanReversionTrades: meanReversionTrades.length,
      breakoutTrades: breakoutTrades.length,
      volatilityEffectiveness: this.calculateVolatilityEffectiveness()
    };
  }

  /**
   * Calculate volatility strategy effectiveness
   * @returns {Object} - Volatility effectiveness metrics
   */
  calculateVolatilityEffectiveness() {
    const highVolTrades = this.tradeHistory.filter(trade => trade.entryBandwidth > 0.1);
    const lowVolTrades = this.tradeHistory.filter(trade => trade.entryBandwidth <= 0.1);
    
    const highVolWinRate = highVolTrades.length > 0 ?
      highVolTrades.filter(trade => trade.pnl > 0).length / highVolTrades.length : 0;
    
    const lowVolWinRate = lowVolTrades.length > 0 ?
      lowVolTrades.filter(trade => trade.pnl > 0).length / lowVolTrades.length : 0;
    
    return {
      highVolWinRate,
      lowVolWinRate,
      totalHighVolTrades: highVolTrades.length,
      totalLowVolTrades: lowVolTrades.length
    };
  }
}

// ============================================================================
// ALGORITHM MANAGER
// ============================================================================

/**
 * Algorithm Manager
 * 
 * Manages multiple trading algorithms and provides unified interface
 * for signal generation, trade execution, and performance tracking.
 */
class AlgorithmManager {
  constructor() {
    this.algorithms = new Map();
    this.performance = new Map();
    this.globalSettings = {
      maxConcurrentAlgorithms: 5,
      maxDailyLoss: 5.0, // 5%
      maxPositionSize: 10.0, // 10%
      riskLevel: 'medium'
    };
  }

  /**
   * Add algorithm to manager
   * @param {string} name - Algorithm name
   * @param {Object} algorithm - Algorithm instance
   */
  addAlgorithm(name, algorithm) {
    this.algorithms.set(name, algorithm);
    this.performance.set(name, {
      totalTrades: 0,
      winningTrades: 0,
      totalPnL: 0,
      winRate: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      lastUpdate: new Date()
    });
  }

  /**
   * Generate signals from all algorithms
   * @param {string} symbol - Stock symbol
   * @param {Array} prices - Historical price data
   * @param {number} currentPrice - Current market price
   * @returns {Array} - Array of signals from all algorithms
   */
  generateSignals(symbol, prices, currentPrice) {
    const signals = [];
    
    for (const [name, algorithm] of this.algorithms) {
      try {
        const signal = algorithm.generateSignal(symbol, prices, currentPrice);
        if (signal) {
          signal.algorithmName = name;
          signals.push(signal);
        }
      } catch (error) {
        console.error(`Error generating signal for ${name}:`, error);
      }
    }
    
    return signals;
  }

  /**
   * Execute trade based on algorithm signal
   * @param {string} symbol - Stock symbol
   * @param {Object} signal - Trading signal
   * @param {number} timestamp - Trade timestamp
   */
  executeTrade(symbol, signal, timestamp) {
    const algorithm = this.algorithms.get(signal.algorithmName);
    if (algorithm) {
      algorithm.executeTrade(symbol, signal, timestamp);
      this.updatePerformance(signal.algorithmName);
    }
  }

  /**
   * Update algorithm performance
   * @param {string} algorithmName - Algorithm name
   */
  updatePerformance(algorithmName) {
    const algorithm = this.algorithms.get(algorithmName);
    if (algorithm) {
      const performance = algorithm.calculatePerformance();
      this.performance.set(algorithmName, {
        ...performance,
        lastUpdate: new Date()
      });
    }
  }

  /**
   * Get overall performance summary
   * @returns {Object} - Overall performance metrics
   */
  getOverallPerformance() {
    let totalTrades = 0;
    let totalWinningTrades = 0;
    let totalPnL = 0;
    let totalSharpe = 0;
    let algorithmCount = 0;

    for (const [name, perf] of this.performance) {
      totalTrades += perf.totalTrades;
      totalWinningTrades += perf.winningTrades;
      totalPnL += perf.totalPnL;
      totalSharpe += perf.sharpeRatio;
      algorithmCount++;
    }

    return {
      totalAlgorithms: algorithmCount,
      totalTrades,
      totalWinningTrades,
      totalPnL,
      overallWinRate: totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0,
      averageSharpe: algorithmCount > 0 ? totalSharpe / algorithmCount : 0,
      bestAlgorithm: this.getBestPerformingAlgorithm(),
      worstAlgorithm: this.getWorstPerformingAlgorithm()
    };
  }

  /**
   * Get best performing algorithm
   * @returns {string} - Best algorithm name
   */
  getBestPerformingAlgorithm() {
    let bestName = '';
    let bestPnL = -Infinity;

    for (const [name, perf] of this.performance) {
      if (perf.totalPnL > bestPnL) {
        bestPnL = perf.totalPnL;
        bestName = name;
      }
    }

    return bestName;
  }

  /**
   * Get worst performing algorithm
   * @returns {string} - Worst algorithm name
   */
  getWorstPerformingAlgorithm() {
    let worstName = '';
    let worstPnL = Infinity;

    for (const [name, perf] of this.performance) {
      if (perf.totalPnL < worstPnL) {
        worstPnL = perf.totalPnL;
        worstName = name;
      }
    }

    return worstName;
  }
}

// ============================================================================
// EXPORT ALGORITHMS
// ============================================================================

export {
  MovingAverageCrossover,
  RSIMeanReversion,
  BollingerBandsStrategy,
  AlgorithmManager,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateSharpeRatio
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage of the trading algorithms:
 * 
 * // Initialize algorithms
 * const maCrossover = new MovingAverageCrossover(10, 30, 2.0);
 * const rsiMeanReversion = new RSIMeanReversion(14, 30, 70, 1.5);
 * const bollingerBands = new BollingerBandsStrategy(20, 2, 2.5);
 * 
 * // Initialize algorithm manager
 * const manager = new AlgorithmManager();
 * manager.addAlgorithm('MA_Crossover', maCrossover);
 * manager.addAlgorithm('RSI_MeanReversion', rsiMeanReversion);
 * manager.addAlgorithm('Bollinger_Bands', bollingerBands);
 * 
 * // Generate signals
 * const prices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109];
 * const currentPrice = 110;
 * const signals = manager.generateSignals('AAPL', prices, currentPrice);
 * 
 * // Execute trades
 * signals.forEach(signal => {
 *   if (signal.action !== 'HOLD') {
 *     manager.executeTrade('AAPL', signal, Date.now());
 *   }
 * });
 * 
 * // Get performance
 * const performance = manager.getOverallPerformance();
 * console.log('Overall Performance:', performance);
 */
