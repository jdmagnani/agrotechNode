var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')
var request = require("request");


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

var mydb;

/* Endpoint to greet and add a new visitor to database.
* Send a POST request to localhost:3000/api/visitors with body
* {
* 	"name": "Bob"
* }
*/
app.post("/api/visitors", function (request, response) {
  var userName = request.body.name;
  if(!mydb) {
    console.log("No database.");
    response.send("Hello " + userName + "!");
    return;
  }
  // insert the username as a document
  mydb.insert({ "name" : userName }, function(err, body, header) {
    if (err) {
      return console.log('[mydb.insert] ', err.message);
    }
    response.send("Hello " + userName + "! I added you to the database.");
  });
});

/**
 * Endpoint to get a JSON array of all the visitors in the database
 * REST API example:
 * <code>
 * GET http://localhost:3000/api/visitors
 * </code>
 *
 * Response:
 * [ "Bob", "Jane" ]
 * @return An array of all the visitor names
 */
app.get("/api/visitors", function (request, response) {
  var names = [];
  if(!mydb) {
    response.json(names);
    return;
  }

  mydb.list({ include_docs: true }, function(err, body) {
    if (!err) {
      body.rows.forEach(function(row) {
        if(row.doc.name)
          names.push(row.doc.name);
      });
      response.json(names);
    }
  });
});


app.get("/api/clima", function (req, res) {

    var latitude = req.query.latitude;
    var longitude = req.query.longitude;

    var url = 'https://a6f24a9c-2266-44a4-8a6e-2cfced295164:uTQZ8gzzDb@twcservice.mybluemix.net/api/weather/v1/geocode/' + latitude + '/' + longitude + '/forecast/hourly/48hour.json';

    var state = req.query.state;


    //console.log (latitude + ' - ' + longitude);

    var options = {
        url: url
    };

    request(options, function(error, response, body) {
    if(!error && response.statusCode == 200) {
     var result = JSON.parse(body);
     //console.log(result);
     res.send(result);
    } else {
     res.send('Unable to get alerts.');
    }
});

});

app.get("/api/lista", function (req, res) {

    res.send ({"pins": [
       {
         "pin1": {
           "id": "pin1",
           "lat": "89898989",
           "long": "099009",
           "status": "IRRIGANDO",
           "cultura": "SOJA",
           "intervalo": "1200mins"
         }
       },
       {
         "pin2": {
           "id": "pin2",
           "lat": "89898989",
           "long": "099009",
           "status": "IRRIGANDO",
           "cultura": "SOJA",
           "intervalo": "1200mins"
         }
       }
     ]
 });

});

app.get("/api/area", function (req, res) {

    var pin = req.query.id;

    if(pin == "pin1"){
        res.send ({
             "pin1": {
               "id": "pin1",
               "lat": "89898989",
               "long": "099009",
               "status": "IRRIGANDO",
               "cultura": "SOJA",
               "intervalo": "1200mins"
             }
         });
    }

    if(pin == "pin2"){
        res.send ({
             "pin2": {
               "id": "pin2",
               "lat": "89898989",
               "long": "099009",
               "status": "IRRIGANDO",
               "cultura": "SOJA",
               "intervalo": "1200mins"
             }
         });
    }

});


app.get("/api/climaDetail", function (req, res) {
    var latitude = req.query.latitude;
    var longitude = req.query.longitude;
    var host = req.get('host');
    var url = 'http://' + host + '/api/clima?latitude=' + latitude + '&longitude=' + longitude;
    console.log(host);
    console.log(url);
    var state = req.query.state;

    var options = {
        url: url
    };

    request(options, function(error, response, body) {
    if(!error && response.statusCode == 200) {
     var result = JSON.parse(body);
     var arraySize = result.forecasts.length;
     var resultSimples = [];

     for (var forecast of result.forecasts){
         var dataHora = forecast.fcst_valid_local;
         var temp = forecast.temp;
         var clima = forecast.phrase_22char;
         var precipitacao = forecast.qpf;

         resultSimples.push({data: dataHora, temp: temp, clima: clima, precipitacao: precipitacao});
     }

     res.send(JSON.stringify(resultSimples));
    } else {
     res.send('Unable to get alerts.');
    }
});

});


// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }

const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
