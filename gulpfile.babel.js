import runSequence from 'run-sequence';
import obt from 'origami-build-tools';
import gulp from 'gulp';
import del from 'del';
import rev from 'gulp-rev';
import revReplace from 'gulp-rev-replace';
import revNapkin from 'gulp-rev-napkin';

const $ = require('auto-plug')('gulp');

// compresses images (client => dist)
gulp.task('images', () => {
  return gulp.src('client/**/*.{jpg,png,gif,svg}')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
    }))
    .pipe(gulp.dest('public'));
});


// copies over miscellaneous files (client => dist)
gulp.task('copy', () => {
  return gulp.src([
    'client/**/*',
    '!client/styles/**',
    '!client/**/*.{scss,js,jpg,png,gif,svg}', // all handled by other tasks
  ], {dot: true})
    .pipe(gulp.dest('public'));
});


// clears out the dist and .tmp folders
gulp.task('clean', del.bind(null, ['public/*', '!public/.git'], {dot: true}));


// runs a development server (serving up .tmp and client)
gulp.task('serve', ['watch', 'images'], done => {
  const bs = require('browser-sync').create();

  bs.init({
    files: ['public/**/*', 'client/**/*'],
    server: {
      baseDir: ['public', 'client'],
      routes: {
        '/bower_components': 'bower_components',
      },
    },
    open: false,
    notify: false,
  }, done);
});


// builds and serves up the 'public' directory
gulp.task('serve:dist', ['default'], done => {
  require('browser-sync').create().init({
    open: false,
    notify: false,
    server: 'public',
  }, done);
});


// builds scripts with browserify
gulp.task('scripts', () => {
  return obt.build.js(gulp, {
    buildFolder: 'public',
    js: './client/scripts/main.js',
    buildJs: 'scripts/main.bundle.js',
    env: process.env.NODE_ENV
  }).on('error', function (error) {
    console.error(error);
    this.emit('end');
  });
});


// builds stylesheets with sass/autoprefixer
gulp.task('styles', () => {
  return obt.build.sass(gulp, {
    buildFolder: 'public',
    sass: ['./client/styles/main.scss', './client/styles/oldie.scss'],
    buildCss: {dirname: 'styles'},
    env: process.env.NODE_ENV
  }).on('error', function (error) {
    console.error(error);
    this.emit('end');
  });
});

gulp.task('rev', () => {
  return gulp.src([
            'public/styles/**/*.css',
            'public/scripts/**/*.js',
            'public/images/**/*.{png,svg,gif,jpg}'
        ], {base: 'assets'})
        .pipe(gulp.dest('public'))  // copy original assets to build dir
        .pipe(rev())
        .pipe(revReplace({replaceInExtensions: ['.css']}))
        .pipe(revNapkin({verbose:false}))
        .pipe(gulp.dest('public')) // write rev'd assets to build dir
        .pipe(rev.manifest())
        .pipe(gulp.dest('public')); // write manifest to build dir
});


// lints JS files (DISABLED for poor ES6 support; we're going to switch to ESLint)
// gulp.task('jshint', () => {
//   return obt.verify.jsHint(gulp, {
//     jshint: './client/scripts/*.js',
//   }).on('error', function (error) {
//     console.error('\n', error, '\n');
//     this.emit('end');
//   });
// });


// lints SCSS files
gulp.task('scsslint', () => {
  return obt.verify.scssLint(gulp, {
    sass: './client/styles/*.scss',
  }).on('error', function (error) {
    console.error('\n', error, '\n');
    this.emit('end');
  });
});


// sets up watch-and-rebuild for JS and CSS
gulp.task('watch', done => {
  runSequence('clean', ['scripts', 'styles'], () => {
    gulp.watch('./client/**/*.scss', ['styles', 'scsslint']);
    gulp.watch('./client/**/*.{js,hbs}', ['scripts'/*, 'jshint'*/]);
    gulp.watch('./client/**/*.{jpg,png,gif,svg}', ['images']);
    done();
  });
});


// makes a production build (client => dist)
gulp.task('default', done => {

  runSequence(
    ['clean', 'scsslint'/*, 'jshint'*/],
    ['scripts', 'styles', 'copy'],
    ['images'],
    ['rev'],
  done);
});
