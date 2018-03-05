export function formatOdds(odds) {
  return odds > 0 ? "+" + odds : odds;
}

export function convertMoneylineToDecimal(moneyLine) {
  moneyLine = parseFloat(moneyLine);
  if (moneyLine < 0) {
      return (100 - moneyLine) / -moneyLine;
  }
  else if (moneyLine > 0) {
      return (100 + moneyLine) / 100;
  }
}

export function impliedProability(moneyLine) {
  return 1 / convertMoneylineToDecimal(moneyLine);
}

export function winProfit(wager, moneyLine) {
  if (typeof wager !== 'undefined') {
    var profit = wager * (convertMoneylineToDecimal(moneyLine) - 1.0);
    return profit;
  }
}

// Combine bets that belong to the same fight since they are jointly dependent on eachother
export function combineConditionalBets(betData) {
  const fightIds = new Set(betData.map(b => b.fightId));

  // Object for grouping bets based on fightId
  const fightIdToBetsMap = {};
  fightIds.forEach(id => fightIdToBetsMap[id] = {});

  // Combine bets by fightId
  betData.forEach(bet => {
    const fightId = bet.fightId;
    const athleteName = bet.athleteName;

    if (fightIdToBetsMap[fightId][athleteName] != undefined) {
      fightIdToBetsMap[fightId][athleteName].wager += bet.wager;
      fightIdToBetsMap[fightId][athleteName].winProfit += bet.winProfit;
    } else {
      fightIdToBetsMap[fightId][athleteName] = {
        "wager": bet.wager, "winProfit": bet.winProfit, "probability": bet.probability
      };
    }
  });

  // Convert to orginal betData format
  var transformedBetData = [];
  for (const [fightId, bets] of Object.entries(fightIdToBetsMap)) {
    let totalWager = 0;
    let winProfit = null;
    let lossProfit = 0;
    let probability = null;

    for (const [athleteName, betInfo] of Object.entries(bets)) {
      totalWager += betInfo.wager;
      if (winProfit !== null) {
        lossProfit += betInfo.winProfit;
        winProfit -= betInfo.wager;
      } else {
        winProfit = betInfo.winProfit;
        lossProfit = -betInfo.wager;
        probability = betInfo.probability;
      }
    }

    transformedBetData.push({
      "wager": totalWager,
      "winProfit": winProfit,
      "lossProfit": lossProfit,
      "probability": probability
    });
  }

  return transformedBetData;
}
