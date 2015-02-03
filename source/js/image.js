var ImageElement = function(image){
  // console.log("IMAGE : "+JSON.stringify(image,null,'\t'));
  this.imgHolder = document.createElement("div");
  this.imgHolder.className = "image col-xs-6 col-md-3 col-lg-4";

  this.thumbHolder = document.createElement("div");
  this.thumbHolder.className = "thumbnail";

  this.img = document.createElement("img");
  this.img.src = 'images/'+image.path;

  this.caption = document.createElement("div");
  this.caption.className = "caption";

  this.caption.appendChild(new _ButtonToolbar(image));
  //this.caption.appendChild(this.imgLabel);

  this.thumbHolder.appendChild(this.img);
  this.thumbHolder.appendChild(this.caption);
  this.imgHolder.appendChild(this.thumbHolder);

  //console.log(this);

  return this.imgHolder;
};

var _ButtonToolbar = function(image){

  this.btntoolbar = document.createElement("div");
  this.btntoolbar.className = "btn-toolbar";
  this.btntoolbar.setAttribute("role", "toolbar");

  this.btngroup = document.createElement("div");
  this.btngroup.className = "btn-group";
  this.btngroup.setAttribute("role", "group");

  this.btngroup.appendChild(new _Button(image,'details', 'search',false));
  this.btngroup.appendChild(new _Button(image,'approve', 'ok', image.hearted));
  this.btngroup.appendChild(new _Button(image,'heart', 'heart', image.approved));

  this.imagePath = document.createTextNode(image.path);
  this.imgLabel = document.createElement("p");
  this.imgLabel.appendChild(this.imagePath);
  this.imgLabel.className = "label label-info image-path";

  this.btntoolbar.appendChild(this.btngroup);
  this.btngroup.appendChild(this.imgLabel);

  return this.btntoolbar;
};



var _Button = function(image,cl,glyph,state){
  var _this = this;
  this.span = document.createElement("span");
  this.span.className = "glyphicon glyphicon-"+glyph;

  this.btn = document.createElement("button");
  this.btn.className = (state)? "btn btn-default "+cl+" disabled" : "btn btn-default "+cl;

  this.btn.setAttribute("role", "button");
  this.btn.setAttribute("type", "button");
  this.btn.addEventListener("click",function(e){
    switch(cl){
      case 'approve':
      case 'heart':
        console.log('here');
        if(!state){
          socket.emit(cl,{_id: image._id});
          _this.btn.className += " disabled";
        }
        break;
      default:

        break;
    }
  });
  this.btn.appendChild(this.span);

  return this.btn;
};
