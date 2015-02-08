
var socket = io.connect(window.location.hostname+':8081');

socket.on('init', function(images){

  allImages = images;
  console.log("allImages length: "+allImages.length);

  setupPages(function(imgIdx){
    loadImages(imgIdx);
  });
});


socket.on('new-image', function(image){

  console.log("socket.on: new-image");
  allImages.push(image);

  console.log("allImages length: "+allImages.length);
  setupPages(function(imgIdx){
    loadImages(imgIdx);
  });
});


socket.on('finished', function(){
  $('#processingDialog').modal('hide');
  $('#loadingDialog').modal('hide');
});


socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
