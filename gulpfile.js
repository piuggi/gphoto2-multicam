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
    del = require('del');

    var LessPluginCleanCSS = require("less-plugin-clean-css"),
        cleancss = new LessPluginCleanCSS({advanced: true});
    var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
        autoprefix= new LessPluginAutoPrefix({browsers: ["last 2 versions"]});

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
  gulp.start('styles', 'scripts', 'images','watch');
});


gulp.task('watch', function() {
  console.log('watch');
  // Watch .scss files
  gulp.watch('source/less/*.less', ['styles']);

  // Watch .js files
  gulp.watch('source/js/*.js', ['scripts']);

  // Watch image files
  gulp.watch('src/images/*', ['images']);

  // Create LiveReload server
  livereload.listen();

  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', livereload.changed);

});
