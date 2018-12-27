import React, { Component } from 'react';
import logo from './logo.svg';

import "./styles.css";

class Communicator extends Component {
  render() {
    return (
      <div>
        <h1 style={{ marginBottom: "0.5em" }}>Communicator</h1>
        <h3>Select recipients by:</h3>

        <form className="radios">
          <div>
            <input type="radio" id="analyticsRadio" name="type" value="analytics" checked="checked" />
            Analytics
            <input type="radio" id="allRadio" name="type" value="all" />
            All Learners
          </div>
        </form>

        <select id="myDropdown" onchange="optSelected(this.value)"></select>
        <div id="analytics">
          <p style={{ float: "left", clear: "left", marginTop: "30px" }}>
            Analytics pre-sets to try:
            <button type="button" id="comp-no-cert">Predicted to complete but not to earn a certificate</button>
            <button type="button" id="attr-no-comp-cert">Predicted to attrit and not complete</button>
          </p>

          <div id="charts">
            <div id="completion-chart" className="chart">
              <div className="title">Completion % chance</div>
            </div>
            <div id="attrition-chart" className="chart">
              <div className="title">Attrition % chance</div>
            </div>
            <div id="certification-chart" className="chart">
              <div className="title">Certification % chance</div>
            </div>
          </div>

          <aside id="totals">
            <span id="active">-</span><span id="percentage"></span> of <span id="total">-</span> learners selected
          </aside>

          <div id="lists">
            <div id="student-list" className="list">
              <div>
                <div style={{ width: "200px", display: "inline-block" }}>Anonymized Student ID</div>
                <div style={{ width: "150px", display: "inline-block" }}>Completion %</div>
                <div style={{ width: "150px", display: "inline-block" }}>Attrition %</div>
                <div style={{ width: "150px", display: "inline-block" }}>Certification %</div>
              </div>
            </div>
          </div>

        </div>

        <form style={{ borderStyle: "solid", padding: "20px", marginTop: "50px" }}>
            <h3>Compose Email</h3>
            <h6 id="recipients" ></h6>
            <h6 id="all-recipients"></h6>

            <div style={{ marginTop: "20px" }}>
              <input id="from-name" type="text" placeholder="Instructor Name" />
              <input id="reply-to" type="text" placeholder="Instructor Email" />
              <h4>From</h4>
              <div>
                <input id="email-subject" type="text" placeholder="Subject" />
                <h4>Subject</h4>
                <textarea id="email-body" placeholder="Use [:fullname:] to insert learner's full name and [:firstname:] to insert learner's last name"></textarea>
                <h4>Body</h4>

                <button type="button" id="emailButton">Send email to selected learners</button>
                <input id="automated" type="checkbox" />
                <p id="automated2" style={{ display: "inline" }}>Automatically check for and send to new matches found daily</p>
                <p id="tip">Tip: Enabling this feature will check everyday for learners who meet the analytics criteria of this communication and will send this email to them (learners will never recieve an email twice).</p>
                <p>*Please check the maximum daily recipient limit of your email provider. For example, Gmail is 500 per day.*</p>
              </div>
            </div>
        </form>
        <button href="#" type="button" id="saveChanges" className="save">Save Changes</button>
      </div>
    );
  }
}

export default Communicator;
