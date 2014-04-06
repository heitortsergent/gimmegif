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
var applicationReplyUrl = "http://yourappurl.jit.su/reply";
var fromReplyEmail = 'gif@gimmegif.jit.su';

// Configure the server
app.configure(function() {
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

// Don't use Socket.io's WS support if flag is set
if(pollingOnly) {
  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
  });
}

app.post('/gimme', function(req,res) {
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

app.post('/reply', function(req, res) {
  sendgrid.send({
    to:       req.body.userEmail,
    from:     fromReplyEmail,
    subject:  "Here's your awesome gif!",
    html:     "Hi " + req.body.senderName + "!" + "<br><br>"
    + "The GIF you requested for " + req.body.gifTag + " is here thanks to Giphy and SendGrid!" + "<br><br>"
    + "<img src=\""+ req.body.imgUrl + "\">" + "<br><br>"
    + "Have an awesome day!", 
    text:     'Your awesome gif text.'
  }, function(err, json) {
    if (err) { return console.error(err); }
    console.log(json);
  });
  res.end();
});

function getRandomGIF(gifTag, senderName, userEmail) {
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
          //send email to user with GIF
          request.post(
            applicationReplyUrl,
            { form: {imgUrl: imgUrl, gifTag:gifTag, senderName:senderName, userEmail:userEmail} },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                }
              }
          );
        }
      } else {
        getRandomGIF();
      }
    });
  })(gifTag, senderName, userEmail);
}
