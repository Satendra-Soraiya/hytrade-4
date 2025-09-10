const { CustomUserModel } = require('../model/CustomUserModel');
const { CustomHoldingsModel, CustomOrdersModel } = require('../model/CustomTradingModels');
const { encryptSensitiveData, decryptSensitiveData } = require('../config/security');

class TradingService {
  
  // Execute a buy order with proper financial calculations
  static async executeBuyOrder(userId, orderData) {
    const session = await CustomUserModel.startSession();
    session.startTransaction();

    try {
      const { stockSymbol, stockName, quantity, price, orderMode = 'MARKET' } = orderData;
      const totalAmount = quantity * price;

      // Get user with session lock
      const user = await CustomUserModel.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate sufficient balance
      if (user.accountBalance < totalAmount) {
        throw new Error(`Insufficient balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${user.accountBalance.toFixed(2)}`);
      }

      // Check for existing holding
      const existingHolding = await CustomHoldingsModel.findOne({
        userId: userId,
        stockSymbol: stockSymbol.toUpperCase()
      }).session(session);

      if (existingHolding) {
        // Update existing holding with proper average price calculation
        const newTotalQuantity = existingHolding.quantity + quantity;
        const newTotalInvestment = existingHolding.totalInvestment + totalAmount;
        const newAveragePrice = newTotalInvestment / newTotalQuantity;

        existingHolding.quantity = newTotalQuantity;
        existingHolding.averagePrice = parseFloat(newAveragePrice.toFixed(2));
        existingHolding.totalInvestment = parseFloat(newTotalInvestment.toFixed(2));
        existingHolding.currentPrice = price;
        existingHolding.currentValue = parseFloat((newTotalQuantity * price).toFixed(2));
        existingHolding.profitLoss = parseFloat((existingHolding.currentValue - existingHolding.totalInvestment).toFixed(2));
        existingHolding.profitLossPercentage = parseFloat(((existingHolding.profitLoss / existingHolding.totalInvestment) * 100).toFixed(2));
        existingHolding.lastUpdated = new Date();

        await existingHolding.save({ session });
      } else {
        // Create new holding
        const newHolding = new CustomHoldingsModel({
          userId: userId,
          stockSymbol: stockSymbol.toUpperCase(),
          stockName: stockName,
          quantity: quantity,
          averagePrice: price,
          currentPrice: price,
          totalInvestment: parseFloat(totalAmount.toFixed(2)),
          currentValue: parseFloat(totalAmount.toFixed(2)),
          profitLoss: 0,
          profitLossPercentage: 0,
          purchaseDate: new Date(),
          lastUpdated: new Date()
        });

        await newHolding.save({ session });
      }

      // Create order record
      const newOrder = new CustomOrdersModel({
        userId: userId,
        stockSymbol: stockSymbol.toUpperCase(),
        stockName: stockName,
        orderType: 'BUY',
        quantity: quantity,
        price: price,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        orderStatus: 'COMPLETED',
        orderMode: orderMode,
        orderDate: new Date(),
        executedAt: new Date()
      });

      await newOrder.save({ session });

      // Update user's financial data
      user.accountBalance = parseFloat((user.accountBalance - totalAmount).toFixed(2));
      user.totalInvestment = parseFloat((user.totalInvestment + totalAmount).toFixed(2));
      user.updatedAt = new Date();

      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return {
        success: true,
        message: 'Buy order executed successfully',
        order: newOrder,
        newBalance: user.accountBalance,
        totalInvestment: user.totalInvestment
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Execute a sell order with proper financial calculations
  static async executeSellOrder(userId, orderData) {
    const session = await CustomUserModel.startSession();
    session.startTransaction();

    try {
      const { stockSymbol, stockName, quantity, price, orderMode = 'MARKET' } = orderData;
      const totalAmount = quantity * price;

      // Get user with session lock
      const user = await CustomUserModel.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Check for existing holding
      const existingHolding = await CustomHoldingsModel.findOne({
        userId: userId,
        stockSymbol: stockSymbol.toUpperCase()
      }).session(session);

      if (!existingHolding) {
        throw new Error(`You don't own any shares of ${stockSymbol}`);
      }

      if (existingHolding.quantity < quantity) {
        throw new Error(`Insufficient shares. Available: ${existingHolding.quantity}, Requested: ${quantity}`);
      }

      // Calculate profit/loss for this sale
      const soldInvestment = (existingHolding.averagePrice * quantity);
      const profitLoss = totalAmount - soldInvestment;
      const profitLossPercentage = (profitLoss / soldInvestment) * 100;

      // Update or remove holding
      if (existingHolding.quantity === quantity) {
        // Selling all shares - remove holding
        await CustomHoldingsModel.deleteOne({ _id: existingHolding._id }).session(session);
      } else {
        // Partial sale - update holding
        const newQuantity = existingHolding.quantity - quantity;
        const newTotalInvestment = existingHolding.totalInvestment - soldInvestment;

        existingHolding.quantity = newQuantity;
        existingHolding.totalInvestment = parseFloat(newTotalInvestment.toFixed(2));
        existingHolding.currentValue = parseFloat((newQuantity * price).toFixed(2));
        existingHolding.profitLoss = parseFloat((existingHolding.currentValue - existingHolding.totalInvestment).toFixed(2));
        existingHolding.profitLossPercentage = parseFloat(((existingHolding.profitLoss / existingHolding.totalInvestment) * 100).toFixed(2));
        existingHolding.lastUpdated = new Date();

        await existingHolding.save({ session });
      }

      // Create order record
      const newOrder = new CustomOrdersModel({
        userId: userId,
        stockSymbol: stockSymbol.toUpperCase(),
        stockName: stockName,
        orderType: 'SELL',
        quantity: quantity,
        price: price,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        orderStatus: 'COMPLETED',
        orderMode: orderMode,
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        profitLossPercentage: parseFloat(profitLossPercentage.toFixed(2)),
        orderDate: new Date(),
        executedAt: new Date()
      });

      await newOrder.save({ session });

      // Update user's financial data
      user.accountBalance = parseFloat((user.accountBalance + totalAmount).toFixed(2));
      user.totalInvestment = parseFloat((user.totalInvestment - soldInvestment).toFixed(2));
      user.totalPnL = parseFloat((user.totalPnL + profitLoss).toFixed(2));
      user.updatedAt = new Date();

      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return {
        success: true,
        message: 'Sell order executed successfully',
        order: newOrder,
        newBalance: user.accountBalance,
        totalInvestment: user.totalInvestment,
        totalPnL: user.totalPnL,
        profitLoss: profitLoss,
        profitLossPercentage: profitLossPercentage
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Calculate portfolio summary
  static async calculatePortfolioSummary(userId) {
    try {
      const user = await CustomUserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const holdings = await CustomHoldingsModel.find({ userId: userId });
      
      let totalCurrentValue = 0;
      let totalInvestment = 0;
      let totalProfitLoss = 0;

      holdings.forEach(holding => {
        totalCurrentValue += holding.currentValue;
        totalInvestment += holding.totalInvestment;
        totalProfitLoss += holding.profitLoss;
      });

      const totalPortfolioValue = user.accountBalance + totalCurrentValue;
      const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

      return {
        accountBalance: user.accountBalance,
        totalInvestment: parseFloat(totalInvestment.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        totalProfitLossPercentage: parseFloat(totalProfitLossPercentage.toFixed(2)),
        totalPnL: user.totalPnL,
        holdingsCount: holdings.length
      };
    } catch (error) {
      throw error;
    }
  }

  // Update stock prices (to be called by real-time price service)
  static async updateStockPrices(priceUpdates) {
    try {
      const bulkOperations = [];

      for (const update of priceUpdates) {
        const { stockSymbol, currentPrice, dayChange, dayChangePercentage } = update;

        bulkOperations.push({
          updateMany: {
            filter: { stockSymbol: stockSymbol.toUpperCase() },
            update: {
              $set: {
                currentPrice: currentPrice,
                dayChange: dayChange || 0,
                dayChangePercentage: dayChangePercentage || 0,
                lastUpdated: new Date()
              }
            }
          }
        });
      }

      if (bulkOperations.length > 0) {
        await CustomHoldingsModel.bulkWrite(bulkOperations);
        
        // Recalculate profit/loss for all updated holdings
        const updatedHoldings = await CustomHoldingsModel.find({
          stockSymbol: { $in: priceUpdates.map(u => u.stockSymbol.toUpperCase()) }
        });

        for (const holding of updatedHoldings) {
          holding.currentValue = parseFloat((holding.quantity * holding.currentPrice).toFixed(2));
          holding.profitLoss = parseFloat((holding.currentValue - holding.totalInvestment).toFixed(2));
          holding.profitLossPercentage = parseFloat(((holding.profitLoss / holding.totalInvestment) * 100).toFixed(2));
          await holding.save();
        }
      }

      return {
        success: true,
        message: `Updated prices for ${priceUpdates.length} stocks`,
        updatedCount: priceUpdates.length
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate order before execution
  static validateOrder(orderData, userBalance) {
    const { stockSymbol, quantity, price, orderType } = orderData;
    const errors = [];

    if (!stockSymbol || stockSymbol.trim() === '') {
      errors.push('Stock symbol is required');
    }

    if (!quantity || quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (!price || price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (orderType === 'BUY') {
      const totalAmount = quantity * price;
      if (totalAmount > userBalance) {
        errors.push(`Insufficient balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${userBalance.toFixed(2)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = TradingService;
