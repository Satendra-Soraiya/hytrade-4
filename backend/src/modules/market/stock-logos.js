/** TradingView symbol slugs for NSE tickers (s3-symbol-logo.tradingview.com) */
const TRADINGVIEW_SLUGS = {
  RELIANCE: 'reliance',
  TCS: 'tata-consultancy',
  HDFCBANK: 'hdfc-bank',
  INFY: 'infosys',
  ICICIBANK: 'icici-bank',
  HINDUNILVR: 'hindustan-unilever',
  ITC: 'itc',
  SBIN: 'state-bank',
  BHARTIARTL: 'airtel',
  KOTAKBANK: 'kotak-mahindra-bank',
  LT: 'larsen-and-toubro',
  AXISBANK: 'axis-bank',
  ASIANPAINT: 'asian-paints',
  MARUTI: 'maruti-suzuki-india',
  SUNPHARMA: 'sun-pharmaceutical',
  TITAN: 'titan-company',
  BAJFINANCE: 'bajaj-finance',
  WIPRO: 'wipro',
  ULTRACEMCO: 'ultratech-cement',
  NESTLEIND: 'nestle',
  HCLTECH: 'hcl-technologies',
  POWERGRID: 'power-grid',
  NTPC: 'ntpc',
  TATAMOTORS: 'tata-motors',
  'M&M': 'mahindra-and-mahindra',
};

const COMPANY_DOMAINS = {
  RELIANCE: 'ril.com',
  TCS: 'tcs.com',
  HDFCBANK: 'hdfcbank.com',
  INFY: 'infosys.com',
  ICICIBANK: 'icicibank.com',
  HINDUNILVR: 'hul.co.in',
  ITC: 'itcportal.com',
  SBIN: 'sbi.co.in',
  BHARTIARTL: 'airtel.in',
  KOTAKBANK: 'kotak.com',
  LT: 'larsentoubro.com',
  AXISBANK: 'axisbank.com',
  ASIANPAINT: 'asianpaints.com',
  MARUTI: 'marutisuzuki.com',
  SUNPHARMA: 'sunpharma.com',
  TITAN: 'titancompany.in',
  BAJFINANCE: 'bajajfinserv.in',
  WIPRO: 'wipro.com',
  ULTRACEMCO: 'ultratechcement.com',
  NESTLEIND: 'nestle.in',
  HCLTECH: 'hcltech.com',
  POWERGRID: 'powergridindia.com',
  NTPC: 'ntpc.co.in',
  TATAMOTORS: 'tatamotors.com',
  'M&M': 'mahindra.com',
};

function getLogoSourceUrls(symbol) {
  const key = String(symbol || '').trim().toUpperCase();
  const urls = [];

  const slug = TRADINGVIEW_SLUGS[key];
  if (slug) {
    urls.push(`https://s3-symbol-logo.tradingview.com/${slug}--big.svg`);
  }

  const domain = COMPANY_DOMAINS[key];
  if (domain) {
    urls.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
  }

  const encoded = encodeURIComponent(key);
  urls.push(`https://companiesmarketcap.com/img/company-logos/256/${encoded}.NS.png`);

  return urls;
}

module.exports = { getLogoSourceUrls, TRADINGVIEW_SLUGS, COMPANY_DOMAINS };
