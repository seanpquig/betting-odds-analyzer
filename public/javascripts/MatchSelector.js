import React from 'react';
import { Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';


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
    var getEventsCall = jsRoutes.controllers.StatsDatabase.getEvents(orgId);

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
      fights: [],
      fightAthletes: []
    };
    this.getFights = this.getFights.bind(this);
  }

  getFights(eventId) {
    var getFightsCall = jsRoutes.controllers.StatsDatabase.getFights(eventId);

    fetch(getFightsCall.url)
      .then(response => response.json())
      .then(fights => {
        // Get athlete names for all fights
        var urls = fights.map(fight => jsRoutes.controllers.StatsDatabase.getAthleteNames(fight.id).url);

        Promise.all(
          urls.map(url => fetch(url))
        ).then(responses =>
          Promise.all(responses.map(r => r.json()))
        ).then(fightAthletes =>
          this.setState({
            fights: fights,
            fightAthletes: fightAthletes
          })
        )
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

  render() {
    return (
      <div>
        <ControlLabel>Fight</ControlLabel>
        <FormControl componentClass="select" placeholder="select">
          {this.state.fightAthletes.map(fight => (
            <option key={fight.fightId}>{fight.athlete1} vs. {fight.athlete2}</option>
          ))}
        </FormControl>
      </div>
    );
  }
}
