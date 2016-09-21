// GENERATING DATA -------------------------------------------------------
var ENV = {};
ENV.rows = 200;
ENV.timeout = 0;

var start = Date.now();
var loadCount = 0;

function getData() {
  // Simulating Database clusters with dummy data
  var data = {
    start_at: new Date().getTime() / 1000,
    databases: {}
  };

  // Creating dummy master DB clusters
  for (var i = 1; i <= ENV.rows; i++) {
    data.databases["cluster" + i] = {
      queries: []
    };
  }

  // Iterate through all of the dummy DBs and fill with data
  Object.keys(data.databases).forEach(function(dbname) {

    // Get a dummy DB value 
    var info = data.databases[dbname];

    // Generate random number property for each DB instance
    var r = Math.floor((Math.random() * 30) + 1);
    for (var i = 0; i < r; i++) {
      var q = {
        elapsed: Math.random() * 15,
        query: "Critical load",
        waiting: Math.random() < 0.5
      };

      if (Math.random() < 0.2) {
        q.query = "<IDLE>";
      }

      if (Math.random() < 0.1) {
        q.query = "Normal functioning";
      }

      // Fill the DB instance with random content
      info.queries.push(q);
    }

    // Sort the DB instances by elapsed time
    info.queries = info.queries.sort(function(a, b) {
      return b.elapsed - a.elapsed;
    });
  });

  return data;
}

// ------------------------------------------------------------------
// UI Rendering
var _base;

(_base = String.prototype).lpad || (_base.lpad = function(padding, toLength) {
  return padding.repeat((toLength - this.length) / padding.length).concat(this);
});

// Formatting displayed elapsed time as data in the table cell
function formatElapsed(value) {
  var str = parseFloat(value).toFixed(2);
  if (value > 60) {
    minutes = Math.floor(value / 60);
    comps = (value % 60).toFixed(2).split('.');
    seconds = comps[0].lpad('0', 2);
    ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }
  return str;
}

var Query = React.createClass({
  render: function() {
    // Adding style class selectors for elapsed time values in table cells
    var className = "elapsed short";
    if (this.props.elapsed >= 10.0) {
      className = "elapsed warn_long";
    }
    else if (this.props.elapsed >= 1.0) {
      className = "elapsed warn";
    }

    return (
      <td className={"Query " + className}>
        {this.props.elapsed ? formatElapsed(this.props.elapsed) : ''}
        <div className="popover left">
          <div className="popover-content">{this.props.query}</div>
          <div className="arrow"/>
        </div>
      </td>
    );
  }
})

var sample = function (queries, time) {
  var topFiveQueries = queries.slice(0, 5);
  while (topFiveQueries.length < 5) {
    topFiveQueries.push({ query: "" });
  }

  // Using keys 
  var _queries = [];
  topFiveQueries.forEach(function(query, index) {
    _queries.push(
      <Query
        key={index}
        query={query.query}
        elapsed={query.elapsed}
      />
    );
  });

  // Adding style class selectors to the instance number indicators
  var countClassName = "label";
  if (queries.length >= 20) {
    countClassName += " label-danger";
  }
  else if (queries.length >= 10) {
    countClassName += " label-warning";
  }
  else {
    countClassName += " label-success";
  }

  return [
    <td className="query-count">
      <span className={countClassName}>
        {queries.length}
      </span>
    </td>,
    _queries
  ];
};

var Database = React.createClass({
  render: function() {
    var lastSample = this.props.samples[this.props.samples.length - 1];

    return (
      <tr key={this.props.dbname}>
        <td className="dbname">
          {this.props.dbname}
        </td>
        {sample(lastSample.queries, lastSample.time)}
      </tr>
    );
  }
});

// The root element
var DBMon = React.createClass({
  getInitialState: function() {
    return {
      databases: {}
    };
  },

  loadSamples: function () {
    loadCount++;

    // Updated new data from dummy data generator
    var newData = getData();

    Object.keys(newData.databases).forEach(function(dbname) {
      var sampleInfo = newData.databases[dbname];

      // If the dummy database instance does not exists already
      if (!this.state.databases[dbname]) {
        this.state.databases[dbname] = {
          name: dbname,
          samples: []
        }
      }

      var samples = this.state.databases[dbname].samples;
      samples.push({
        time: newData.start_at,
        queries: sampleInfo.queries
      });
      if (samples.length > 5) {
        samples.splice(0, samples.length - 5);
      }
    }.bind(this));

    this.setState(this.state);
    setTimeout(this.loadSamples, ENV.timeout);
  },

  componentDidMount: function() {
    // Load data after initialization
    this.loadSamples();
  },

  render: function() {
    var databases = [];
    Object.keys(this.state.databases).forEach(function(dbname) {
      // Using keys
      databases.push(
        <Database key={dbname}
          dbname={dbname}
          samples={this.state.databases[dbname].samples} />
      );
    }.bind(this));

    return (
      <div>
        <table className="table table-striped latest-data">
          <tbody>
            {databases}
          </tbody>
        </table>
      </div>
    );
  }
});

React.render(<DBMon />, document.getElementById('dbmon'), function() {
  console.log(Date.now() - start);
});


