import React from 'react';
import { connect } from 'react-redux'
import { Col, Table, Button } from 'react-bootstrap';
import { formatOdds, impliedProability, winProfit } from './Utils';


class BetPortfolio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {wagers: {}};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, idx) {
    var wagers = this.state.wagers;
    wagers[idx] = e.target.value;
    this.setState({wagers: wagers});
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
                  ${winProfit(this.state.wagers[idx], bet.moneyLine)}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

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
