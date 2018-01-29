import React from 'react';
import { connect } from 'react-redux'
import { Col, Table, Button } from 'react-bootstrap';
import { formatOdds } from './Utils';


class BetPortfolio extends React.Component {
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
            {this.props.portfolioBets.map(bet =>
              <tr>
                <td className="athlete-name">{bet.name}</td>
                <td className="moneyline">{formatOdds(bet.moneyLine)}</td>
                <td className="implied-prob"></td>
                <td className="wager"></td>
                <td className="win-profit"></td>
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
