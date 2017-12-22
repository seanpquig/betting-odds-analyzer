import React from 'react';
import { Col, FormGroup, ControlLabel, FormControl } from 'react-bootstrap';


class FightSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // event fights received from the backend server
      fights: []
    };
    this.getFights = this.getFights.bind(this);
  }

  getFights(eventId) {
    var getFightsCall = jsRoutes.controllers.StatsDatabase.getFights(eventId)

    fetch(getFightsCall.url)
      .then(response => response.json())
      .then(json => {
        this.setState({
          fights: json
        });
      }).catch(function(ex) {
        console.log('parsing failed', ex);
      });
  }

  componentWillMount() {
    // Load events from backend
    this.getFights(this.props.eventId);
  }

  render() {
    return (
      <div>
        <ControlLabel>Fight</ControlLabel>
        <FormControl componentClass="select" placeholder="select">
          {this.state.fights.map(fight => (
            <option key={fight.id} >{fight.id}</option>
          ))}
        </FormControl>
      </div>
    );
  }
}


class EventSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // organization events received from the backend server
      events: []
    };
    this.getEvents = this.getEvents.bind(this);
  }

  getEvents(orgId) {
    var getEventsCall = jsRoutes.controllers.StatsDatabase.getEvents(orgId)

    fetch(getEventsCall.url)
      .then(response => response.json())
      .then(json => {
        this.setState({
          events: json
        });
      }).catch(function(ex) {
        console.log('parsing failed', ex);
      });
  }

  componentWillMount() {
    // Load events from backend
    this.getEvents(this.props.orgId);
  }

  render() {
    return (
      <div>
        <ControlLabel>Event</ControlLabel>
        <FormControl componentClass="select" placeholder="select">
          {this.state.events.map(event => (
            <option key={event.name}>{event.name}</option>
          ))}
        </FormControl>
        <FightSelector eventId="1"/>
      </div>
    );
  }
}


class MatchSelector extends React.Component {
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

export default MatchSelector;
