import React, { Component } from 'react';

export default class Charts extends Component {
  constructor(props) {
    super(props);
  }

  
  render = () => {
    return (
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
    )
  }
}