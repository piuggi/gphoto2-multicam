var socket = io.connect('http://localhost:8081');
socket.on('images', function(images){
  var imgDoc = document.getElementsByClassName("image")[0];
  var imagesHolder = document.getElementsByClassName("images")[0];
  for(var i =0, len = images.length; i<len;i++){
    console.log(images[i]);
    var imgClone = imgDoc.cloneNode(true);
    imgClone.getElementsByTagName('img')[0].src = 'images/'+images[i].path;
    imagesHolder.insertBefore(imgClone,imagesHolder.firstChild);
  }
  console.log(imgDoc);

});
