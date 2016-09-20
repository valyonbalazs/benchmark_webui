(function(app) {
    // GENERATING DATA -------------------------------------------------------
    var ENV = {};
    ENV.rows = 200;
    ENV.timeout = 0;

    var start = Date.now();
    var loadCount = 0;

    function getData() {
      // Simulating Database clusters with dummy data
      data = {
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

    app.AppComponent = ng.core
        .Component({
          selector: 'my-app', // The root element
          templateUrl: './app/component.html'
        })
        .Class({
          constructor: function() {
              this.databases = {};
              var self = this;

              function loadSamples() {

                  // Updated new data from dummy data generator
                  var newData = getData();

                  Object.keys(newData.databases).forEach(function(dbname) {
                    var sampleInfo = newData.databases[dbname];

                    // If the dummy database instance does not exists already
                    if (!self.databases[dbname]) {
                      self.databases[dbname] = {
                        name: dbname,
                        samples: []
                      }
                    }

                    var db = self.databases[dbname];
                    var samples = self.databases[dbname].samples;
                    samples.push({
                      time: newData.start_at,
                      queries: sampleInfo.queries
                    });
                    if (samples.length > 5) {
                      samples.splice(0, samples.length - 5);
                    }

                    db.lastSample = db.samples[db.samples.length - 1];
                    db.topFiveQueries = db.lastSample.queries.slice(0, 5);
                    while (db.topFiveQueries.length < 5) {
                        db.topFiveQueries.push({ query: "" });
                    }

                    // Adding style class selectors to the instance number indicators
                    var countClassName = "label";
                    if (db.lastSample.queries.length >= 20) {
                        countClassName += " label-danger";
                    } else if (db.lastSample.queries.length >= 10) {
                        countClassName += " label-warning";
                    } else {
                        countClassName += " label-success";
                    }

                    db.countClassName = countClassName;
                  });

                  setTimeout(loadSamples, ENV.timeout);
              }

              // Load data after initialization
              loadSamples();
          },

          getDatabases: function() {
              var dbs = [];
              var self = this;
              Object.keys(this.databases).forEach(function(d) {
                  dbs.push(self.databases[d]);
              });
              return dbs;
          },

          // Adding style class selectors for elapsed time values in table cells
          getClassName: function(query) {
              var className = "elapsed short";
              if (query.elapsed >= 10.0) {
                  className = "elapsed warn_long";
              } else if (query.elapsed >= 1.0) {
                  className = "elapsed warn";
              }
              return "Query " + className;
          },

          // Formatting displayed elapsed time as data in the table cell
          formatElapsed: function(value) {
              if(!value) {
                  return '';
              }
              str = parseFloat(value).toFixed(2);
              if (value > 60) {
                minutes = Math.floor(value / 60);
                comps = (value % 60).toFixed(2).split('.');
                seconds = comps[0].lpad('0', 2);
                ms = comps[1];
                str = minutes + ":" + seconds + "." + ms;
              }
              return str;
          }
    });
})(window.app || (window.app = {}));
