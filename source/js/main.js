

var pageSize = 3; //how many images per page to show
var currentPage;
var allImages = []; //will hold all images for this 'session'

$(document).ready(function(){

  console.log("pageSize: "+pageSize + " imgs");

  $('#take-photo').click(function(e){
    // processingModal.show();
    $('#processingDialog').modal('show');
    socket.emit('snap',{snap: 0});
  });
});


var Pagination = function(numPages){
  this.pagination = document.createElement("ul");
  this.pagination.className = "pagination pagination-lg";
  /***** NEXT + PREVIOUS BUTTONS *****/
  // this.previous = document.createElement("li");
  // this.previous.insertAdjacentHTML('afterbegin', '<a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>');
  // this.pagination.appendChild(this.previous);
  // this.next = document.createElement("li");
  // this.next.insertAdjacentHTML('afterbegin', '<a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>');
  // this.pagination.appendChild(this.next);

  for(var i=0; i<numPages; i++){
    this.page = document.createElement("li");
    this.pageLink = document.createElement("a");
    this.pageLink.className = "pagenum";
    this.pageLink.setAttribute("value", i);

    attachPageLinkListener(this.pageLink, i);

    this.pageNumber = document.createTextNode(i);
    this.pageLink.appendChild(this.pageNumber);
    this.page.appendChild(this.pageLink);
    this.pagination.appendChild(this.page);
  }

  function attachPageLinkListener(_pageLink, pageNum){
    _pageLink.addEventListener("click",function(e){
      console.log("page click: "+pageNum);
      currentPage = pageNum;
      goToPage(currentPage);
      // $("a.pagenum").parent().removeClass("active");
      // $("a.pagenum[value='"+currentPage+"']").parent().addClass("active");
      // var imgIdx = (currentPage*pageSize);
      // loadImages(imgIdx);
    });
  }
  return this.pagination;
};

var goToPage = function(pageNum){
  $("a.pagenum").parent().removeClass("active");
  $("a.pagenum[value='"+currentPage+"']").parent().addClass("active");
  var imgIdx = (currentPage*pageSize);
  loadImages(imgIdx);
};


var loadImages = function(idx){
  console.log("loadImages, idx: "+idx);
  var imagesHolder = document.getElementsByClassName("images")[0];
  clearHolder(imagesHolder);

  for(var j=idx; j<idx+pageSize; j++){
  // for(var j=endIdx-pageSize; j<endIdx; j++){ //imgClone.getElementsByTagName('img')[0].src = 'images/'+images[i].path;
    if(j < allImages.length){ //partial page (if last page has less than full pageSize)
      console.log('allImages['+j+']');
      var thisImage = new ImageElement(allImages[j]);
      // imagesHolder.appendChild(thisImage);
      imagesHolder.insertBefore(thisImage, imagesHolder.firstChild);
    }
  }
}


var clearHolder = function(holder){
  while (holder.firstChild) {
    holder.removeChild(holder.firstChild); //clear out all current images
  }
  return true;
};
