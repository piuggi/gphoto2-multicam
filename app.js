var fs = require('fs');
var gulp = require('gulp');
/* Simple Express and Socket to pass info. */
var express =require('express');
var app = express();
var server = require('http').Server(app)
var io = require('socket.io')(server);


var Gphoto2 = require('./components/gphoto2');

if (!fs.existsSync('./images')) fs.mkdirSync('./images');

/* Gulp Watcher */
var watcher = gulp.watch('images/*.jpg');

watcher.on('change',function(event){

    switch(event.type){
      case 'added':
        console.log('File Added: '+event.path);
        io.sockets.emit('images',[event.path.substr(event.path.lastIndexOf('/')+1)]);
        break;
      default:
        console.log(event.type);
        break;
    }
});

var gphoto = new Gphoto2({},function(){
  gphoto.tetherAll();
});

/* Simple Express and Socket to pass info. */
app.use(express.static(__dirname + '/public'));
app.use('/images',express.static(__dirname +'/images'));
app.listen(process.env.PORT || 8080);
server.listen(8081);
console.log('App Running on port'+(process.env.PORT || 8080));


io.on('connection',function(socket){
  fs.readdir('./images',function(err,files){
    if(err) return socket.emit('error',err);
    return socket.emit('images',files);
  });
});
