
var socket = io.connect(window.location.hostname+':8081');

socket.on('init', function(images){

  allImages = images;
  console.log("allImages length: "+allImages.length);
  //var imgDoc = document.getElementsByClassName("image")[0];
  var imagesHolder = document.getElementsByClassName("images")[0];
  clearHolder(imagesHolder);

  var numPages = Math.ceil(allImages.length / pageSize);
  console.log("numPages: "+numPages);

  var navPageList = document.getElementById("page-list");
  navPageList.removeChild(navPageList.firstChild); //get rid of entire <ul>
  navPageList.appendChild(new Pagination(numPages));

  currentPage = numPages-1;
  var imgIdx = (currentPage*pageSize);
  $("a.pagenum[value='"+currentPage+"']").parent().addClass("active");
  loadImages(imgIdx);
  // if(numPages >= 1){ //more than 0 pictures:
  //   var numImgShow = (allImages.length > pageSize) ? pageSize : allImages.length;
  //   for(var j=numImgShow; j>=1; j--){ //imgClone.getElementsByTagName('img')[0].src = 'images/'+images[i].path;
  //     var thisImage = new ImageElement(allImages[allImages.length-j]);
  //     imagesHolder.insertBefore(thisImage,imagesHolder.firstChild);
  //   }
  // }
});


socket.on('new-image', function(image){
  console.log("socket.on: new-image");
  allImages.push(image);
  console.log("allImages length: "+allImages.length);

  var numPages = Math.ceil(allImages.length / pageSize);

  var navPageList = document.getElementById("page-list");
  navPageList.removeChild(navPageList.firstChild); //get rid of entire <ul>
  navPageList.appendChild(new Pagination(numPages));

  currentPage = numPages-1;
  var imgIdx = (currentPage*pageSize);
  loadImages(imgIdx);

  // var imagesHolder = document.getElementsByClassName("images")[0];
  // var imgsHolder = document.getElementsByClassName("images");
  // console.log("imgsHolder.length: "+$(imgsHolder).length);
  // var thisImage = new ImageElement(image);
  // imagesHolder.insertBefore(thisImage, imagesHolder.firstChild);
  // // console.log('imagesHolder.length: '+imagesHolder.length);
  // if(imagesHolder.length>=pageSize) imagesHolder.removeChild(imagesHolder.lastChild);

});


socket.on('finished', function(){
  $('#processingDialog').modal('hide');
  $('#loadingDialog').modal('hide');
});


socket.on('loading', function(){
  $('#loadingDialog').modal('show');
});
