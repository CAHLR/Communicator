import React from 'react';
import PropTypes from 'prop-types';

import * as d3 from 'd3';
import * as crossfilter from 'crossfilter2';

export class Charts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updated: false,
    };

    this.loadData = this.loadData.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (!nextProps.data) {
      return false;
    }
    return true;
  }

  // piggyback our d3 DOM changes whenever this component updates
  componentDidUpdate() {
    this.loadData(this.props.data);
  }

  loadData(students) {
    if (!students) {
      // TODO(Jeff): Handle this more gracefully in the UI
      // alert('Could not load student data');
      return;
    }
    // Various formatters
    const formatNumber = d3.format(',d');
    /*
    const formatChange = d3.format('+,d');
    const formatDate = d3.time.format('%B %d, %Y');
    const formatTime = d3.time.format('%I:%M %p');
    */

    // A nest operator
    const nestByDate = d3.nest()
      .key(() => 'Test');

    // A little coercion, since the CSV is untyped.
    for (let i = 0; i < students.length; i += 1) {
      const d = students[i];
      d.index = i;
      d.completion_prediction = +d.completion_prediction;
      d.attrition_prediction = +d.attrition_prediction;
      d.certification_prediction = +d.certification_prediction;
    }

    // Create the crossfilter for the relevant dimensions and groups.
    const student = crossfilter(students);
    const all = student.groupAll();
    const anonUserId = student.dimension(d => d.anon_user_id);
    const completion = student.dimension(d => d.completion_prediction);
    const attrition = student.dimension(d => d.attrition_prediction);
    const certification = student.dimension(d => d.certification_prediction);
    const completions = completion.group(Math.floor);
    const attritions = attrition.group(Math.floor);
    const certifications = certification.group(Math.floor);

    // Render the initial lists.
    const list = d3.selectAll('.list')
      // TODO(Jeff): fix this
      // eslint-disable-next-line no-use-before-define
      .data([studentList]);

    // Render the total.
    if (!this.state.updated) {
      this.props.updateNumLearners(formatNumber(student.size()), formatNumber(student.size()));
      this.setState({
        updated: true,
      });
    }

    // TODO(Jeff): fix this
    // eslint-disable-next-line no-use-before-define
    // renderAll();

    const studentList = (div) => {
      this.props.updateSelectedStudents(anonUserId.top(Infinity));
      const studentsByDate = nestByDate.entries(anonUserId.top(Infinity));
      div.each(() => {
        const date = d3.select(this).selectAll('.all-students')
          .data(studentsByDate, d => d.key);

        date.enter().append('div')
          .attr('class', 'all-students')
          .append('div')
          .attr('class', 'day')
          .text(() => '');

        date.exit().remove();

        const tempStudent = date.order().selectAll('.student')
          .data(d => d.values, d => d.index);

        const studentEnter = tempStudent.enter().append('div')
          .attr('class', 'student');

        studentEnter.append('div')
          .attr('class', 'anon-student')
          .text(d => d.anon_user_id);

        studentEnter.append('div')
          .attr('class', 'completion')
          .text(d => d.completion_prediction);

        studentEnter.append('div')
          .attr('class', 'attrition')
          .text(d => d.attrition_prediction);

        studentEnter.append('div')
          .attr('class', 'certification')
          .text(d => d.certification_prediction);

        tempStudent.exit().remove();

        tempStudent.order();
      });
    };

    const barChart = () => {
      if (!barChart.id) barChart.id = 0;

      let margin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10,
      };
      let x;
      let y = d3.scale.linear().range([100, 0]);
      barChart.id += 1;
      const { id } = barChart;
      const axis = d3.svg.axis().orient('bottom');
      const brush = d3.svg.brush();
      let brushDirty;
      let dimension;
      let group;
      let round;

      const innerChart = (div) => {
        const width = x.range()[1];
        const height = y.range()[0];

        y.domain([0, group.top(1)[0].value]);
        console.log(div);

        div.each(() => {
          const insideDiv = d3.select(this);
          let g = div.select('g');

          // Create the skeletal chart.
          if (g.empty()) {
            g = insideDiv.append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
              .attr('transform', `translate(${margin.left},${margin.top})`);

            g.append('clipPath')
              .attr('id', `clip-${id}`)
              .append('rect')
              .attr('width', width)
              .attr('height', height);

            g.selectAll('.bar')
              .data(['background', 'foreground'])
              .enter().append('path')
              .attr('class', d => `${d} bar`)
              .datum(group.all());

            g.selectAll('.foreground.bar')
              .attr('clip-path', `url(#clip-${id})`);

            g.append('g')
              .attr('class', 'axis')
              .attr('transform', `translate(0,${height})`)
              .call(axis);

            // Initialize the brush component with pretty resize handles.
            const gBrush = g.append('g').attr('class', 'brush').call(brush);
            gBrush.selectAll('rect').attr('height', height);

            // TODO(Jeff): fix this
            // eslint-disable-next-line no-use-before-define
            gBrush.selectAll('.resize').append('path').attr('d', resizePath);
          }

          // Only redraw the brush if set externally.
          if (brushDirty) {
            brushDirty = false;
            g.selectAll('.brush').call(brush);
            div.select('.title a').style('display', brush.empty() ? 'none' : null);
            if (brush.empty()) {
              g.selectAll(`#clip-${id} rect`)
                .attr('x', 0)
                .attr('width', width);
            } else {
              const extent = brush.extent();
              g.selectAll(`#clip-${id} rect`)
                .attr('x', x(extent[0]))
                .attr('width', x(extent[1]) - x(extent[0]));
            }
          }
          // TODO(Jeff): fix this
          // eslint-disable-next-line no-use-before-define
          g.selectAll('.bar').attr('d', barPath);
        });

        const barPath = (groups) => {
          const path = [];
          let i = -1;
          const n = groups.length;
          let d;
          while (i + 1 < n) {
            i += 1;
            d = groups[i];
            path.push('M', x(d.key), ',', height, 'V', y(d.value), 'h9V', height);
          }
          return path.join('');
        };

        const resizePath = (d) => {
          const e = +(d === 'e');
          const xVar = e ? 1 : -1;
          const yVar = height / 3;
          // eslint-disable-next-line prefer-template
          return 'M' + (0.5 * xVar) + ',' + yVar
            + 'A6,6 0 0 ' + e + ' ' + (6.5 * xVar) + ',' + (yVar + 6)
            + 'V' + ((2 * yVar) - 6)
            + 'A6,6 0 0 ' + e + ' ' + (0.5 * xVar) + ',' + (2 * yVar)
            + 'Z'
            + 'M' + (2.5 * xVar) + ',' + (yVar + 8)
            + 'V' + ((2 * yVar) - 8)
            + 'M' + (4.5 * xVar) + ',' + (yVar + 8)
            + 'V' + ((2 * yVar) - 8);
        };
      };

      brush.on('brushstart.chart', () => {
        const div = d3.select(this.parentNode.parentNode.parentNode);
        div.select('.title a').style('display', null);
      });

      brush.on('brush.chart', () => {
        const g = d3.select(this.parentNode);
        let extent = brush.extent();
        if (round) {
          g.select('.brush')
            .call(brush.extent(extent = extent.map(round)))
            .selectAll('.resize')
            .style('display', null);
        }
        g.select(`#clip-${id} rect`)
          .attr('x', x(extent[0]))
          .attr('width', x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
        // Get name of chart and limits for that chart
        window.filterLimits[g.node().parentNode.parentNode.id] = extent;
      });

      brush.on('brushend.chart', () => {
        if (brush.empty()) {
          const div = d3.select(this.parentNode.parentNode.parentNode);
          div.select('.title a').style('display', 'none');
          div.select(`#clip-${id} rect`).attr('x', null).attr('width', '100%');
          dimension.filterAll();
        }
      });

      innerChart.margin = (_) => {
        if (!arguments.length) return margin;
        margin = _;
        return innerChart;
      };

      innerChart.x = (_) => {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return innerChart;
      };

      innerChart.y = (_) => {
        if (!arguments.length) return y;
        y = _;
        return innerChart;
      };

      innerChart.dimension = (_) => {
        if (!arguments.length) return dimension;
        dimension = _;
        return innerChart;
      };

      innerChart.filter = (_) => {
        if (_) {
          brush.extent(_);
          dimension.filterRange(_);
        } else {
          brush.clear();
          dimension.filterAll();
        }
        brushDirty = true;
        return innerChart;
      };

      innerChart.group = (_) => {
        if (!arguments.length) return group;
        group = _;
        return innerChart;
      };

      innerChart.round = (_) => {
        if (!arguments.length) return round;
        round = _;
        return innerChart;
      };

      return d3.rebind(innerChart, brush, 'on');
    };

    const charts = [
      // eslint-disable-next-line no-use-before-define
      barChart()
        .dimension(completion)
        .group(completions)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
      // eslint-disable-next-line no-use-before-define
      barChart()
        .dimension(attrition)
        .group(attritions)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
      // eslint-disable-next-line no-use-before-define
      barChart()
        .dimension(certification)
        .group(certifications)
        .x(d3.scale.linear()
          .domain([0, 100])
          .rangeRound([0, 900])),
    ];

    const filter = (filters) => {
      filters.forEach((d, i) => { charts[i].filter(d); });
      // eslint-disable-next-line no-use-before-define
      renderAll();
    };
    if (!this.state.updated) {
      this.props.setFilter(filter);
    }

    const reset = (i) => {
      charts[i].filter(null);
      // eslint-disable-next-line no-use-before-define
      renderAll();
    };
    if (!this.state.updated) {
      this.props.setReset(reset);
    }
    const chart = d3.selectAll('.chart')
      .data(charts)
      // TODO(Jeff): fix this
      // eslint-disable-next-line no-use-before-define
      .each((subChart) => { subChart.on('brush', renderAll).on('brushend', renderAll); });

    // Renders the specified chart or list.
    const render = (method) => {
      d3.select(this).call(method);
    };

    // Whenever the brush moves, re-rendering everything.
    const renderAll = () => {
      chart.each(render);
      list.each(render);
      this.props.updateNumLearners(formatNumber(all.value()), formatNumber(student.size()));
    };
    renderAll();
  }

  render() {
    return (
      <div id="charts">
        <div id="completion-chart" className="chart">
          <div className="title">
            Completion % chance
            <button
              className="reset"
              onClick={() => this.props.reset(1)}
              style={{
                display: 'none',
              }}
            >
              reset
            </button>
          </div>
        </div>
        <div id="attrition-chart" className="chart">
          <div className="title">
            Attrition % chance
            <button
              className="reset"
              onClick={() => this.props.reset(1)}
              style={{
                display: 'none',
              }}
            >
              reset
            </button>
          </div>
        </div>
        <div id="certification-chart" className="chart">
          <div className="title">
            Certification % chance
            <button
              className="reset"
              onClick={() => this.props.reset(1)}
              style={{
                display: 'none',
              }}
            >
              reset
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Charts.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateSelectedStudents: PropTypes.func.isRequired,
  updateNumLearners: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  setReset: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};
export default Charts;
