
var socket = io.connect(window.location.hostname+':8080');

socket.on('init', function(images){
  console.log(">> socket.on: init");
  allImages = images;
  console.log("allImages length: "+allImages.length);

  setupPages(function(imgIdx){
    loadImages(imgIdx, function(){

    });
  });
});

socket.on('approved', function(image){
  console.log('approved: \n %s',JSON.stringify(image));
  var imageElm = document.getElementsByClassName(image._id)[0];
  console.log(imageElm);
  var button = imageElm.getElementsByClassName('approve')[0];
  button.className = "btn btn-primary approve active";
  console.log(button.className);
});

socket.on('hearted', function(image){
  console.log('approved: \n %s',JSON.stringify(image));
  var imageElm = document.getElementsByClassName(image._id)[0];
  console.log(imageElm);
  var button = imageElm.getElementsByClassName('heart')[0];
  button.className = "btn btn-danger heart active";
});

socket.on('new-image', function(image){

  console.log("socket.on: new-image");
  allImages.push(image);

  console.log("allImages length: "+allImages.length);
  // setupPages(function(imgIdx){
  //   loadImages(imgIdx);
  // });
});


socket.on('finished', function(){
  console.log("socket: finished");
  //location.reload();
  setupPages(function(imgIdx){
   loadImages(imgIdx, function(){
      $('#processingDialog').modal('hide');
      $('#loadingDialog').modal('hide');
    });
  });
});


socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
