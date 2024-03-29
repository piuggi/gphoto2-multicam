var gulp = require('gulp'),
    less = require('gulp-less'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    colors = require('colors'),
    bKill = false;

    var LessPluginCleanCSS = require("less-plugin-clean-css"),
        cleancss = new LessPluginCleanCSS({advanced: true});
    var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
        autoprefix= new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

    var bStarted = false;
    var App=false;

/* gulp setup */
gulp.task('styles',function(){
  return gulp.src('source/less/*.less')
         .pipe(less({plugins: [autoprefix, cleancss]}))
         .pipe(gulp.dest('./public/css'));
});

gulp.task('scripts', function() {
  return gulp.src('source/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('public/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/assets/img'))
    .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function(cb) {
    del(['public/css/main.*', 'public/js/main.*'], cb);
});

gulp.task('default',['clean'],function(){
  gulp.start('styles', 'scripts', 'images','watch','startup');
});

gulp.task('startup',function(cb){
  startApp(cb);
});

var startApp = function(cb){
  if(App) App.kill('SIGTERM');
  App = require('child_process').fork('app',[]);
  App.on('close', function (code, signal) {
    console.log('Express Application '.gray+'%s'.red+' terminated due to receipt of signal '.gray+'%s'.red,App.pid,signal);
    App.connected = false;
    if(bKill) {
      console.log('Good Bye.'.red);
      process.exit(1);
      }
    //startApp(cb);//turning reboot off.
  });
  cb();
};

gulp.task('watch', function() {
  // Watch .scss files
  gulp.watch('source/less/*.less', ['styles']);

  // Watch .js files
  gulp.watch('source/js/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/*', ['images']);

  var appWatcher = gulp.watch(['app/*.js','app/**/*.js'],['startup']);
  appWatcher.on('change',function(event){
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
  // Create LiveReload server
  livereload.listen();

  // Watch any files in public/, reload on change
  gulp.watch(['public/**']).on('change', livereload.changed);

});

process.on('SIGINT', function() {
  bKill = true;
  App.kill('SIGTERM');
  console.log('\nSorry to see you go.'.green);
  console.log('Close Signal... Killing App.'.yellow);
});
