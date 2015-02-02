var fs = require('fs');
var gulp = require('gulp');
var colors = require('colors');
var _ = require('lodash');

/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var Images = require(__dirname+'/models/images');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gphoto2');

var Gphoto2 = require(__dirname+'/components/gphoto2');

if (!fs.existsSync(__dirname+'/images')) fs.mkdirSync(__dirname+'/images');

/* Gulp Watcher */
var watchr = require('watchr');
watchr.watch({
    path:'./app/images/',
    listener:  function(changeType,filePath,fileCurrentStat,filePreviousStat){
            switch(changeType){
              case 'create':
                console.log('File Added: '.green+filePath);
                var img = new Images();
                img.path = filePath.substr(filePath.lastIndexOf('/')+1);
                img.save(function(){
                  io.sockets.emit('images',[img]);
                });
                break;
              default:
                //console.log('a change event occured:',arguments);
                console.log('changeType: '+changeType+' filePath: '+filePath);
                break;
            }
        }

});


var gphoto = new Gphoto2({},function(){
  //auto tether
  gphoto.tetherAll();
});

/* Simple Express and Socket to pass info. */
app.use(express.static('./public'));
app.use('/images',express.static(__dirname +'/images'));
app.listen(process.env.PORT || 8080);
server.listen(8081);
console.log('App Running on port'+(process.env.PORT || 8080));

io.on('connection',function(socket){
  fs.readdir(__dirname+'/images',function(err,files){
    //checkout /images for all image files, (exclude DS_Store);
    Images.findOrCreate(_.without(files, ".DS_Store"),function(err,_images){
      if(err) return socket.emit('error',err);
      return socket.emit('images',_images);
    });
  });

  /* Socket API */
  socket.on('approve',function(data){
    console.log('Approve: '+JSON.stringify(data));
    Images.findById(data._id,function(err,image){
      image.approve(function(err,_img){
        //TODO Add socket emit to update all connections.
        console.log('Approved.');
      });
    });
  });

  socket.on('heart',function(data){
    console.log('Heart: '+JSON.stringify(data));
    Images.findById(data._id,function(err,image){
      image.heart(function(err,_img){
        //TODO Add socket emit to update all connections.
        console.log('Hearted.');
      });
    });
  });

  socket.on('snap',function(data){
    console.log('Take Photo! '.green+JSON.stringify(data));
    gphoto.takePhotos();
  });
});
