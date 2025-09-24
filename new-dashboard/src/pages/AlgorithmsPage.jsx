import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  BugReport as BugReportIcon,
  Psychology as AlgorithmIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import AlgorithmStatus from '../components/AlgorithmStatus';
import AlgorithmCodeDisplay from '../components/AlgorithmCodeDisplay';

const AlgorithmsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm);
  };

  const handleSettingsOpen = () => {
    setShowSettingsDialog(true);
  };

  const handleSettingsClose = () => {
    setShowSettingsDialog(false);
  };

  // Mock algorithm performance data
  const algorithmPerformance = [
    {
      name: 'Moving Average Crossover',
      type: 'Trend Following',
      status: 'active',
      performance: {
        winRate: 68.5,
        totalTrades: 142,
        profitLoss: 2847.50,
        profitLossPercent: 12.3,
        sharpeRatio: 1.45,
        maxDrawdown: -8.2,
        avgTradeDuration: '2.5 days',
        tradesToday: 8
      },
      riskMetrics: {
        var: 1250.00,
        beta: 0.85,
        volatility: 18.5,
        correlation: 0.72
      }
    },
    {
      name: 'RSI Mean Reversion',
      type: 'Mean Reversion',
      status: 'paused',
      performance: {
        winRate: 72.1,
        totalTrades: 89,
        profitLoss: 1923.75,
        profitLossPercent: 8.7,
        sharpeRatio: 1.28,
        maxDrawdown: -5.8,
        avgTradeDuration: '1.2 days',
        tradesToday: 3
      },
      riskMetrics: {
        var: 850.00,
        beta: 0.65,
        volatility: 12.3,
        correlation: 0.45
      }
    },
    {
      name: 'Bollinger Bands Strategy',
      type: 'Volatility',
      status: 'active',
      performance: {
        winRate: 65.2,
        totalTrades: 156,
        profitLoss: 3241.80,
        profitLossPercent: 15.8,
        sharpeRatio: 1.62,
        maxDrawdown: -6.4,
        avgTradeDuration: '3.1 days',
        tradesToday: 12
      },
      riskMetrics: {
        var: 1450.00,
        beta: 1.15,
        volatility: 22.8,
        correlation: 0.88
      }
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Trading Algorithms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage, monitor, and optimize your automated trading strategies
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<SettingsIcon />}
            onClick={handleSettingsOpen}
          >
            Global Settings
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PlayIcon />}
            color="success"
          >
            Start All
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Algorithm Status" icon={<AlgorithmIcon />} />
          <Tab label="Code Repository" icon={<CodeIcon />} />
          <Tab label="Performance Analysis" icon={<AssessmentIcon />} />
          <Tab label="Backtesting" icon={<TimelineIcon />} />
          <Tab label="Risk Management" icon={<SecurityIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <AlgorithmStatus />
      )}

      {activeTab === 1 && (
        <AlgorithmCodeDisplay />
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Algorithm Performance Analysis
          </Typography>
          
          <Grid container spacing={3}>
            {algorithmPerformance.map((algorithm, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {algorithm.name}
                        </Typography>
                        <Chip 
                          label={algorithm.type} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Chip 
                        label={algorithm.status.toUpperCase()} 
                        size="small"
                        color={algorithm.status === 'active' ? 'success' : 'warning'}
                        variant="filled"
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Performance Metrics */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Performance Metrics
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Win Rate
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {algorithm.performance.winRate}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Total Trades
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {algorithm.performance.totalTrades}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            P&L
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: algorithm.performance.profitLoss >= 0 ? 'success.main' : 'error.main'
                            }}
                          >
                            ${algorithm.performance.profitLoss.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Sharpe Ratio
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {algorithm.performance.sharpeRatio}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Risk Metrics */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Risk Metrics
                      </Typography>
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <SecurityIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="VaR (95%)" 
                            secondary={`$${algorithm.riskMetrics.var.toLocaleString()}`}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <TrendingUpIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Beta" 
                            secondary={algorithm.riskMetrics.beta}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <SpeedIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Volatility" 
                            secondary={`${algorithm.riskMetrics.volatility}%`}
                          />
                        </ListItem>
                      </List>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <AssessmentIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Code">
                        <IconButton size="small">
                          <CodeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Settings">
                        <IconButton size="small">
                          <SettingsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Performance Summary */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Overall Algorithm Performance
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {algorithmPerformance.filter(algo => algo.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Algorithms
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {algorithmPerformance.reduce((sum, algo) => sum + algo.performance.tradesToday, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trades Today
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 600,
                        color: algorithmPerformance.reduce((sum, algo) => sum + algo.performance.profitLoss, 0) >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      ${algorithmPerformance.reduce((sum, algo) => sum + algo.performance.profitLoss, 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total P&L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {(
                        algorithmPerformance.reduce((sum, algo) => sum + algo.performance.winRate, 0) / algorithmPerformance.length
                      ).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Win Rate
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Algorithm Backtesting
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              Backtesting interface will be implemented here. This will allow you to test algorithms against historical data.
            </Typography>
          </Alert>
        </Box>
      )}

      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Risk Management
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              Risk management controls and monitoring will be implemented here.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onClose={handleSettingsClose} maxWidth="md" fullWidth>
        <DialogTitle>Algorithm Global Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Max Concurrent Algorithms</InputLabel>
                <Select value={3} label="Max Concurrent Algorithms">
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Daily Loss (%)"
                type="number"
                defaultValue={5}
                inputProps={{ min: 1, max: 20 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Position Size (%)"
                type="number"
                defaultValue={10}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select value="medium" label="Risk Level">
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSettingsClose}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlgorithmsPage;
