// ============================================
// RECOMMENDATION DATABASE
// Comprehensive database of investment recommendations
// organized by asset type and risk level
// ============================================

export interface Recommendation {
  symbol: string;
  name: string;
  reason: string;
  score: number;
}

type RiskLevel = 'conservative' | 'moderate' | 'aggressive';
type AssetType = 'stocks' | 'crypto' | 'etfs' | 'mutual_funds' | 'bonds' | 'reits' | 'options';

export const recommendationDatabase: Record<AssetType, Record<RiskLevel, Recommendation[]>> = {
  stocks: {
    conservative: [
      { symbol: 'JNJ', name: 'Johnson & Johnson', reason: 'Healthcare leader with 60+ years of dividend growth', score: 82 },
      { symbol: 'PG', name: 'Procter & Gamble', reason: 'Consumer staples giant with pricing power', score: 80 },
      { symbol: 'KO', name: 'Coca-Cola', reason: 'Global beverage leader with consistent cash flow', score: 78 },
      { symbol: 'WMT', name: 'Walmart', reason: 'Recession-resistant retail with e-commerce growth', score: 81 },
      { symbol: 'VZ', name: 'Verizon', reason: 'Telecom leader with 6%+ dividend yield', score: 76 },
      { symbol: 'T', name: 'AT&T', reason: 'Dividend aristocrat with stable telecom business', score: 75 },
      { symbol: 'MCD', name: 'McDonald\'s', reason: 'Global fast food leader with franchise model', score: 79 }
    ],
    moderate: [
      { symbol: 'MSFT', name: 'Microsoft', reason: 'Cloud and AI leader with strong enterprise demand', score: 88 },
      { symbol: 'AAPL', name: 'Apple Inc.', reason: 'Services growth driving margin expansion', score: 86 },
      { symbol: 'V', name: 'Visa', reason: 'Digital payments benefiting from cashless trend', score: 84 },
      { symbol: 'JPM', name: 'JPMorgan Chase', reason: 'Banking leader with diversified revenue streams', score: 83 },
      { symbol: 'UNH', name: 'UnitedHealth', reason: 'Healthcare growth with Optum expansion', score: 85 },
      { symbol: 'MA', name: 'Mastercard', reason: 'Payment processing with global expansion', score: 84 },
      { symbol: 'HD', name: 'Home Depot', reason: 'Home improvement leader with strong margins', score: 82 }
    ],
    aggressive: [
      { symbol: 'NVDA', name: 'NVIDIA', reason: 'AI chip dominance with data center boom', score: 92 },
      { symbol: 'TSLA', name: 'Tesla', reason: 'EV leader expanding into energy and AI', score: 85 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', reason: 'Market share gains in CPUs and GPUs', score: 87 },
      { symbol: 'PLTR', name: 'Palantir', reason: 'AI software platform with government contracts', score: 83 },
      { symbol: 'COIN', name: 'Coinbase', reason: 'Crypto exchange with institutional growth', score: 81 },
      { symbol: 'SHOP', name: 'Shopify', reason: 'E-commerce platform with merchant growth', score: 84 },
      { symbol: 'SQ', name: 'Block (Square)', reason: 'Fintech innovation with Bitcoin exposure', score: 80 }
    ]
  },
  crypto: {
    conservative: [
      { symbol: 'BTC', name: 'Bitcoin', reason: 'Digital gold with ETF inflows and institutional adoption', score: 85 },
      { symbol: 'ETH', name: 'Ethereum', reason: 'Smart contract leader with staking yields', score: 82 },
      { symbol: 'USDC', name: 'USD Coin', reason: 'Regulated stablecoin for stability', score: 90 },
      { symbol: 'SOL', name: 'Solana', reason: 'Fast blockchain with growing DeFi ecosystem', score: 78 },
      { symbol: 'BNB', name: 'Binance Coin', reason: 'Exchange token with utility and burns', score: 76 }
    ],
    moderate: [
      { symbol: 'BTC', name: 'Bitcoin', reason: 'Spot ETF inflows reaching all-time highs', score: 88 },
      { symbol: 'ETH', name: 'Ethereum', reason: 'Shanghai upgrade enabling withdrawals', score: 85 },
      { symbol: 'SOL', name: 'Solana', reason: 'NFT and DeFi activity surging', score: 83 },
      { symbol: 'AVAX', name: 'Avalanche', reason: 'Subnet growth and institutional partnerships', score: 80 },
      { symbol: 'MATIC', name: 'Polygon', reason: 'Ethereum scaling with zkEVM technology', score: 81 }
    ],
    aggressive: [
      { symbol: 'SOL', name: 'Solana', reason: 'Memecoin activity driving network usage', score: 86 },
      { symbol: 'AVAX', name: 'Avalanche', reason: 'Gaming and metaverse integrations expanding', score: 83 },
      { symbol: 'ARB', name: 'Arbitrum', reason: 'Layer 2 solution with growing TVL', score: 82 },
      { symbol: 'SUI', name: 'Sui', reason: 'New blockchain with innovative architecture', score: 79 },
      { symbol: 'INJ', name: 'Injective', reason: 'DeFi protocol with cross-chain capabilities', score: 80 }
    ]
  },
  etfs: {
    conservative: [
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', reason: 'Low-cost diversification across top US companies', score: 88 },
      { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', reason: 'Broad bond exposure with 4%+ yield', score: 84 },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield', reason: 'Quality dividend stocks with 3%+ yield', score: 82 },
      { symbol: 'SCHD', name: 'Schwab US Dividend Equity', reason: 'Dividend growth focus with value tilt', score: 83 },
      { symbol: 'BND', name: 'Vanguard Total Bond Market', reason: 'Comprehensive bond market coverage', score: 81 }
    ],
    moderate: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market', reason: 'Complete US equity market exposure', score: 87 },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', reason: 'Tech-heavy Nasdaq 100 with innovation focus', score: 85 },
      { symbol: 'SCHG', name: 'Schwab US Large-Cap Growth', reason: 'Growth stock exposure at low cost', score: 84 },
      { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets', reason: 'International diversification opportunity', score: 80 },
      { symbol: 'IWM', name: 'iShares Russell 2000', reason: 'Small-cap exposure for economic recovery', score: 81 }
    ],
    aggressive: [
      { symbol: 'ARKK', name: 'ARK Innovation ETF', reason: 'Disruptive innovation plays across sectors', score: 82 },
      { symbol: 'SOXX', name: 'iShares Semiconductor ETF', reason: 'AI and chip demand driving semiconductor boom', score: 88 },
      { symbol: 'XLK', name: 'Technology Select Sector SPDR', reason: 'Pure tech play with mega-cap leaders', score: 86 },
      { symbol: 'TECL', name: 'Direxion Tech Bull 3X', reason: '3x leveraged tech for aggressive growth', score: 79 },
      { symbol: 'SOXL', name: 'Direxion Semiconductor Bull 3X', reason: 'Leveraged semiconductor exposure', score: 80 }
    ]
  },
  mutual_funds: {
    conservative: [
      { symbol: 'VFIAX', name: 'Vanguard 500 Index Fund', reason: 'S&P 500 tracking with low expense ratio', score: 86 },
      { symbol: 'VBTLX', name: 'Vanguard Total Bond Market Index', reason: 'Broad bond market diversification', score: 84 },
      { symbol: 'VWINX', name: 'Vanguard Wellesley Income', reason: 'Conservative balanced fund with income focus', score: 82 },
      { symbol: 'DODGX', name: 'Dodge & Cox Income Fund', reason: 'Active bond management with quality focus', score: 81 },
      { symbol: 'VWELX', name: 'Vanguard Wellington', reason: '60/40 balanced fund for stability', score: 83 }
    ],
    moderate: [
      { symbol: 'VTSAX', name: 'Vanguard Total Stock Market Index', reason: 'Complete US market exposure at low cost', score: 87 },
      { symbol: 'FXAIX', name: 'Fidelity 500 Index Fund', reason: 'Zero expense ratio S&P 500 fund', score: 85 },
      { symbol: 'VTIAX', name: 'Vanguard Total International Stock', reason: 'Global diversification beyond US', score: 82 },
      { symbol: 'VGSTX', name: 'Vanguard STAR Fund', reason: 'All-in-one balanced allocation', score: 80 },
      { symbol: 'FFNOX', name: 'Fidelity Growth Company', reason: 'Active growth stock selection', score: 83 }
    ],
    aggressive: [
      { symbol: 'FSCSX', name: 'Fidelity Software & IT Services', reason: 'Concentrated tech sector exposure', score: 85 },
      { symbol: 'FSPTX', name: 'Fidelity Select Technology', reason: 'Pure technology play with active management', score: 84 },
      { symbol: 'FBGRX', name: 'Fidelity Blue Chip Growth', reason: 'Large-cap growth with quality focus', score: 86 },
      { symbol: 'PRGFX', name: 'T. Rowe Price Growth Stock', reason: 'Long-term growth stock selection', score: 83 },
      { symbol: 'TRBCX', name: 'T. Rowe Price Blue Chip Growth', reason: 'Innovation-focused growth investing', score: 82 }
    ]
  },
  bonds: {
    conservative: [
      { symbol: 'US10Y', name: 'US 10-Year Treasury', reason: 'Risk-free rate at 4.5% providing stable income', score: 88 },
      { symbol: 'AGG', name: 'iShares Core US Aggregate Bond', reason: 'Investment-grade bond diversification', score: 85 },
      { symbol: 'TIPS', name: 'Treasury Inflation-Protected Securities', reason: 'Inflation protection with government backing', score: 84 },
      { symbol: 'MUB', name: 'iShares National Muni Bond ETF', reason: 'Tax-free municipal bond income', score: 82 },
      { symbol: 'BIV', name: 'Vanguard Intermediate-Term Bond', reason: 'Intermediate duration reducing rate risk', score: 81 }
    ],
    moderate: [
      { symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate', reason: 'Quality corporate bonds with 5%+ yields', score: 84 },
      { symbol: 'VCIT', name: 'Vanguard Intermediate-Term Corporate', reason: 'Corporate bonds with moderate duration', score: 83 },
      { symbol: 'BNDX', name: 'Vanguard Total International Bond', reason: 'Global bond diversification opportunity', score: 80 },
      { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond', reason: 'Long-duration for rate cut positioning', score: 79 },
      { symbol: 'GOVT', name: 'iShares US Treasury Bond ETF', reason: 'Pure US government bond exposure', score: 82 }
    ],
    aggressive: [
      { symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate', reason: 'High-yield bonds offering 7%+ income', score: 81 },
      { symbol: 'JNK', name: 'SPDR Bloomberg High Yield Bond', reason: 'Junk bond exposure for yield seekers', score: 80 },
      { symbol: 'EMB', name: 'iShares JP Morgan USD Emerging Market', reason: 'EM bonds with attractive yields', score: 78 },
      { symbol: 'ANGL', name: 'VanEck Fallen Angel High Yield', reason: 'Downgraded bonds with recovery potential', score: 77 },
      { symbol: 'FALN', name: 'iShares Fallen Angels USD Bond', reason: 'Former investment-grade at high yields', score: 79 }
    ]
  },
  reits: {
    conservative: [
      { symbol: 'O', name: 'Realty Income Corporation', reason: 'Monthly dividend REIT with 5.5% yield', score: 85 },
      { symbol: 'VNQ', name: 'Vanguard Real Estate ETF', reason: 'Diversified REIT exposure across sectors', score: 83 },
      { symbol: 'PLD', name: 'Prologis', reason: 'Industrial logistics REITs benefiting from e-commerce', score: 84 },
      { symbol: 'ARE', name: 'Alexandria Real Estate', reason: 'Life science properties with long-term leases', score: 82 },
      { symbol: 'WELL', name: 'Welltower Inc.', reason: 'Healthcare REITs with aging demographics tailwind', score: 81 }
    ],
    moderate: [
      { symbol: 'AMT', name: 'American Tower', reason: 'Cell tower REIT benefiting from 5G buildout', score: 86 },
      { symbol: 'EQIX', name: 'Equinix', reason: 'Data center REIT with cloud computing growth', score: 85 },
      { symbol: 'PSA', name: 'Public Storage', reason: 'Self-storage leader with pricing power', score: 82 },
      { symbol: 'SPG', name: 'Simon Property Group', reason: 'Premium mall REIT with retail recovery', score: 80 },
      { symbol: 'DLR', name: 'Digital Realty Trust', reason: 'Data centers powering AI infrastructure', score: 84 }
    ],
    aggressive: [
      { symbol: 'EQIX', name: 'Equinix', reason: 'AI data center demand creating capacity constraints', score: 88 },
      { symbol: 'DLR', name: 'Digital Realty Trust', reason: 'Hyperscale data center expansion accelerating', score: 86 },
      { symbol: 'CCI', name: 'Crown Castle', reason: 'Small cell deployment for 5G networks', score: 83 },
      { symbol: 'INVH', name: 'Invitation Homes', reason: 'Single-family rental with housing shortage', score: 82 },
      { symbol: 'CSGP', name: 'CoStar Group', reason: 'Commercial real estate data platform', score: 81 }
    ]
  },
  options: {
    conservative: [
      { symbol: 'SPY Covered Calls', name: 'SPY Monthly Covered Calls', reason: 'Generate 1-2% monthly income on S&P 500 holdings', score: 84 },
      { symbol: 'QQQ Cash-Secured Puts', name: 'QQQ Cash-Secured Puts', reason: 'Earn premium while waiting to buy Nasdaq 100', score: 82 },
      { symbol: 'Wheel Strategy', name: 'Dividend Stock Wheel', reason: 'Combine puts and calls on blue-chips', score: 80 },
      { symbol: 'Poor Mans Covered Call', name: 'LEAPS Calendar Spreads', reason: 'Lower capital for covered call strategy', score: 78 },
      { symbol: 'Iron Condor', name: 'SPY Iron Condors', reason: 'Profit from low volatility with defined risk', score: 79 }
    ],
    moderate: [
      { symbol: 'MSFT Call Spreads', name: 'MSFT Bull Call Spreads', reason: 'Limited risk tech exposure with earnings catalyst', score: 84 },
      { symbol: 'SPY Straddles', name: 'SPY Weekly Straddles', reason: 'Profit from volatility around Fed announcements', score: 81 },
      { symbol: 'Diagonal Spreads', name: 'QQQ Diagonal Spreads', reason: 'Capture theta decay with upside exposure', score: 83 },
      { symbol: 'Credit Spreads', name: 'SPY Credit Spreads', reason: 'High probability income from time decay', score: 82 },
      { symbol: 'Broken Wing Butterfly', name: 'Index Butterflies', reason: 'Asymmetric risk/reward in range-bound markets', score: 80 }
    ],
    aggressive: [
      { symbol: 'NVDA Call Options', name: 'NVDA Short-Term Calls', reason: 'Leverage AI chip momentum with earnings volatility', score: 86 },
      { symbol: '0DTE SPX', name: 'SPX 0DTE Options', reason: 'Intraday gamma scalping for active traders', score: 83 },
      { symbol: 'TSLA Strangles', name: 'TSLA Long Strangles', reason: 'High IV stocks for volatility plays', score: 82 },
      { symbol: 'Ratio Spreads', name: 'Tech Stock Ratio Spreads', reason: 'Amplified gains in strong trends', score: 80 },
      { symbol: 'Leveraged ETF Options', name: 'SOXL Call Options', reason: '3x leverage on semiconductor momentum', score: 81 }
    ]
  }
};

export function getRecommendations(assetType: AssetType, riskTolerance: number): Recommendation[] {
  let riskLevel: RiskLevel = 'moderate';
  if (riskTolerance < 0.35) riskLevel = 'conservative';
  else if (riskTolerance >= 0.7) riskLevel = 'aggressive';

  const baseRecs = recommendationDatabase[assetType]?.[riskLevel] || recommendationDatabase.stocks.moderate;

  // Apply AI-like enhancements with market sentiment simulation
  const enhancedRecs = baseRecs.map(rec => {
    const marketSentiment = Math.random() * 10 - 5; // -5 to +5 adjustment
    const adjustedScore = Math.max(70, Math.min(95, rec.score + marketSentiment));

    // Add dynamic reasoning based on current context
    let enhancedReason = rec.reason;
    
    if (Math.random() > 0.7) {
      const timingContexts = [
        'Recent momentum suggests continued strength',
        'Technical indicators showing bullish signals',
        'Market consolidation creating entry opportunity',
        'Volume trends supporting upward movement',
        'Sector rotation favoring this position'
      ];
      enhancedReason = timingContexts[Math.floor(Math.random() * timingContexts.length)];
    }

    return {
      ...rec,
      score: Math.round(adjustedScore),
      reason: enhancedReason
    };
  });

  // Shuffle and return top 5
  const shuffled = [...enhancedRecs].sort(() => Math.random() - 0.5);
  return shuffled.sort((a, b) => b.score - a.score).slice(0, 5);
}
