var spawn = require('child_process').spawn;
var exec  = require('child_process').exec;
var os = require('os');

function Camera(string,index){
  // setup camera status
  //parse out string and port
  console.log('Found Camera');

  var parse = string.split(/[ \t]{2,}/);
  if(parse.length < 1) return false;
  this.type = parse[0];
  this.port = parse[1];
  this.index = index;
  this.filename= "images/%m_%d_%y-%H.%M.%S-camera"+this.index+".%C";
  console.log("Type: "+this.type+"\tPort: "+this.port);
  this.tethered = this.videoStream = {connected: false};
}

/* Camera Live View Requires FFMPEGs*/

Camera.prototype.liveview = function(cb){
    var _this = this;
    if(this.tethered.connected)
      this.tethered.kill('SIGTERM');

    if(!this.videoStream.connected){
      //if mac osx
      var killAll = exec('killall PTPCamera',function (error, stdout, stderr) {
         if(error) console.log(error);
         if(stdout) console.log(stdout);
         if(stderr) console.log(stderr);
         _this.videoStream = spawn('ffserver',['-f','/etc/ffserver.conf','|','gphoto2', '--capture-movie','--port='+_this.port]);
         _this.videoStream.connected = true;

           //videoStream.on('error',function())
           _this.videoStream.stdout.setEncoding('utf8');
           _this.videoStream.stdout.on('data',function(data){
              console.log(data);
           });
           _this.videoStream.stderr.setEncoding('utf8');
           _this.videoStream.stderr.on('data', function(data){
             console.log(data);
           });
           _this.videoStream.on('close',function(code,signal){
                console.log('[ videoStream: '+_this.videoStream.pid+' ] terminated due to receipt of signal '+signal);
                _videoStream.connected = false;
           });

          cb(null,_this.videoStream);
        });
      }else{
        cb('Warn: Video Stream Already Connected',this.videoStream);
      }
  };

/* Capture Image and Download */

Camera.prototype.captureAndDownload = function(cb){
  var _this = this;
    console.log('Camera '+this.index+' Requesting Photo');
    var captureDownload = spawn('gphoto2',["--capture-image-and-download", "--port="+this.port, "--filename="+this.filename]);

    captureDownload.stdout.setEncoding('utf8');
    captureDownload.stderr.setEncoding('utf8');
    captureDownload.stdout.on('data',function(data){
      console.log('Camera '+_this.index+'gphoto2 --capture-image-and-download');
      console.log(data);
    });
    captureDownload.stderr.on('data',function(data){
      console.log('Camera '+_this.index+' Error!\t'+'gphoto2 --capture-image-and-download');
      console.log(data);
    });
};

/* Tether Camera */

Camera.prototype.tether = function(cb){
      var _this = this;
      if(this.videoStream.connected) this.videoStream.kill('SIGTERM');

      if(!this.tethered.connected){

        //run conditional check on OS to kill Camera linkers
        var killAll = exec('killall PTPCamera',function (error, stdout, stderr) {
          if(error)
            console.log(error);

          if(stdout)
            console.log(stdout);

          if(stderr)
            console.log(stderr);


          _this.tethered = spawn('gphoto2',['--capture-tethered','--force-overwrite','--port='+_this.port,'--filename='+_this.filename]);
          _this.tethered.connected = true;

          //tethered.on('error',function())
          _this.tethered.stdout.setEncoding('utf8');
          _this.tethered.stdout.on('data',tetheredStd);
          _this.tethered.stderr.setEncoding('utf8');
          _this.tethered.stderr.on('data',tetheredStd);

          _this.tethered.on('close',function(code,signal){
            console.log('[ tethering: '+_this.tethered.pid+' ] ');
            console.log('Terminated with Signal [ '+signal+' ] Code [ '+code+' ]');
            _this.tethered.connected = false;
          });

          cb(null,_this.tethered);
        });
      }else{
        //console.log('[gphoto2][warn] Tether Already Connected')
        cb('[gphoto2][warn][Warn] Already Tethered to Camera',this.tethered);
      }
  };

  //handle the tethered stderr and stdout
  function tetheredStd(data){
    console.log(data);

    //handle messages
    if( data.indexOf('.jpg')>-1 || data.indexOf('.JPG')>-1 ){
      if(data.indexOf('Deleting')>-1){
        console.log('Detected Photo');
        var s = data.indexOf("'");
        var e = data.indexOf("'",s+1);
        //get the filename by finding the first and second '
        var filename = data.substr(s+1,e-s-1);
        console.log("Found file: "+filename);
        //handleFile(filename)
      }
    }else if(data.indexOf('*** Error')>-1){
      /*
      if(!bAttemptedReconnect){ //if we haven't tried reconnecting yet
        reconnect(function(){
          bAttemptedReconnect = true;
        }); //try to reconnect
      }
        */
      console.error(data);
    }

  }

module.exports = Camera;
