var socket = io.connect('http://192.168.1.4:8081');

var pageSize = 5; //how many images per page to show

var allImages = []; //will hold all images for this 'session'

socket.on('init', function(images){
  //var imgDoc = document.getElementsByClassName("image")[0];
  var imagesHolder = document.getElementsByClassName("images")[0];
  clearHolder(imagesHolder);

  var navPageList = document.getElementById("page-list");
  navPageList.removeChild(navPageList.firstChild); //get rid of entire <ul>

  var numPages = Math.ceil(images.length / pageSize);
  console.log("numPages: "+numPages);
  navPageList.appendChild(new Pagination(numPages));

  if(numPages >= 1){ //more than 0 pictures:
    var numImgShow = (images.length > pageSize) ? pageSize : images.length;
    for(var j=numImgShow; j>=1; j--){ //imgClone.getElementsByTagName('img')[0].src = 'images/'+images[i].path;
      var thisImage = new ImageElement(images[images.length-j]);
      imagesHolder.insertBefore(thisImage,imagesHolder.firstChild);
    }
  }

  allImages = images;
  initClickListeners();
});

socket.on('new-image', function(image){
  var imagesHolder = document.getElementsByClassName("images")[0];
  var thisImage = new ImageElement(image);
  allImages.push(image);
  imagesHolder.insertBefore(thisImage, imagesHolder.firstChild);
  imagesHolder.removeChild(imagesHolder.lastChild);
});


socket.on('finished', function(){
  $('#processingDialog').modal('hide');
  $('#loadingDialog').modal('hide');
});

socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
