import React from 'react';
import { Col, FormGroup, ControlLabel, FormControl, Table, Button } from 'react-bootstrap';


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
      fightAthletes: {1: {id: 1, athlete1: {}, athlete2: {}}},
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
        // Get athlete data for all fights
        const athleteUrlPairs = fights.map(fight => [fight.athlete1_id, fight.athlete2_id])
          .map(pair => pair.map(id => jsRoutes.controllers.StatsDatabase.getAthlete(id).url));

        // Messy nested promise resolution. May be a cleaner way to do this.
        Promise.all(
          athleteUrlPairs.map(p =>
            Promise.all(p.map(url => fetch(url)))
          )
        ).then(responses =>
          responses.map(p => p.map(item => item.json()))
        ).then(pairs =>
          Promise.all(pairs.map(p => Promise.all(p)))
        ).then(athletePairs => {
          const fightIds = fights.map(f => f.id);
          const fightAthletes = {};
          for (var i = 0; i < athletePairs.length; ++i) {
            const fightId = fightIds[i];
            const pair = athletePairs[i];
            fightAthletes[fightId] = Object.create({id: fightId, athlete1: pair[0], athlete2: pair[1]})
          }
          this.setState({
            fightAthletes: fightAthletes,
            activeFightId: fightIds[0]
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
          {Object.values(this.state.fightAthletes).map(fight => (
            <option key={fight.id} value={fight.id}>{fight.athlete1.fullname} vs. {fight.athlete2.fullname}</option>
          ))}
        </FormControl>
        <SelectedFightTable athletes={this.state.fightAthletes[this.state.activeFightId]} />
        <Button bsStyle="primary" bsSize="large" block id="add-fight-button">
          Add fight to portfolio
        </Button>
      </div>
    );
  }
}


class SelectedFightTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const athlete1 = this.props.athletes.athlete1;
    const athlete2 = this.props.athletes.athlete2;

    return (
      <Table striped bordered condensed hover>
        <tbody>
          <tr>
            <td>
              <div id='athlete1_stats' className='athlete-stats'>
                <span className="fullname"></span>{athlete1.fullname}<br />
                <span className="record">{athlete1.wins}-{athlete1.losses}</span><br />
                <span className="weight">{athlete1.weight_kg}kg</span><br />
                <span className="height">{athlete1.height_cm}cm</span><br />
              </div>
            </td>
            <td>Vs.</td>
            <td>
              <div id='athlete2_stats' className='athlete-stats'>
                <span className="fullname">{athlete2.fullname}</span><br />
                <span className="record">{athlete2.wins}-{athlete2.losses}</span><br />
                <span className="weight">{athlete2.weight_kg}kg</span><br />
                <span className="height">{athlete2.height_cm}cm</span><br />
              </div>
            </td>
          </tr>
        </tbody>
      </Table>
    );
  }
}
