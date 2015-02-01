var gulp = require('gulp');
var watcher = gulp.watch('images/*.jpg');

watcher.on('change',function(event){
    console.log('File Changed');
    console.log(event);
});

var Gphoto2 = require('./components/gphoto2');

var gphoto = new Gphoto2({},function(){
  gphoto.tetherAll();
});
