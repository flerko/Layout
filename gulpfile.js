var gulp = require('gulp');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var gcmq = require('gulp-group-css-media-queries');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var prettify = require('gulp-html-prettify');
var base64 = require('gulp-base64-inline');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');
var csso = require('postcss-csso');
var fileinclude = require('gulp-file-include');
var browserify = require('gulp-browserify');
var csscomb = require('gulp-csscomb');
var spritesmith = require('gulp.spritesmith');

var path = {

    src: {
        html: './src/*.html',
        js: './src/js/app.js',
        style: './src/stylus/app.styl',
        contentImages: './src/images/content/*.*',
        fonts: './src/fonts/*.*',
        sprite: './src/images/sprite/*'
    },
    dist: {
        html: './dist/',
        js: './dist/js/',
        style: './dist/css/',
        contentImages: './dist/images/',
        fonts: './dist/fonts/',
        img: './dist/images/'
    },
    watch: {
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/stylus/**/*.styl',
        contentImages: './src/images/content/*.*',
        fonts: './src/fonts/*.*',
        sprite: './src/images/sprite/*'
    }

};

var onError = function errorsNotify(err) {
    notify.onError({
        title:    "Gulp",
        subtitle: "Failure!",
        message:  "Error: <%= error.message %>",
        sound:    "Beep"
    })(err);
    this.emit('end');
};

gulp.task('sprite', function() {
    var spriteData = gulp.src(path.src.sprite)
        .pipe(plumber({errorHandler: onError}))
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.styl',
            cssFormat: 'stylus',
            algorithm: 'binary-tree',
            cssTemplate: './src/stylus/helpers/stylus.template.mustache',
            padding: 3,
            cssVarMap: function(sprite) {
                sprite.name = 's-' + sprite.name;
            }
        }));
    spriteData.img.pipe(gulp.dest(path.dist.img));
    spriteData.css.pipe(gulp.dest('./src/stylus/helpers'))
});

gulp.task('fonts', function () {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

gulp.task('html', function () {
    gulp
        .src(path.src.html)
        .pipe(fileinclude({
              prefix: '@@',
              basepath: '@file'
            }))
        .pipe(prettify({indent_char: ' ', indent_size: 4}))
        .pipe(gulp.dest(path.dist.html))
});


gulp.task('css', function () {
    var plugins = [
        autoprefixer({browsers: ['last 2 version']}),
        require('postcss-csso')
    ];
    return gulp
                .src(path.src.style)
                .pipe(plumber({errorHandler: onError}))
                .pipe(stylus())
                .pipe(base64('../images/base64'))
                .pipe(gcmq())
                .pipe(csscomb())
                .pipe(postcss(plugins))
                .pipe(concat('app.min.css'))
                .pipe(gulp.dest(path.dist.style))
});

gulp.task('css:vendors', function () {
    var plugins = [
        require('postcss-csso')
    ];
    gulp
        .src([
             './node_modules/normalize.css/normalize.css'
         ])
        .pipe(plumber({errorHandler: onError}))
        .pipe(postcss(plugins))
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest(path.dist.style))
});

gulp.task('js', function() {
    gulp
        .src(path.src.js)
        .pipe(browserify())
        // .pipe(uglify())
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest(path.dist.js))
});

gulp.task('js:vendors', function() {
    gulp.src([
         './node_modules/slick-carousel/slick/slick.min.js'
     ])
    .pipe(plumber({errorHandler: onError}))
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.dist.js))
});

gulp.task('images:content', function() {
    gulp.src(path.src.contentImages)
        .pipe(gulp.dest(path.dist.contentImages))
});

gulp.task('watch-project', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('css');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js');
    });
    watch([path.watch.contentImages], function(event, cb) {
        gulp.start('images:content');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts');
    });
    watch([path.watch.sprite], function(event, cb) {
        gulp.start('sprite');
    });
});

gulp.task('build', [
    'html',
    'css',
    'css:vendors',
    'images:content',
    'js',
    'js:vendors',
    'fonts',
    'sprite'
]);

gulp.task('default', ['build']);
gulp.task('watch', ['build', 'watch-project']);
