import React, { Component } from 'react';

import * as d3 from 'd3';

import { Charts } from './Charts';
import { Spacer } from './Spacer';

import './styles.css';
// TODO(Jeff): remove this in prod
import './edxStyles.css';

/*
TODOs for Jeff:
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
      analyticsRadio: true,
      analyticsDisplay: 'block',
      allRadio: false,
      selectedStudents: [],
      emailButtonClicked: false,
      totalActiveLearners: 0,
      totalLearners: 0,
      emailSubject: '',
      emailBody: '',
      instructorName: '',
      emailSentMessage: '',
      oldSubject: '',
      automatedChecked: false,
      automatedDisplay: 'inline',
      automated2Display: 'inline',
      saveChangesDisplay: 'none',
      tipDisplay: 'none',
      filterLimits: {
        'completion-chart': [0, 100],
        'attrition-chart': [0, 100],
        'certification-chart': [0, 100],
      },
      allRecipientsDisplay: 'none',
      recipientsDisplay: 'block',
    };

    this.onEmailButtonClick = this.onEmailButtonClick.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onAnalyticsRadioClick = this.onAnalyticsRadioClick.bind(this);
    this.onAllRadioClick = this.onAllRadioClick.bind(this);
    this.onAttrClick = this.onAttrClick.bind(this);
    this.onCompNoCertClick = this.onCompNoCertClick.bind(this);
    this.getAnalytics = this.getAnalytics.bind(this);
    this.getAll = this.getAll.bind(this);
    this.setInstructorEmail = this.setInstructorEmail.bind(this);
    this.setEmailSubject = this.setEmailSubject.bind(this);
    this.drawGraphs = this.drawGraphs.bind(this);
    this.clearDrop = this.clearDrop.bind(this);
    this.makeName = this.makeName.bind(this);
    this.sendEmails = this.sendEmails.bind(this);
    this.sendPolicy = this.sendPolicy.bind(this);
    this.loadData = this.loadData.bind(this);
    this.getIDs = this.getIDs.bind(this);
    this.onAutomatedClick = this.onAutomatedClick.bind(this);
    this.setEmailBody = this.setEmailBody.bind(this);
    this.setInstructorName = this.setInstructorName.bind(this);
    this.filter = this.filter.bind(this);
    this.optSelected = this.optSelected.bind(this);
    this.onCheckTipMouseOver = this.onCheckTipMouseOver.bind(this);
    this.onCheckTipMouseOut = this.onCheckTipMouseOut.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.onSaveChangesClick = this.onSaveChangesClick.bind(this);
  }

  componentWillMount() {
    this.onLoad();
  }

  onAttrClick() {
    // TODO(Jeff): document these numbers
    this.filter([[0, 70], [80, 100], [0, 70]]);
  }

  onCompNoCertClick() {
    // TODO(Jeff): document these numbers
    this.filter([[80, 100], null, [0, 20]]);
  }

  onAutomatedClick(event) {
    this.setState({
      automatedChecked: event.target.checked,
    });
  }

  async onEmailButtonClick() {
    if (this.state.instructorEmail === '' || !this.state.instructorEmail.includes('@')) {
      this.setState({
        emailButtonError: 'You have entered an invalid Instructor Email',
      });
    } else if (this.state.emailButtonClicked) {
      await this.sendEmails();
      await this.sendPolicy();
      if (this.state.analyticsRadio) {
        await this.getAnalytics();
      } else {
        await this.getAll();
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

  async onLoad() {
    await this.drawGraphs(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/predictions`);
    await this.getAnalytics();
  }

  onAllRadioClick() {
    this.setState({
      analyticsDisplay: 'none',
      allRadio: true,
      analyticsRadio: false,
      automatedDisplay: 'none',
      automated2Display: 'none',
      allRecipientsDisplay: 'block',
      recipientsDisplay: 'none',
      saveChangesDisplay: 'none',
    });
    this.getAll();
  }

  onAnalyticsRadioClick() {
    this.setState({
      analyticsDisplay: 'block',
      automatedDisplay: 'inline',
      automated2Display: 'inline',
      allRecipientsDisplay: 'none',
      recipientsDisplay: 'block',
      analyticsRadio: true,
      allRadio: false,
    });
    this.getAnalytics();
  }


  onCheckTipMouseOut() {
    this.setState({
      tipDisplay: 'none',
    });
  }

  onCheckTipMouseOver() {
    this.setState({
      tipDisplay: 'block',
    });
  }

  async onSaveChangesClick() {
    await this.saveChanges();
    await this.getAnalytics();
  }

  setEmailBody(event) {
    this.setState({
      emailBody: event.target.value,
    });
  }

  setEmailSubject(event) {
    this.setState({
      emailSubject: event.target.value,
    });
  }

  setInstructorEmail(event) {
    this.setState({
      instructorEmail: event.target.value,
    });
  }

  getIDs() {
    // TODO(Jeff): refactor after integrating cross_filter
    const ids = [];
    for (let i = 0; i < $('.anon-student').length; i += 1) {
      ids.push($('.anon-student')[i].innerHTML);
    }
    return ids;
  }

  async getAll() {
    let settings = await fetch(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/all`, {
      method: 'GET',
    });
    settings = await settings.json();
    if (settings) {
      const analyticsOptions = [];
      const keys = Object.keys(settings);
      for (let i = 0; i < keys.length; i += 1) {
        const name = this.makeName(settings[keys[i]].timestamp, settings[keys[i]].subject);
        analyticsOptions.push(<option value={JSON.stringify(settings[keys[i]])}>{name}</option>);
      }
      this.setState({
        analyticsOptions,
      });
    }
  }

  async getAnalytics() {
    let analyticsApiResult = await fetch(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/analytics`, {
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
        appendedOptions.push((
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

  setInstructorName(event) {
    this.setState({
      instructorName: event.target.value,
    });
  }

  async sendEmails() {
    const ids = this.getIDs();
    const ann = this.state.allRadio;
    // TODO(Jeff): refactor this to be less hacky
    const course = window.location.href.split('+')[1];
    console.log(course);
    // TODO(Jeff): resolve XSS when we host on edx servers
    const settings = await fetch(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/email`, {
      method: 'POST',
      body: JSON.stringify({
        ids,
        subject: this.state.emailSubject,
        body: this.state.emailBody,
        reply: this.state.instructorEmail,
        from: this.state.instructorName,
        pass: process.env.REACT_APP_EMAIL_CODE,
        ann,
        course,
      }),
    });

    if (settings) {
      this.setState({
        emailSentMessage: 'Successfully Sent!',
      });
      setTimeout(() => {
        this.setState({
          emailSentMessage: '',
        });
      }, 7500);
    }
  }

  async saveChanges() {
    const ids = this.getIDs();
    const comp = this.state.filterLimits['completion-chart'];
    const attr = this.state.filterLimits['attrition-chart'];
    const cert = this.state.filterLimits['certification-chart'];
    const automated = this.state.automatedChecked;

    const settings = await fetch(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/changes`, {
      method: 'POST',
      body: JSON.stringify({
        old_subject: this.state.oldSubject,
        ids,
        from: this.state.instructorName,
        reply: this.state.instructorEmail,
        subject: this.state.emailSubject,
        body: this.state.emailBody,
        comp,
        attr,
        cert,
        auto: automated,
      }),
    });

    if (settings) {
      console.log('Policy Successfully Saved!');
    }
  }

  async sendPolicy() {
    const ids = this.getIDs();
    const comp = this.state.filterLimits['completion-chart'];
    const attr = this.state.filterLimits['attrition-chart'];
    const cert = this.state.filterLimits['certification-chart'];

    const automated = this.state.automatedChecked;
    const analytics = this.state.analyticsRadio;

    const settings = await fetch(`https://${process.env.REACT_APP_SERVER}:${process.env.REACT_APP_PORT}/api/save`, {
      method: 'POST',
      body: JSON.stringify({
        ids,
        from: this.state.instructorName,
        reply: this.state.instructorEmail,
        subject: this.state.emailSubject,
        body: this.state.emailBody,
        comp,
        attr,
        cert,
        auto: automated,
        analytics,
        timestamp: new Date(),
      }),
    });
    if (settings) {
      console.log('Policy Successfullly Sent!');
    }
  }

  async drawGraphs(dataUrl, json) {
    if (json) {
      d3.json(dataUrl);
    } else {
      const response = await d3.csv(dataUrl, {
        headers: {
          Authorization: `Basic ${btoa(`${process.env.REACT_APP_SECRET_USERNAME}:${process.env.REACT_APP_SECRET_PASSWORD}`)}`,
        },
      });
      await this.loadData(response);
    }
  }

  clearDrop() {
    this.setState({
      dropdownValue: '',
      analyticsOptions: [<option selected disabled value="Load Past Communications">Load Past Communications</option>],
    });
  }

  filter(settings) {
    console.log(settings);
  }

  loadData() {}

  /**
   * Creates the name for the dropdown which includes the date and subject.
   * @param {String} timestamp the timestamp of the dropdown option, in ISO8601 string form
   * @param {String} subject the subject of the dropdown option
   */
  makeName(timestamp, subject) {
    const formattedDate = new Date(timestamp).toDateString().split(' ');
    return `${formattedDate[1]} ${formattedDate[2]} ${formattedDate[3]} - ${subject}`;
  }

  optSelected(response) {
    const r = JSON.parse(response);
    this.setState({
      oldSubject: r.subject,
    });
    this.filter([r.comp, r.attr, r.cert]);
    this.setState({
      emailSubject: r.subject,
      emailBody: r.body,
      instructorEmail: r.reply,
      instructorName: r.from,
    });
    if (r.auto === 'true') {
      this.setState({
        automatedChecked: true,
        saveChangesDisplay: 'none',
      });
    } else {
      this.setState({
        automatedChecked: false,
        saveChangesDisplay: 'none',
      });
    }
    if (r.analytics === 'true') {
      this.setState({
        saveChangesDisplay: 'inline-block',
      });
    }
  }

  render() {
    return (
      <div style={{ padding: 20 }}>
        <h1 style={{ marginBottom: '0.5em' }}>Communicator</h1>
        <h3>Select recipients by:</h3>
        <Spacer />

        <form className="radios">
          <div>
            <input type="radio" id="analyticsRadio" name="type" value="analytics" checked={this.state.analyticsRadio} onChange={this.onAnalyticsRadioClick} />
            Analytics
            <input type="radio" id="allRadio" name="type" value="all" checked={this.state.allRadio} onChange={this.onAllRadioClick} />
            All Learners
          </div>
        </form>

        <select id="myDropdown" onChange={(event) => { this.optSelected(event.target.value); }} >
          {this.state.dropdownValue}
          {this.state.analyticsOptions}
        </select>
        <div id="analytics" style={{ display: this.state.analyticsDisplay }} >
          <p style={{ float: 'left', clear: 'left', marginTop: '30px' }}>
            Analytics pre-sets to try: {/* es-lint-disable no-trailing-spaces */}
            <button type="button" id="comp-no-cert" onClick={this.onCompNoCertClick}>
              Predicted to complete but not to earn a certificate
            </button>
            <div style={{ width: 5, height: 10, display: 'inline-block' }} />
            <button type="button" id="attr-no-comp-cert" onClick={this.onAttrClick}>
              Predicted to attrit and not complete
            </button>
          </p>
          <Spacer />
          <Charts />

          <aside id="totals">
            <span id="active">
              {this.state.totalActiveLearners > 0 ? this.state.totalActiveLearners : '-'}
            </span>
            <span id="percentage" />
            of
            <span id="total">{this.state.totalLearners > 0 ? this.state.totalLearners : '-'}</span>
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

        <form style={{
          borderStyle: 'solid',
          padding: '20px',
          marginTop: '50px',
          minHeight: 550,
          }}
        >
          <h3>Compose Email</h3>
          <Spacer />
          <h6 id="recipients" style={{ display: this.state.recipientsDisplay }}>Recipients</h6>
          <h6 id="all-recipients" style={{ display: this.state.allRecipientsDisplay }}>All Recipients</h6>

          <div style={{ marginTop: '20px' }}>
            <h4>From</h4>
            <Spacer />
            <input id="from-name" type="text" placeholder="Instructor Name" value={this.state.instructorName} onChange={this.setInstructorName} />
            <input id="reply-to" type="text" placeholder="Instructor Email" value={this.state.instructorEmail} onChange={this.setInstructorEmail} />
            <p id="email-button-error">{this.state.emailButtonError}</p>
            <div>
              <Spacer />
              <h4>Subject</h4>
              <input id="email-subject" type="text" placeholder="Subject" value={this.state.emailSubject} onChange={this.setEmailSubject} />
              <Spacer />
              <h4>Body</h4>
              <textarea
                id="email-body"
                placeholder="Use [:fullname:] to insert learner's full name and [:firstname:] to insert learner's last name"
                value={this.state.emailBody}
                onChange={this.setEmailBody}
              />
              <Spacer />
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
              <input
                id="automated"
                type="checkbox"
                checked={this.state.automatedChecked}
                onChange={this.onAutomatedClick}
                onMouseOver={this.onCheckTipMouseOver}
                onMouseOut={this.onCheckTipMouseOut}
                onFocus={() => {}}
                onBlur={() => {}}
                style={{ display: this.state.automatedDisplay }}
              />
              <p
                id="automated2"
                style={{ display: this.state.automated2Display, marginTop: -10 }}
                onMouseOver={this.onCheckTipMouseOver}
                onMouseOut={this.onCheckTipMouseOut}
                onFocus={() => {}}
                onBlur={() => {}}
              >
                Automatically check for and send to new matches found daily
              </p>
              <p id="tip" style={{ display: this.state.tipDisplay }}>Tip: Enabling this feature will check everyday for learners who meet the analytics criteria of this communication and will send this email to them (learners will never recieve an email twice).</p>
              <p style={{ color: 'green' }} >{this.state.emailSentMessage}</p>
              <p>
                *Please check the maximum daily recipient limit of your email provider.
                For example, Gmail is 500 per day.*
              </p>
            </div>
          </div>
        </form>
        <button
          href="#"
          type="button"
          id="saveChanges"
          className="save"
          style={{ display: this.state.saveChangesDisplay }}
          onClick={this.onSaveChangesClick}
        >
        Save Changes
        </button>
      </div>
    );
  }
}

export default Communicator;
