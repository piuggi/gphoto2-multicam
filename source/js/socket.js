
var socket = io.connect(window.location.hostname+':8080');

socket.on('init', function(images){
  console.log(">> socket.on: init");
  allImages = images;
  console.log("allImages length: "+allImages.length);
  IMAGE_TAKER = true;
  setupPages(null, function(imgIdx){
    loadImages(imgIdx, function(){ });
  });
});


socket.on('approved', function(image){
  console.log('approved: \n %s',JSON.stringify(image));
  var imageElm = document.getElementsByClassName(image._id)[0];
  //console.log(imageElm);
  var button = imageElm.getElementsByClassName('approve')[0];
  button.className = "btn btn-primary approve active";
  console.log(button.className);
});


socket.on('hearted', function(image){
  console.log('hearted: \n %s',JSON.stringify(image));
  var imageElm = document.getElementsByClassName(image._id)[0];
  //console.log(imageElm);
  var button = imageElm.getElementsByClassName('heart')[0];
  button.className = "btn btn-danger heart active";
});


socket.on('new-image', function(image){
  allImages.push(image);
  console.log(">> socket.on: new-image, allImages length: "+allImages.length);
});


socket.on('finished', function(){
  console.log("socket: finished");
  //location.reload();
  if(!IMAGE_TAKER) IMAGE_TAKER = (currentPage == totalPages-1)? true : false; //if we're on the last page, then update
  if(IMAGE_TAKER){
    setupPages(null, function(imgIdx){
      loadImages(imgIdx, function(){
        $('#processingDialog').modal('hide');
        $('#loadingDialog').modal('hide');
      });
    });
  }
});


socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
