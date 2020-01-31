const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const SpotifyWebApi = require("spotify-web-api-node");

/* set up express */
app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.json());
// allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/* initialize dotenv */
require("dotenv").config();

/* initialize spotify web api */
const api = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});
api.clientCredentialsGrant().then(
  function(data) {
    // save access token
    api.setAccessToken(data.body["access_token"]);
    console.log("got access token: " + api.getAccessToken());
  },
  function(err) {
    console.log("something went wrong when retrieving an access token");
  }
);

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/ping", function(req, res) {
  return res.send("pong");
});

/* api calls */
const baseURL = "https://api.spotify.com/v1/audio-analysis/";
let trackID = "1YCXVdUCVqbwr6DSrX01vr";
// trackID = "3lO4asvW4EIASqpMYKWJk7";
app.get("/vexento", function(req, res) {
  api.getAudioAnalysisForTrack(trackID).then(
    data => {
      return res.send(data.body);
    },
    err => {
      console.log(err);
    }
  );
});

app.post("/analyze-track", function(req, res) {
  // get track id from request body
  const id = req.body.id;
  api
    .getAudioAnalysisForTrack(id)
    .then(data => {
      return res.send(data.body);
    })
    .catch(error => {
      console.log(error);
    });
});

app.post("/features", function(req, res) {
  // get track id from request ody
  const id = req.body.id;
  api
    .getAudioFeaturesForTrack(id)
    .then(data => {
      return res.send(data.body);
    })
    .catch(error => {
      console.log(error);
    });
});

// user login
app.get("/login", function(req, res) {
  const scopes = "user-read-email user-read-private streaming";
  res.redirect(
    "https://accounts.spotify.com/authorize" +
      "?response_type=token" +
      "&client_id=" +
      process.env.CLIENT_ID +
      (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
      "&redirect_uri=" +
      encodeURIComponent(process.env.REDIRECT_URI)
  );
});

/* start server */
app.listen(process.env.PORT || 8080);
console.log(`server listening on ${process.env.PORT || 8080}`);
