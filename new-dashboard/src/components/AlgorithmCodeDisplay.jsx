import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Alert
} from '@mui/material';
import {
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// Algorithm implementations with real code
const algorithmImplementations = {
  'Moving Average Crossover': {
    description: 'A trend-following strategy that generates buy/sell signals when short-term moving average crosses above/below long-term moving average.',
    code: `// Moving Average Crossover Algorithm
class MovingAverageCrossover {
  constructor(shortPeriod = 10, longPeriod = 30, riskPerTrade = 2.0) {
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.riskPerTrade = riskPerTrade;
    this.positions = new Map();
    this.tradeHistory = [];
  }

  // Calculate simple moving average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Generate trading signal
  generateSignal(symbol, prices, currentPrice) {
    const shortMA = this.calculateSMA(prices, this.shortPeriod);
    const longMA = this.calculateSMA(prices, this.longPeriod);
    
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
        positionSize: this.calculatePositionSize(currentPrice)
      };
    }
    
    // Sell signal: short MA crosses below long MA
    if (shortMA < longMA && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateConfidence(longMA, shortMA),
        stopLoss: null,
        takeProfit: null,
        positionSize: currentPosition.quantity
      };
    }
    
    return { action: 'HOLD', confidence: 0.5 };
  }

  // Calculate signal confidence based on MA separation
  calculateConfidence(ma1, ma2) {
    const separation = Math.abs(ma1 - ma2) / ma2;
    return Math.min(0.95, 0.5 + separation * 10);
  }

  // Calculate position size based on risk management
  calculatePositionSize(price) {
    const accountBalance = 100000; // Example balance
    const riskAmount = accountBalance * (this.riskPerTrade / 100);
    const stopLossDistance = price * 0.02; // 2% stop loss
    return Math.floor(riskAmount / stopLossDistance);
  }

  // Execute trade
  executeTrade(symbol, signal, timestamp) {
    if (signal.action === 'BUY') {
      this.positions.set(symbol, {
        side: 'LONG',
        quantity: signal.positionSize,
        entryPrice: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        timestamp
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
          timestamp
        });
        this.positions.delete(symbol);
      }
    }
  }

  // Calculate performance metrics
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const returns = this.tradeHistory.map(trade => trade.pnl);
    const sharpeRatio = this.calculateSharpeRatio(returns);
    
    return {
      totalTrades,
      winRate,
      totalPnL,
      sharpeRatio,
      avgWin: winningTrades.length > 0 ? 
        winningTrades.reduce((sum, trade) => sum + trade.pnl, 0) / winningTrades.length : 0,
      avgLoss: totalTrades - winningTrades.length > 0 ?
        this.tradeHistory.filter(trade => trade.pnl < 0)
          .reduce((sum, trade) => sum + trade.pnl, 0) / (totalTrades - winningTrades.length) : 0
    };
  }

  // Calculate Sharpe ratio
  calculateSharpeRatio(returns, riskFreeRate = 0.02) {
    if (returns.length === 0) return 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    return volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;
  }
}`,
    parameters: {
      shortPeriod: { value: 10, min: 5, max: 50, description: 'Short moving average period' },
      longPeriod: { value: 30, min: 20, max: 200, description: 'Long moving average period' },
      riskPerTrade: { value: 2.0, min: 0.5, max: 5.0, description: 'Risk per trade (%)' }
    },
    complexity: 'O(n)',
    category: 'Trend Following'
  },

  'RSI Mean Reversion': {
    description: 'A mean reversion strategy using RSI oscillator to identify overbought/oversold conditions.',
    code: `// RSI Mean Reversion Algorithm
class RSIMeanReversion {
  constructor(rsiPeriod = 14, oversoldLevel = 30, overboughtLevel = 70) {
    this.rsiPeriod = rsiPeriod;
    this.oversoldLevel = oversoldLevel;
    this.overboughtLevel = overboughtLevel;
    this.positions = new Map();
    this.tradeHistory = [];
  }

  // Calculate RSI (Relative Strength Index)
  calculateRSI(prices) {
    if (prices.length < this.rsiPeriod + 1) return null;
    
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-this.rsiPeriod).reduce((a, b) => a + b, 0) / this.rsiPeriod;
    const avgLoss = losses.slice(-this.rsiPeriod).reduce((a, b) => a + b, 0) / this.rsiPeriod;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // Generate trading signal based on RSI
  generateSignal(symbol, prices, currentPrice) {
    const rsi = this.calculateRSI(prices);
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
        rsi: rsi
      };
    }
    
    // Sell signal: RSI overbought
    if (rsi > this.overboughtLevel && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateRSIConfidence(rsi, this.overboughtLevel),
        stopLoss: null,
        takeProfit: null,
        rsi: rsi
      };
    }
    
    return { action: 'HOLD', confidence: 0.5, rsi: rsi };
  }

  // Calculate confidence based on RSI extreme values
  calculateRSIConfidence(rsi, threshold) {
    const distance = Math.abs(rsi - threshold);
    return Math.min(0.95, 0.5 + (distance / threshold) * 0.5);
  }

  // Execute trade with RSI-based position sizing
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
        timestamp
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
          entryRSI: position.rsi,
          exitRSI: signal.rsi,
          timestamp
        });
        this.positions.delete(symbol);
      }
    }
  }

  // Position sizing based on RSI strength
  calculateRSIPositionSize(rsi) {
    const baseSize = 100; // Base position size
    const rsiStrength = Math.abs(rsi - 50) / 50; // Distance from neutral
    return Math.floor(baseSize * (1 + rsiStrength));
  }

  // Calculate performance with RSI-specific metrics
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const avgRSIEntry = this.tradeHistory.reduce((sum, trade) => sum + trade.entryRSI, 0) / totalTrades;
    const avgRSIExit = this.tradeHistory.reduce((sum, trade) => sum + trade.exitRSI, 0) / totalTrades;
    
    return {
      totalTrades,
      winRate,
      totalPnL,
      avgRSIEntry,
      avgRSIExit,
      rsiEffectiveness: this.calculateRSIEffectiveness()
    };
  }

  // Calculate RSI strategy effectiveness
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
}`,
    parameters: {
      rsiPeriod: { value: 14, min: 5, max: 30, description: 'RSI calculation period' },
      oversoldLevel: { value: 30, min: 20, max: 40, description: 'Oversold threshold' },
      overboughtLevel: { value: 70, min: 60, max: 80, description: 'Overbought threshold' }
    },
    complexity: 'O(n)',
    category: 'Mean Reversion'
  },

  'Bollinger Bands Strategy': {
    description: 'A volatility-based strategy using Bollinger Bands to identify price breakouts and mean reversion opportunities.',
    code: `// Bollinger Bands Strategy Algorithm
class BollingerBandsStrategy {
  constructor(period = 20, standardDeviations = 2, riskPerTrade = 2.5) {
    this.period = period;
    this.standardDeviations = standardDeviations;
    this.riskPerTrade = riskPerTrade;
    this.positions = new Map();
    this.tradeHistory = [];
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(prices) {
    if (prices.length < this.period) return null;
    
    const recentPrices = prices.slice(-this.period);
    const sma = recentPrices.reduce((a, b) => a + b, 0) / this.period;
    
    // Calculate standard deviation
    const variance = recentPrices.reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / this.period;
    
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (this.standardDeviations * stdDev),
      middle: sma,
      lower: sma - (this.standardDeviations * stdDev),
      bandwidth: (2 * this.standardDeviations * stdDev) / sma
    };
  }

  // Generate trading signal based on Bollinger Bands
  generateSignal(symbol, prices, currentPrice) {
    const bands = this.calculateBollingerBands(prices);
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
        bands: bands
      };
    }
    
    // Sell signal: Price touches upper band (overbought)
    if (currentPrice >= bands.upper && isLong) {
      return {
        action: 'SELL',
        confidence: this.calculateBandConfidence(currentPrice, bands.upper, bands.middle),
        stopLoss: null,
        takeProfit: null,
        bands: bands
      };
    }
    
    // Breakout signal: Price breaks above upper band
    if (currentPrice > bands.upper && !isLong) {
      return {
        action: 'BUY',
        confidence: this.calculateBreakoutConfidence(currentPrice, bands.upper, bands.bandwidth),
        stopLoss: bands.middle, // Stop at middle band
        takeProfit: bands.upper + (bands.upper - bands.middle), // Target equal distance above
        bands: bands,
        signalType: 'BREAKOUT'
      };
    }
    
    return { action: 'HOLD', confidence: 0.5, bands: bands };
  }

  // Calculate confidence based on band position
  calculateBandConfidence(price, band, middle) {
    const distance = Math.abs(price - band) / middle;
    return Math.min(0.95, 0.5 + distance * 5);
  }

  // Calculate breakout confidence
  calculateBreakoutConfidence(price, upperBand, bandwidth) {
    const breakoutStrength = (price - upperBand) / upperBand;
    const volatilityFactor = Math.min(1, bandwidth * 10);
    return Math.min(0.95, 0.6 + breakoutStrength * 10 + volatilityFactor);
  }

  // Execute trade with volatility-based position sizing
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
        timestamp
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
          signalType: position.signalType,
          entryBandwidth: position.bands.bandwidth,
          exitBandwidth: signal.bands.bandwidth,
          timestamp
        });
        this.positions.delete(symbol);
      }
    }
  }

  // Position sizing based on volatility
  calculateVolatilityPositionSize(bandwidth) {
    const baseSize = 100;
    const volatilityFactor = Math.max(0.5, Math.min(2.0, 1 / bandwidth));
    return Math.floor(baseSize * volatilityFactor);
  }

  // Calculate performance with volatility metrics
  calculatePerformance() {
    const totalTrades = this.tradeHistory.length;
    const winningTrades = this.tradeHistory.filter(trade => trade.pnl > 0);
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    
    const totalPnL = this.tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const meanReversionTrades = this.tradeHistory.filter(trade => trade.signalType === 'MEAN_REVERSION');
    const breakoutTrades = this.tradeHistory.filter(trade => trade.signalType === 'BREAKOUT');
    
    return {
      totalTrades,
      winRate,
      totalPnL,
      meanReversionTrades: meanReversionTrades.length,
      breakoutTrades: breakoutTrades.length,
      volatilityEffectiveness: this.calculateVolatilityEffectiveness()
    };
  }

  // Calculate volatility strategy effectiveness
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
}`,
    parameters: {
      period: { value: 20, min: 10, max: 50, description: 'Bollinger Bands period' },
      standardDeviations: { value: 2, min: 1, max: 3, description: 'Standard deviations' },
      riskPerTrade: { value: 2.5, min: 1.0, max: 5.0, description: 'Risk per trade (%)' }
    },
    complexity: 'O(n)',
    category: 'Volatility'
  }
};

const AlgorithmCodeDisplay = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('Moving Average Crossover');
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAlgorithmChange = (algorithmName) => {
    setSelectedAlgorithm(algorithmName);
  };

  const currentAlgorithm = algorithmImplementations[selectedAlgorithm];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Algorithm Code Repository
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and analyze the actual algorithm implementations used in your trading system
          </Typography>
        </Box>
      </Box>

      {/* Algorithm Selection */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Select Algorithm:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {Object.keys(algorithmImplementations).map((algorithmName) => (
            <Chip
              key={algorithmName}
              label={algorithmName}
              onClick={() => handleAlgorithmChange(algorithmName)}
              color={selectedAlgorithm === algorithmName ? 'primary' : 'default'}
              variant={selectedAlgorithm === algorithmName ? 'filled' : 'outlined'}
              icon={<CodeIcon />}
            />
          ))}
        </Box>
      </Box>

      {/* Algorithm Details */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedAlgorithm}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {currentAlgorithm.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={currentAlgorithm.category} size="small" color="primary" />
                <Chip label={`Complexity: ${currentAlgorithm.complexity}`} size="small" variant="outlined" />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Run Algorithm">
                <IconButton color="success">
                  <PlayIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Stop Algorithm">
                <IconButton color="error">
                  <StopIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Algorithm Settings">
                <IconButton>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Algorithm Code" icon={<CodeIcon />} />
              <Tab label="Parameters" icon={<SettingsIcon />} />
              <Tab label="Performance" icon={<AssessmentIcon />} />
              <Tab label="Testing" icon={<BugReportIcon />} />
            </Tabs>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Implementation Code:
              </Typography>
              <Paper sx={{ 
                p: 2, 
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'divider'
              }}>
                <Box sx={{ 
                  fontFamily: 'monospace', 
                  fontSize: '0.875rem',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 600,
                  '& .keyword': { color: '#569cd6' },
                  '& .string': { color: '#ce9178' },
                  '& .comment': { color: '#6a9955' },
                  '& .number': { color: '#b5cea8' }
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {currentAlgorithm.code}
                  </pre>
                </Box>
              </Paper>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Algorithm Parameters:
              </Typography>
              <List>
                {Object.entries(currentAlgorithm.parameters).map(([paramName, paramConfig]) => (
                  <ListItem key={paramName} divider>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={paramName}
                      secondary={paramConfig.description}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2">
                        Current: {paramConfig.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Range: {paramConfig.min} - {paramConfig.max}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Performance Metrics:
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                        68.5%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Win Rate
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        1.45
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sharpe Ratio
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                        +$2,847
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total P&L
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        -8.2%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max Drawdown
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Algorithm Testing:
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This section would contain backtesting results, paper trading logs, and algorithm validation tests.
                </Typography>
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="Unit Tests Passed" 
                  color="success" 
                  variant="filled" 
                />
                <Chip 
                  icon={<CheckCircleIcon />} 
                  label="Integration Tests Passed" 
                  color="success" 
                  variant="filled" 
                />
                <Chip 
                  icon={<WarningIcon />} 
                  label="Performance Tests" 
                  color="warning" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<ErrorIcon />} 
                  label="Stress Tests Failed" 
                  color="error" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlgorithmCodeDisplay;
