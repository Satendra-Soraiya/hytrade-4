const { Holding } = require('../trading/holding.model');
const { User } = require('./user.model');

async function getInvestedPaise(userId, session = null) {
  const q = Holding.find({ userId });
  if (session) q.session(session);
  const holdings = await q.lean();
  return holdings.reduce((sum, h) => sum + (h.investedPaise || 0), 0);
}

async function syncUserInvestmentTotals(userId, session = null) {
  const investedPaise = await getInvestedPaise(userId, session);
  await User.findByIdAndUpdate(
    userId,
    { totalInvestmentPaise: investedPaise },
    session ? { session } : undefined
  );
  return investedPaise;
}

module.exports = { getInvestedPaise, syncUserInvestmentTotals };
