import React from 'react';
import { connect } from 'react-redux'
import { Col, FormGroup, ControlLabel, FormControl, Table, Button } from 'react-bootstrap';
import { formatOdds } from './Utils';


export default class MatchSelector extends React.Component {
  render() {
    return (
      <Col md={4} id="match-selector">
        <FormGroup controlId="formControlsSelect">
          <EventSelector orgId="1" />
        </FormGroup>
      </Col>
    );
  }
}


class EventSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // organization events received from the backend server
      events: [],
      activeEventId: ''
    };
    this.getEvents = this.getEvents.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getEvents(orgId) {
    const getEventsCall = jsRoutes.controllers.StatsDatabase.getEvents(orgId);

    fetch(getEventsCall.url)
      .then(response => response.json())
      .then(events => {
        this.setState({
          events: events,
          activeEventId: events[0].id
        });
      }).catch(function(ex) {
        console.log('getEvents parsing failed', ex);
      });
  }

  componentDidMount() {
    // Load events from backend
    this.getEvents(this.props.orgId);
  }

  handleChange(event) {
    this.setState({activeEventId: event.target.value});
  }

  render() {
    return (
      <div>
        <ControlLabel>Event</ControlLabel>
        <FormControl componentClass="select" onChange={this.handleChange} value={this.state.activeEventId}>
          {this.state.events.map(event =>
            <option key={event.id} value={event.id}>{event.name}</option>
          )}
        </FormControl>
        <FightSelector eventId={this.state.activeEventId}/>
      </div>
    );
  }
}


class FightSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // event fights received from the backend server
      fightInfo: {1: {fight_id: 1, athlete1: {}, athlete2: {}, odds:{}}},
      activeFightId: 1
    };
    this.getFights = this.getFights.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  getFights(eventId) {
    const getFightsCall = jsRoutes.controllers.StatsDatabase.getFights(eventId);

    fetch(getFightsCall.url)
      .then(response => response.json())
      .then(fights => {
        // Get info for all of the event's fights
        const fightInfoUrls = fights.map(fight => jsRoutes.controllers.StatsDatabase.getFightInfo(fight.id).url);

        Promise.all(fightInfoUrls.map(url =>
          fetch(url).then(resp => resp.json())
        )).then(fightInfoJson => {
          // Format and add fight info to state
          const fightInfo = {};
          for (var i = 0; i < fightInfoJson.length; ++i) {
            const info = fightInfoJson[i];
            fightInfo[info.fight_id] = info;
          }
          this.setState({
            fightInfo: fightInfo,
            activeFightId: fightInfoJson[0].fight_id
          });
        })
      }).catch(function(ex) {
        console.log('getFights parsing failed', ex);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    // Load events from backend
    if (this.props.eventId && prevProps != this.props) {
      this.getFights(this.props.eventId);
    }
  }

  handleChange(event) {
    this.setState({activeFightId: event.target.value});
  }

  render() {
    return (
      <div>
        <ControlLabel>Fight</ControlLabel>
        <FormControl componentClass="select" onChange={this.handleChange} value={this.state.activeFightId}>
          {Object.values(this.state.fightInfo).map(info => (
            <option key={info.fight_id} value={info.fight_id}>{info.athlete1.fullname} vs. {info.athlete2.fullname}</option>
          ))}
        </FormControl>
        <br />
        <VisibileSelectedFightTable fightInfo={this.state.fightInfo[this.state.activeFightId]} />
      </div>
    );
  }
}


class SelectedFightTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const info = this.props.fightInfo;
    const fightId = info.fight_id;
    const athlete1 = info.athlete1;
    const athlete2 = info.athlete2;
    const odds1 = info.odds[athlete1.fullname];
    const odds2 = info.odds[athlete2.fullname];

    const newBets = [
      { name: athlete1.fullname, moneyLine: odds1, fightId: fightId },
      { name: athlete2.fullname, moneyLine: odds2, fightId: fightId }
    ]

    return (
      <div>
        <Table striped bordered condensed hover>
          <tbody>
            <tr>
              <td>
                <div id='athlete1_stats' className='athlete-stats'>
                  <span className="fullname"></span>{athlete1.fullname}<br />
                  <span className="record">{athlete1.wins}-{athlete1.losses}</span><br />
                  <span className="weight">{athlete1.weight_kg}kg</span><br />
                  <span className="height">{athlete1.height_cm}cm</span><br />
                  <span className="odds">{formatOdds(odds1)}</span><br />
                </div>
              </td>
              <td>Vs.</td>
              <td>
                <div id='athlete2_stats' className='athlete-stats'>
                  <span className="fullname">{athlete2.fullname}</span><br />
                  <span className="record">{athlete2.wins}-{athlete2.losses}</span><br />
                  <span className="weight">{athlete2.weight_kg}kg</span><br />
                  <span className="height">{athlete2.height_cm}cm</span><br />
                  <span className="odds">{formatOdds(odds2)}</span><br />
                </div>
              </td>
            </tr>
          </tbody>
        </Table>
        <Button bsStyle="primary" bsSize="large" block id="add-fight-button"
          onClick={() => this.props.onAddBetClick(newBets)}>
          Add fight to portfolio
        </Button>
      </div>
    );
  }
}

// Connect SelectedFightTable to Redux
const mapDispatchToProps = dispatch => {
  return {
    onAddBetClick: (newBets) => dispatch({ type: 'ADD_BET', newBets: newBets })
  }
}

const VisibileSelectedFightTable = connect(null, mapDispatchToProps)(SelectedFightTable);
