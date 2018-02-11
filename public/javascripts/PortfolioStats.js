import React from 'react';
import { Col, Table } from 'react-bootstrap';


export default class PortfolioStats extends React.Component {
  render() {
    return (
      <Col md={8} id="portfolio-stats">
        <SummaryTable betData={this.props.betData}/>
        <ProbabilityScatterplot betData={this.props.betData}/>
      </Col>
    );
  }
}


class SummaryTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const betData = this.props.betData;
    const totalBet = betData.map(b => b.wager).reduce((a, b) => a + b, 0);
    const maxProfit = betData.map(b => b.winProfit).reduce((a, b) => a + b, 0);
    const expectedProfit = betData.map(b => b.winProfit * b.probability).reduce((a, b) => a + b, 0);
    const maxReturn = (totalBet > 0) ? maxProfit / totalBet * 100.0 : 0.0;
    const expectedReturn = (totalBet > 0) ? expectedProfit / totalBet * 100.0 : 0.0;

    return (
      <Col md={4} id="portfolio-stats">
        <Table bordered condensed hover>
          <tbody>
            <tr>
              <td>Total bet</td>
              <td>${totalBet.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Max profit</td>
              <td>${maxProfit.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Expected profit</td>
              <td>${expectedProfit.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Max return</td>
              <td>{maxReturn.toFixed(2)}%</td>
            </tr>
            <tr>
              <td>Expected return</td>
              <td>{expectedReturn.toFixed(2)}%</td>
            </tr>
          </tbody>
        </Table>
      </Col>
    );
  }
}


class ProbabilityScatterplot extends React.Component {
  render() {
    return (
      <Col md={4} id="probability-scatterplot">
      </Col>
    )
  }
}
