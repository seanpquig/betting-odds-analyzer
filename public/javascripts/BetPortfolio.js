import React from 'react';
import { Col, Table } from 'react-bootstrap';


export default class BetPortfolio extends React.Component {
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
            <tr>
              <td className="athlete-name">McGoat</td>
              <td className="moneyline">-520</td>
              <td className="implied-prob"></td>
              <td className="wager"></td>
              <td className="win-profit"></td>
            </tr>
            <tr>
              <td className="athlete-name">RDA</td>
              <td className="moneyline">+381</td>
              <td className="implied-prob"></td>
              <td className="wager"></td>
              <td className="win-profit"></td>
            </tr>
          </tbody>
        </Table>

      </Col>
    );
  }
}
