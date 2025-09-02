const { model } = require("mongoose");
const {
  CustomHoldingsSchema,
  CustomOrdersSchema,
  CustomPositionsSchema,
  CustomWatchlistSchema
} = require("../schemas/CustomTradingSchemas");

const CustomHoldingsModel = model("CustomHoldings", CustomHoldingsSchema);
const CustomOrdersModel = model("CustomOrders", CustomOrdersSchema);
const CustomPositionsModel = model("CustomPositions", CustomPositionsSchema);
const CustomWatchlistModel = model("CustomWatchlist", CustomWatchlistSchema);

module.exports = {
  CustomHoldingsModel,
  CustomOrdersModel,
  CustomPositionsModel,
  CustomWatchlistModel
};
