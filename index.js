require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortid = require("shortid");
const url = require("url");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urlSchema = mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model("Url", urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// mongoose.connect(process.env.MONGO_DB, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

let urlDatabase = [];
let urlCounter = 20900;

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  const parsedUrl = url.parse(originalUrl);
  const hostname = parsedUrl.hostname;

  dns.lookup(hostname, (err, address) => {
    if (err || !address) {
      return res.json({ error: "invalid Url" });
    }

    urlCounter++;
    urlDatabase[urlCounter] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: urlCounter,
    });
  });
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;

  // Find the original URL based on short_url
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
