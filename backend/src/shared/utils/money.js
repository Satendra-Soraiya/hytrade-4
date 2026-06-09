/** @param {number} inr */
function inrToPaise(inr) {
  return Math.round(Number(inr) * 100);
}

/** @param {number} paise */
function paiseToInr(paise) {
  return Number(paise) / 100;
}

/** @param {number} paise */
function formatInrFromPaise(paise) {
  return parseFloat(paiseToInr(paise).toFixed(2));
}

/** @param {number} inr */
function roundInr(inr) {
  return parseFloat(Number(inr).toFixed(2));
}

module.exports = {
  inrToPaise,
  paiseToInr,
  formatInrFromPaise,
  roundInr,
};
