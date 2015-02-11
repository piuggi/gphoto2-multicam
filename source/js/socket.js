
var socket = io.connect(window.location.hostname+':8080');

socket.on('init', function(images){
  console.log(">> socket.on: init");
  allImages = images;
  console.log("allImages length: "+allImages.length);
  IMAGE_TAKER = true;
  setupPages(function(imgIdx){
    loadImages(imgIdx, function(){
      // IMAGE_TAKER = false;
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
  IMAGE_TAKER = (currentPage == totalPages-1)? true : false; //if we're on the last page, then update
  setupPages(function(imgIdx){
    if(IMAGE_TAKER || onCurrPage){
     loadImages(imgIdx, function(){
        $('#processingDialog').modal('hide');
        $('#loadingDialog').modal('hide');
        // IMAGE_TAKER = false;
      });
    }
  });
});


socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
