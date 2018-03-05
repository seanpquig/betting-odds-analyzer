import React from 'react';
import { connect } from 'react-redux'
import { Col, Table, Button } from 'react-bootstrap';
import PortfolioStats from './PortfolioStats';
import { formatOdds, impliedProability, winProfit, combineConditionalBets } from './Utils';


class BetPortfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {wagers: {}, probabilities: {}, winProfits: {}};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, idx) {
    // populate wagers
    const wagers = this.state.wagers;
    const wagerParse = parseFloat(e.target.value);
    const wager = isNaN(wagerParse) ? 0 : wagerParse;
    wagers[idx] = wager;

    // populate probabilities
    const moneyLine = this.props.portfolioBets[idx].moneyLine;
    const prob = impliedProability(moneyLine);
    const probs = this.state.probabilities
    probs[idx] = prob;

    // populate win profits
    const profit = winProfit(wager, moneyLine);
    const profits = this.state.winProfits;
    profits[idx] = profit;

    this.setState({wagers: wagers, probabilities: probs, winProfits: profits});
  }

  getBetData() {
    const betData = this.props.portfolioBets
      .filter((bet, idx) => idx in this.state.wagers)
      .map((bet, idx) => (
        {
          athleteName: bet.name,
          wager: this.state.wagers[idx],
          probability: this.state.probabilities[idx],
          winProfit: this.state.winProfits[idx],
          fightId: bet.fightId
        }
      ));

    return combineConditionalBets(betData);
  }

  render() {
    return (
      <Col md={8} id="bet-portfolio">
        <label>Bet Portfolio</label>
        <Table bordered condensed hover>
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Moneyline</th>
              <th>Implied Prob.</th>
              <th>Wager</th>
              <th>Win Profit</th>
            </tr>
          </thead>
          <tbody>
            {this.props.portfolioBets.map((bet, idx) =>
              <tr key={bet.name}>
                <td className="athlete-name">{bet.name}</td>
                <td className="moneyline">{formatOdds(bet.moneyLine)}</td>
                <td className="implied-prob">
                  {impliedProability(bet.moneyLine).toFixed(2) * 100 + "%"}
                </td>
                <td className="wager">
                  $<input onChange={(e) => this.handleChange(e, idx)}></input>
                </td>
                <td className="win-profit">
                  ${this.state.winProfits[idx]}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        <PortfolioStats betData={this.getBetData()}/>
      </Col>
    );
  }
}

// Connect BetPortfolio to Redux
const mapStateToProps = state => {
  return {
    portfolioBets: state.portfolioChanges.portfolioBets
  }
}

export default connect(mapStateToProps, null)(BetPortfolio);
