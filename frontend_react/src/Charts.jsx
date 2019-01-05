import React from 'react';

import * as d3 from 'd3';
import PropTypes from 'prop-types';
import * as crossfilter from 'crossfilter2';

import { Spacer } from './Spacer';

export class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterLimits: {
        'completion-chart': [0, 100],
        'attrition-chart': [0, 100],
        'certification-chart': [0, 100],
      },
    };
    const tempCrossfilter = crossfilter([]);
    this.completion = tempCrossfilter.dimension(d => d.completion_prediction);
    this.attrition = tempCrossfilter.dimension(d => d.attrition_prediction);
    this.certification = tempCrossfilter.dimension(d => d.certification_prediction);
    this.completions = this.completion.group(Math.floor);
    this.attritions = this.attrition.group(Math.floor);
    this.certifications = this.certification.group(Math.floor);
    this.anonUserId = tempCrossfilter.dimension(d => d.anon_user_id);
    this.charts = [];
    this.idLookup = {};

    this.initialized = false;

    this.onAttrClick = this.onAttrClick.bind(this);
    this.onCompNoCertClick = this.onCompNoCertClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.filteredStudents !== this.props.filteredStudents) {
      return true;
    }
    // deep equality check
    if (JSON.stringify(nextState.filterLimits) !== JSON.stringify(this.state.filterLimits)) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    // eslint-disable-next-line
    const charts = this.renderCharts(this.props.allStudents, this.props.filteredStudents);
  }

  onAttrClick() {
    // TODO(Jeff): document these numbers
    const limits = [[0, 70], [80, 100], [0, 70]];
    this.charts.forEach((c, i) => {
      c.filter(limits[i]);
    });
  }

  onCompNoCertClick() {
    // TODO(Jeff): document these numbers
    const limits = [[80, 100], null, [0, 20]];
    this.charts.forEach((c, i) => {
      c.filter(limits[i]);
    });
  }

  /* eslint-disable */
  barChart(htmlId) {
    if (!this.barChart.id) this.barChart.id = 0;
    let id;

    if (!(htmlId in this.idLookup)) {
      this.idLookup[htmlId] = this.barChart.id;
      id = this.barChart.id;
    } else {
      id = this.idLookup[htmlId];
    }

    const margin = {
      top: 10,
      right: 10,
      bottom: 20,
      left: 10,
    };
    let x;
    const y = d3.scale.linear().range([100, 0]);
    this.barChart.id += 1;
    const axis = d3.svg.axis().orient("bottom");
    const brush = d3.svg.brush();
    let brushDirty;
    let dimension;
    let group;
    let round;
    let all;

    const chart = () => {
      let width = x.range()[1],
        height = y.range()[0];
      y.domain([0, all.top(1)[0].value]);

      let div = d3.select(`#${htmlId}`),
        g = div.select("g");

      const resizePath = (d) => {
        let e = +(d == "e"),
          x = e ? 1 : -1,
          y = height / 3;
        return "M" + (.5 * x) + "," + y
          + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
          + "V" + (2 * y - 6)
          + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
          + "Z"
          + "M" + (2.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8)
          + "M" + (4.5 * x) + "," + (y + 8)
          + "V" + (2 * y - 8);
      }

      // Create the skeletal chart.
      if (g.empty()) {
        g = div.append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        g.append("clipPath")
          .attr("id", "clip-" + id)
          .append("rect")
          .attr("width", width)
          .attr("height", height);
        g.selectAll(".bar")
          .data(["background", "foreground"])
          .enter().append("path")
          .attr("class", (d) => { return d + " bar"; })
          .datum(group.all());

        g.selectAll(".foreground.bar")
          .attr("clip-path", "url(#clip-" + id + ")");

        g.append("g")
          .attr("class", "axis")
          .attr("transform", "translate(0," + height + ")")
          .call(axis);

        // Initialize the brush component with pretty resize handles.
        let gBrush = g.append("g").attr("class", "brush").call(brush);
        gBrush.selectAll("rect").attr("height", height);
        gBrush.selectAll(".resize").append("path").attr("d", resizePath);
      }

      // Only redraw the brush if set externally.
      if (brushDirty) {
        brushDirty = false;
        g.selectAll(".brush").call(brush);
        if (brush.empty()) {
          g.selectAll("#clip-" + id + " rect")
            .attr("x", 0)
            .attr("width", width);
        } else {
          let extent = brush.extent();
          g.selectAll("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        }
      }

      const barPath = (groups) => {
        let path = [],
          i = -1,
          n = groups.length,
          d;
        while (++i < n) {
          d = groups[i];
          path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
        }
        return path.join("");
      }

      g.selectAll(".bar").attr("d", barPath);
    }

    brush.on("brushstart.chart", () => {
      const div = d3.select(`#${htmlId}`);
      div.select(".title button").style("display", null);
    });

    brush.on("brush.chart", () => {
      let g = d3.select(`#${htmlId}`).select('g'),
        extent = brush.extent();
      if (round) g.select(".brush")
        .call(brush.extent(extent = extent.map(round)))
        .selectAll(".resize")
        .style("display", null);
      g.select("#clip-" + id + " rect")
        .attr("x", x(extent[0]))
        .attr("width", x(extent[1]) - x(extent[0]));
      dimension.filterRange(extent);
      // Get name of chart and limits for that chart
      this.setState({
        filterLimits: {
          ...this.state.filterLimits,
          [`#${htmlId}`]: extent
        }
      });
    });

    brush.on("brushend.chart", () => {
      if (brush.empty()) {
        let div = d3.select(`#${htmlId}`);
        div.select(".title button").style("display", "none");
        div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
        dimension.filterAll();
      }
    });

    chart.margin = (_) => {
      if (!_) return margin;
      margin = _;
      return chart;
    };

    chart.x = (_) => {
      if (!_) return x;
      x = _;
      axis.scale(x);
      brush.x(x);
      return chart;
    };

    chart.y = (_) => {
      if (!_) return y;
      y = _;
      return chart;
    };

    chart.dimension = (_) => {
      if (!_) return dimension;
      dimension = _;
      return chart;
    };

    chart.all = (_) => {
      if (!_) return all;
      all = _;
      return chart;
    };

    chart.filter = (_) => {
      if (_) {
        brush.extent(_);
        dimension.filterRange(_);
        this.setState({
          filterLimits: {
            ...this.state.filterLimits,
            [`#${htmlId}`]: _
          }
        });
      } else {
        brush.clear();
        dimension.filterAll();
        this.setState({
          filterLimits: {
            ...this.state.filterLimits,
            [`#${htmlId}`]: [0, 100]
          }
        });
      }
      brushDirty = true;
      chart();
      return chart;
    };

    chart.group = (_) => {
      if (!_) return group;
      group = _;
      return chart;
    };

    chart.round = (_) => {
      if (!_) return round;
      round = _;
      return chart;
    };
    return d3.rebind(chart, brush, "on");
  }
  /* eslint-enable */

  reset(i) {
    this.charts[i].filter(null);
  }

  renderCharts(allStudents, students) {
    if (!students || !allStudents) {
      return null;
    }

    if (!this.initialized) {
      this.completion = students.dimension(d => d.completion_prediction);
      this.attrition = students.dimension(d => d.attrition_prediction);
      this.certification = students.dimension(d => d.certification_prediction);
      this.completions = this.completion.group(Math.floor);
      this.attritions = this.attrition.group(Math.floor);
      this.certifications = this.certification.group(Math.floor);
      this.anonUserId = students.dimension(d => d.anon_user_id);

      this.initialized = true;
    }
    const charts = [
      this.barChart('completion-chart')
        .all(allStudents.dimension(d => d.completion_prediction).group(Math.floor))
        .dimension(this.completion)
        .group(this.completions)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
      this.barChart('attrition-chart')
        .all(allStudents.dimension(d => d.attrition_prediction).group(Math.floor))
        .dimension(this.attrition)
        .group(this.attritions)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
      this.barChart('certification-chart')
        .all(allStudents.dimension(d => d.certification_prediction).group(Math.floor))
        .dimension(this.certification)
        .group(this.certifications)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
    ];
    charts.forEach(chart => chart());
    this.charts = charts;
    this.props.forceRerender();
    console.log('Chart rerendered');
    return charts;
  }

  render() {
    return (
      <div>
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
        <div id="charts">
          <div id="completion-chart" className="chart">
            <div className="title">
              Completion % chance{' '}
              <button
                className="reset"
                onClick={() => this.reset(0)}
                style={{
                  display: 'none',
                  color: 'black',
                }}
              >
                reset
              </button>
            </div>
          </div>
          <div id="attrition-chart" className="chart">
            <div className="title">
              Attrition % chance{' '}
              <button
                className="reset"
                onClick={() => this.reset(1)}
                style={{
                  display: 'none',
                  color: 'black',
                }}
              >
                reset
              </button>
            </div>
          </div>
          <div id="certification-chart" className="chart">
            <div className="title">
              Certification % chance{' '}
              <button
                className="reset"
                onClick={() => this.reset(2)}
                style={{
                  display: 'none',
                  color: 'black',
                }}
              >
                reset
              </button>
            </div>
          </div>
        </div>
        <aside id="totals">
          <span id="active">
            {`${(this.anonUserId.top(Infinity).length > 0 ? this.anonUserId.top(Infinity).length : '-')} `}
          </span>
          <span id="percentage">
            ({Math.round((this.anonUserId.top(Infinity).length * 100) / this.props.allStudents.size())}%){' '}
          </span>
          of{' '}
          <span id="total">{this.props.allStudents.size() > 0 ? this.props.allStudents.size() : '-'}</span>
          {' '}learners selected{' '}
        </aside>
      </div>
    );
  }
}

Charts.propTypes = {
  filteredStudents: PropTypes.objectOf(crossfilter).isRequired,
  allStudents: PropTypes.objectOf(crossfilter).isRequired,
  forceRerender: PropTypes.func.isRequired,
};
export default Charts;
