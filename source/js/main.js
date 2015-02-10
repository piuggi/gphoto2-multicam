
/* session vars */
var pageSize = 10; //how many images per page to show
var totalPages;
var currentPage;
var allImages = [];

$(document).ready(function(){
  console.log("pageSize: "+pageSize + " imgs per page");
  $('#take-photo').click(function(e){
    $('#processingDialog').modal('show');
    socket.emit('snap',{snap: 0});
  });
});


var Pagination = function(numPages){
  this.pagination = document.createElement("ul");
  this.pagination.className = "pagination pagination-lg";

  this.previous = document.createElement("li");
  this.previous.insertAdjacentHTML('afterbegin', '<a href="#" class="prev-page" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>');
  this.pagination.appendChild(this.previous);


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
      goToPage(pageNum);
    });
  }

  this.next = document.createElement("li");
  this.next.insertAdjacentHTML('afterbegin', '<a href="#" class="next-page" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>');
  this.pagination.appendChild(this.next);

  this.previous.addEventListener("click", function(e){
    if(currentPage>0) goToPage(currentPage-1);
  });
  this.next.addEventListener("click", function(e){
    if(currentPage<totalPages-1) goToPage(currentPage+1);
  });

  return this.pagination;
};



var setupPages = function(cb){
  totalPages = Math.ceil(allImages.length / pageSize);
  console.log("setupPages, totalPages: "+totalPages);
  var navPageList = document.getElementById("page-list");
  navPageList.removeChild(navPageList.firstChild); //get rid of entire <ul>
  navPageList.appendChild(new Pagination(totalPages));

  currentPage = totalPages-1;
  var imgIdx = (currentPage*pageSize);
  $("a.pagenum[value='"+currentPage+"']").parent().addClass("active");

  cb(imgIdx);
};


var loadImages = function(idx, cb){
  console.log("loadImages, idx: "+idx);
  // var imagesHolder = document.getElementsByClassName("images");
  // console.log(imagesHolder.length);


  //
  // for(var i = 0, ilen = imagesHolder.length; i<ilen;){
  //   for(var j=idx; j<idx+pageSize; j++){
  //   imagesHolder[i].src=allImages[j].path
  //   console.log(allImages[j].path)
  //   if(i == ilen-1 && j == idx+pageSize-1) cb();
  //   }
  // }
  var imagesHolder = document.getElementsByClassName("images")[0];
  clearHolder(imagesHolder, function(){
    for(var j=idx; j<idx+pageSize; j++){
      if(j < allImages.length){ //partial page (if last page has less than full pageSize)
        //console.log('allImages['+j+']');
        var thisImage = new ImageElement(allImages[j]);
        imagesHolder.insertBefore(thisImage, imagesHolder.firstChild);
      }
    }
    cb();
  });
};


var goToPage = function(pageNum){
  $("a.pagenum").parent().removeClass("active");
  $("a.pagenum[value='"+pageNum+"']").parent().addClass("active");
  var imgIdx = (pageNum*pageSize);
  loadImages(imgIdx, function(){
    currentPage = pageNum;
  });
};


var clearHolder = function(holder, cb){
  while (holder.firstChild) {
    holder.removeChild(holder.firstChild); //clear out all current images
  }
  // return true;
  cb();
};
