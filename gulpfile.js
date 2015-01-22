/* jshint node:true */
'use strict';

var gulp = require('gulp');
var sprite = require('css-sprite').stream;
var $ = require('gulp-load-plugins')();

var nodemonOpt = {
  script: 'app.js',
  ext: 'js',
  env: {
    NODE_ENV: 'development'
  },
  watch: [
    'models/',
    'server.js',
    'apiRouter.js'
  ]
};

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src(['app/scripts/**/*.js', 'models/**/*.js'])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

// compile index.jade files to .html files in .tmp
gulp.task('views', function () {
    return gulp.src(['app/index.jade'])
        .pipe($.jade({pretty: true}))
        .pipe(gulp.dest('.tmp'));
});

// compile all jades templates and wraps thos in angular templateCache
gulp.task('templates', function() {
  return gulp.src([
    'app/templates/**/*.jade'
  ])
  .pipe($.jade({pretty: true}).on('error', $.util.log))
  .pipe($.angularTemplatecache('templates.js', {standalone: true}))
  .pipe(gulp.dest('app/scripts'));
});

// call in the build task to compile views, templates, stylesheets and scripts
gulp.task('html', ['sprite', 'views', 'styles', 'templates'], function () {
  var lazypipe = require('lazypipe');
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('.tmp/index.html')
    .pipe(assets)
    .pipe($.if('*.js', $.ngAnnotate()))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    // .pipe($.filter('**/*.{jpg,jpeg,svg,gif,png}'))
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true
    // })))
    .pipe(gulp.dest('dist/images'));
});

// generate sprite.png and _sprite.scss
gulp.task('sprite', function () {
  return gulp.src('app/images/sprite/*.png')
    .pipe(sprite({
      name: 'sprite',
      style: '_sprite.scss',
      cssPath: '/images',
      retina: true,
      processor: 'scss',
      prefix: 'sprite-icon'
    }))
    .pipe($.if('*.png', gulp.dest('app/images')))
    .pipe($.if('*.png', gulp.dest('dist/images'), gulp.dest('app/styles')));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('data', function () {
  return gulp.src([
    'app/data/**/*'
  ], {
    dot: true
  }).pipe(gulp.dest('dist/data'));
});

gulp.task('extras', ['data'], function () {
  return gulp.src([
    'app/*.*',
    '!app/**/*.jade',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function () {
  $.nodemon(nodemonOpt)
    .on('restart', function() {
      console.log('server restart');
    });
});

gulp.task('serve', ['connect', 'views', 'templates', 'sprite', 'watch'], function () {
  //require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.jade',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/templates/**/*.jade', ['templates']);
  gulp.watch(['app/index.jade', 'app/layout.jade'], ['views', 'templates']);
  gulp.watch('app/images/sprite/*.png', ['sprite']);
  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch(['app/scripts/**/*.js', 'models/**/*.js'], ['jshint']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
