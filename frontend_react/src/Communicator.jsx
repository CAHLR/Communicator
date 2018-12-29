import React, { Component } from 'react';

import * as d3 from 'd3';

import { Charts } from './Charts';

import './styles.css';

/*
TODOs for Jeff:
- refactor all event hooks from client_main into the component itself
- compartmentalize the parts of the Communicator UI
- deglobalify and componentize cross_main and client_main functions
*/

class Communicator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      analyticsOptions: [],
      dropdownValue: '',
      instructorEmail: '',
      emailButtonError: '',
      analyticsRadio: false,
      selectedStudents: [],
      emailButtonClicked: false,
      totalActiveLearners: 0,
      totalLearners: 0,
    };

    this.onEmailButtonClick = this.onEmailButtonClick.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onAnalyticsRadioClick = this.onAnalyticsRadioClick.bind(this);
    this.onAttrClick = this.onAttrClick.bind(this);
    this.onCompNoCertClick = this.onCompNoCertClick.bind(this);
    this.getAnalytics = this.getAnalytics.bind(this);
    this.getAll = this.getAll.bind(this);
    this.setInstructorEmail = this.setInstructorEmail.bind(this);
    this.drawGraphs = this.drawGraphs.bind(this);
    this.clearDrop = this.clearDrop.bind(this);
    this.makeName = this.makeName.bind(this);
    this.sendEmails = this.sendEmails.bind(this);
    this.sendPolicy = this.sendPolicy.bind(this);
  }

  componentWillMount() {
    this.onLoad();
  }

  onAttrClick() {
    console.log('test');
  }

  onCompNoCertClick() {
    console.log('test');
  }

  onEmailButtonClick() {
    if (this.state.instructorEmail === '' || !this.state.instructorEmail.includes('@')) {
      this.setState({
        emailButtonError: 'You have entered an invalid Instructor Email',
      });
    } else if (this.state.emailButtonClicked) {
      this.sendEmails();
      this.sendPolicy();
      if (this.state.analyticsRadio) {
        this.getAnalytics();
      } else {
        this.getAll();
      }

      this.setState({
        emailButtonClicked: false,
      });
    } else {
      this.setState({
        emailButtonClicked: true,
      });
    }
  }

  onLoad() {
    this.drawGraphs(`https://${process.env.SERVER}:${process.env.PORT}/api/predictions`);
  }

  onAnalyticsRadioClick(event) {
    this.setState({
      analyticsRadio: event.target.checked,
    });
  }

  async getAll() {
    console.log('test');
  }

  async getAnalytics() {
    let analyticsApiResult = await fetch(`https://${process.env.SERVER}:${process.env.PORT}/api/analytics`, {
      method: 'GET',
    });
    analyticsApiResult = await analyticsApiResult.json();
    if (analyticsApiResult) {
      this.clearDrop();
      const appendedOptions = [];
      // TODO(Jeff): use a better variable name here
      const analyticsKeys = Object.keys(analyticsApiResult);
      for (let i = 0; i < analyticsKeys.length; i += 1) {
        let name = this.makeName(
          analyticsApiResult[analyticsKeys[i]].timestamp,
          analyticsApiResult[analyticsKeys[i]].subject,
        );
        if (analyticsApiResult[analyticsKeys[i]].auto === 'true') {
          name = `(Active) ${name}`;
        }
        appendedOptions.append((
          <option value={JSON.stringify(analyticsApiResult[analyticsKeys[i]])}>
            {name}
          </option>
        ));
      }

      this.setState({
        analyticsOptions: [...this.state.analyticsOptions, ...appendedOptions],
      });
    }
  }

  setInstructorEmail(event) {
    this.setState({
      instructorEmail: event.target.value,
    });
  }

  sendEmails() {
    console.log('test');
  }

  sendPolicy() {

  }

  drawGraphs(dataUrl, json) {
    if (json) {
      d3.json(dataUrl);
    } else {
      d3.csv(dataUrl).header('Authorization', `Basic ${btoa(`${process.env.SECRET_USERNAME}:${process.env.SECRET_PASSWORD}`)}`).get(loadData);
    }
  }

  clearDrop() {
    this.setState({
      dropdownValue: '',
      analyticsOptions: [<option selected disabled value="Load Past Communications">Load Past Communications</option>],
    });
  }

  /**
   * Creates the name for the dropdown which includes the date and subject.
   * @param {String} timestamp the timestamp of the dropdown option, in ISO8601 string form
   * @param {String} subject the subject of the dropdown option
   */
  makeName(timestamp, subject) {
    const formattedDate = new Date(timestamp).toDateString().split(' ');
    return `${formattedDate[1]} ${formattedDate[2]} ${formattedDate[3]} - ${subject}`;
  }

  render() {
    return (
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: '0.5em' }}>Communicator</h1>
        <h3>Select recipients by:</h3>

        <form className="radios">
          <div>
            <input type="radio" id="analyticsRadio" name="type" value="analytics" checked={this.state.analyticsRadio} onChange={this.onAnalyticsRadioClick} />
            Analytics
            <input type="radio" id="allRadio" name="type" value="all" />
            All Learners
          </div>
        </form>

        <select id="myDropdown" onChange="optSelected(this.value)" >
          {this.state.dropdownValue}
          {this.state.analyticsOptions}
        </select>
        <div id="analytics">
          <p style={{ float: 'left', clear: 'left', marginTop: '30px' }}>
            Analytics pre-sets to try:
            <button type="button" id="comp-no-cert" onClick={this.onCompNoCertClick}>
              Predicted to complete but not to earn a certificate
            </button>
            <button type="button" id="attr-no-comp-cert" onClick={this.onAttrClick}>
              Predicted to attrit and not complete
            </button>
          </p>

          <Charts />

          <aside id="totals">
            <span id="active">
              {this.state.totalActiveLearners > 0 ? this.state.totalActiveLearners : "-"}
            </span>
            <span id="percentage" />
            of
            <span id="total">{this.state.totalLearners > 0 ? this.state.totalLearners : "-"}</span>
            learners selected
          </aside>

          <div id="lists">
            <div id="student-list" className="list">
              <div>
                <div style={{ width: '200px', display: 'inline-block' }}>Anonymized Student ID</div>
                <div style={{ width: '150px', display: 'inline-block' }}>Completion %</div>
                <div style={{ width: '150px', display: 'inline-block' }}>Attrition %</div>
                <div style={{ width: '150px', display: 'inline-block' }}>Certification %</div>
              </div>
            </div>
          </div>

        </div>

        <form style={{ borderStyle: 'solid', padding: '20px', marginTop: '50px' }}>
          <h3>Compose Email</h3>
          <h6 id="recipients">Recipients</h6>
          <h6 id="all-recipients">All Recipients</h6>

          <div style={{ marginTop: '20px' }}>
            <input id="from-name" type="text" placeholder="Instructor Name" />
            <input id="reply-to" type="text" placeholder="Instructor Email" value={this.state.instructorEmail} onChange={this.setInstructorEmail} />
            <p id="email-button-error">{this.state.emailButtonError}</p>
            <h4>From</h4>
            <div>
              <input id="email-subject" type="text" placeholder="Subject" />
              <h4>Subject</h4>
              <textarea id="email-body" placeholder="Use [:fullname:] to insert learner's full name and [:firstname:] to insert learner's last name" />
              <h4>Body</h4>

              <button
                type="button"
                id="emailButton"
                onClick={this.onEmailButtonClick}
                style={{
                  backgroundColor: this.state.emailButtonClicked ? 'red' : '#e4e4e4',
                  backgroundImage: this.state.emailButtonClicked ? 'linear-gradient(red,#8b0000)' : 'linear-gradient(#e4e4e4,#d1c9c9)',
                }}
              >
                {(() => {
                  if (this.state.emailButtonClicked) {
                    if (!this.state.analyticsRadio) {
                      return `Are you sure you want to send this email to ${this.state.selectedStudents.length} students?`;
                    }
                    return `Are you sure you want to send this email to ${this.state.totalActiveLearners} students?`;
                  }
                  return 'Send email to selected learners';
                })()}
              </button>
              <input id="automated" type="checkbox" />
              <p id="automated2" style={{ display: 'inline' }}>Automatically check for and send to new matches found daily</p>
              <p id="tip">Tip: Enabling this feature will check everyday for learners who meet the analytics criteria of this communication and will send this email to them (learners will never recieve an email twice).</p>
              <p>
                *Please check the maximum daily recipient limit of your email provider.
                For example, Gmail is 500 per day.*
              </p>
            </div>
          </div>
        </form>
        <button href="#" type="button" id="saveChanges" className="save">Save Changes</button>
      </div>
    );
  }
}

export default Communicator;
