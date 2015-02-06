

$(document).ready(function(){


});

function initClickListeners(){

  $('#take-photo').click(function(e){
    // processingModal.show();
    $('#processingDialog').modal('show');
    socket.emit('snap',{snap: 0});
  });

  $(".pagenum").click(function(id){
    //this doesn't work... need to get value or just text from $(this) clicked.
    var p = $(this).val();
    console.log("page click: "+p);

    var endImgIdx = p*pageSize;

    var imagesHolder = document.getElementsByClassName("images")[0];
    clearHolder(imagesHolder);

    for(var j=endImgIdx+pageSize; j>=endImgIdx; j--){ //imgClone.getElementsByTagName('img')[0].src = 'images/'+images[i].path;
      var thisImage = new ImageElement(allImages[j]);
      imagesHolder.insertBefore(thisImage,imagesHolder.firstChild);
    }
  });
}


var Pagination = function(numPages){

  this.pagination = document.createElement("ul");
  this.pagination.className = "pagination";

  this.previous = document.createElement("li");
  this.previous.insertAdjacentHTML('afterbegin', '<a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>');

  this.pagination.appendChild(this.previous);

  for(var i=1; i<=numPages; i++){
    this.page = document.createElement("li");
    this.pageLink = document.createElement("a");
    this.pageLink.className = "pagenum";
    this.pageLink.setAttribute("value", i);

    this.pageNumber = document.createTextNode(i);
    this.pageLink.appendChild(this.pageNumber);
    this.page.appendChild(this.pageLink);

    this.pagination.appendChild(this.page);
  }

  this.next = document.createElement("li");
  this.next.insertAdjacentHTML('afterbegin', '<a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>');
  this.pagination.appendChild(this.next);

  return this.pagination;
};
