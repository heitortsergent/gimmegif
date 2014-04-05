var socket = io.connect('/');

$(function() {
  //get random cat gif as soon as website loads
  sendGifRequest("cat");

  $(".btngif").click(function() {
    var tag = $("#inputGIF").val();

    sendGifRequest(tag);

    return false;
  });

  socket.on('addImgToPage', function(data) {
    addImgToPage(data.imgUrl, data.gifTag, data.senderName);
  });
});

function sendGifRequest(gifTag) {
  gifTag = gifTag;
  $.ajax({
    type: "POST",
    url: "/gimme",
    data: { gifTag:gifTag},
    success: function() {
    }
  });
}

function addImgToPage(imgUrl, gifTag, userName) {
  gifTag = gifTag || "random";
  userName = userName || "gimmegif";

  var imgHTML = "<img class=\"awesomeGIF\" src=\"" + imgUrl + "\">";
  console.log(imgHTML.replace(/\"/g, "&quot;"));
  var evernoteClipHTML = "<a href=\"#\" onclick=\"Evernote.doClip({title: \'Gimmegif\', url: \'" + imgUrl + "\', code: \'gimmegif\', header: \'\', content: '" + imgHTML.replace(/\"/g, "&quot;") + "'});return false;\"><img class=\"awesomeGIF\" src=\"" + imgUrl + "\"></a>";

  $("#queue").prepend("<br><br>");
  $("#queue").prepend(evernoteClipHTML);
  $("#queue").prepend("<div class=\"yellowBG\"><div class=\"row-fluid\"><div class=\"col-xs-6\"><p class=\"gifQuery\">"
    + gifTag.toUpperCase() + "</p></div><div class=\"col-xs-6\"><p class=\"gifSender\">requested by "
    + userName
    + "</p></div></div></div>");
}