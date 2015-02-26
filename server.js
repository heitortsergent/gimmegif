/* gimmegif
 *
 * This is a demo application using Giphy's and SendGrid's APIs.
 * The idea is to let the user search for GIFs on the frontend,
 * and have that synced between all users.  They can also request
 * GIFs via email using the Parse API, that are then shown in the frontend,
 * and also sent back to the user via the Web API.
 *
 */

// Dependencies
var express = require('express')
  , bodyParser = require('body-parser')
  , serveStatic = require('serve-static')
  , path = require('path')
  , app = express()
  , http = require('http')
  , port = process.env.PORT || 3000
  , server = app.listen(port)
  , pollingOnly = process.env.XHR_POLLING_ONLY || false
  , domain = process.env.DOMAIN || 'localhost'
  , io = require('socket.io').listen(server)
  , mimelib = require("mimelib")
  , request = require('request')
  , dotenv = require('dotenv');

dotenv.load();
var SENDGRID_USER     = process.env.SENDGRID_USER;
var SENDGRID_PASSWORD = process.env.SENDGRID_PASSWORD;
var sendgrid = require('sendgrid')(SENDGRID_USER, SENDGRID_PASSWORD);

var GiphyAPIKey = process.env.GIPHY_API_KEY;
var fromReplyEmail = 'gif@gimmegif.io';

var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(serveStatic('public/ftp', {'index': ['default.html', 'default.htm']}))
  app.use(express.static(path.join(__dirname, 'public')));
}

// Don't use Socket.io's WS support if flag is set
if(pollingOnly) {
  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
  });
}

app.post('/gimme', function(req,res) {
  console.log("app.post /gimme");
  var gifTag = req.body.gifTag;

  getRandomGIF(gifTag);

  res.end();
});

// Listen for posts to '/email' from sendgrid
app.post('/email', function(req,res) {
  var addresses = mimelib.parseAddresses(req.body.from);
  var senderName = addresses[0].name;
  var userEmail = addresses[0].address;
  var gifTag = req.body.subject;
  
  getRandomGIF(gifTag, senderName, userEmail);

  res.end();  
});

function sendEmail(imgUrl, gifTag, senderName, userEmail) {
  sendgrid.send({
    to:       userEmail,
    from:     fromReplyEmail,
    subject:  "Here's your awesome gif!",
    html:     "Hi " + senderName + "!" + "<br><br>"
    + "The GIF you requested for " + gifTag + " is here thanks to Giphy and SendGrid!" + "<br><br>"
    + "<img src=\""+ imgUrl + "\">" + "<br><br>"
    + "Have an awesome day!", 
    text:     'Your awesome gif text.'
  }, function(err, json) {
    if (err) { return console.error(err); }
  });
  res.end();
}

function getRandomGIF(gifTag, senderName, userEmail) {
  console.log("getRandomGIF");
  console.log(gifTag + " : " + senderName + " : " + userEmail);
  senderName = senderName || "gimmegif";

  var gifGetRequest = "http://api.giphy.com/v1/gifs/random?api_key=" + GiphyAPIKey;

  if(typeof gifTag != "undefined") {
    var tagWithoutSpaces = gifTag.replace(/ /g, "+");
    gifGetRequest = "http://api.giphy.com/v1/gifs/random?api_key=" + GiphyAPIKey + "&tag=" + tagWithoutSpaces;
  }

  (function(gifTag, senderName, userEmail) {
    request(gifGetRequest, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var bodyJSON = JSON.parse(body);
        var imgUrl = bodyJSON.data.image_original_url;
        if(bodyJSON.data.length == 0) {
          //if couldn't get GIF with specified tag, get a random GIF
          getRandomGIF();
        }
        else {
          io.sockets.emit('addImgToPage', { imgUrl: imgUrl, gifTag: gifTag, senderName: senderName});
        }

        if(typeof userEmail != "undefined")
        {
          sendEmail(imgUrl, gifTag, senderName, userEmail);
        }
      } else {
        getRandomGIF();
      }
    });
  })(gifTag, senderName, userEmail);
}
