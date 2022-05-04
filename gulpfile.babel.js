import gulp from "gulp";
import del from "del";
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";
import revNapkin from "gulp-rev-napkin";
import plumber from "gulp-plumber";
import sourcemaps from "gulp-sourcemaps";
import sass from "gulp-sass";
import rename from "gulp-rename";
import notify from "gulp-notify";

const $ = require("auto-plug")("gulp");

var onError = function (err) {
  notify.onError({
    title: "Gulp",
    subtitle: "Failure!",
    message: "Error: <%= error.message %>",
    sound: "Basso",
  })(err);
  this.emit("end");
};

// compresses images (client => dist)
gulp.task("images", () => {
  return gulp
    .src("client/**/*.{jpg,png,gif,svg}")
    .pipe(
      $.imagemin({
        progressive: true,
        interlaced: true,
      })
    )
    .pipe(gulp.dest("public"));
});

gulp.task("styles", function () {
  return gulp
    .src(["./client/styles/main.scss", "./client/styles/oldie.scss"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        includePaths: "node_modules",
        importer: function importer(url, prev, done) {
          if (url === "@financial-times/math") {
            url = "@financial-times/math/index.scss";
          }
          if (url === "@financial-times/sass-mq") {
            url = "@financial-times/sass-mq/index.scss";
          }
          return { file: url };
        },
      })
    )
    .pipe(rename("main.css"))
    .pipe(gulp.dest("public/styles"));
});

// builds scripts with browserify
gulp.task("scripts", () => {
  var main = gulp
    .src(["./client/scripts/main.js"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(rename("main.bundle.js"))
    .pipe(gulp.dest("public/scripts"));
  var scroll = gulp
    .src(["./client/scripts/scroll-depth-tracking.js"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(rename("scroll-depth-tracking.bundle.js"))
    .pipe(gulp.dest("public/scripts"));
  return main && scroll;
});

// copies over miscellaneous files (client => dist)
gulp.task("copy", () => {
  return gulp
    .src(
      [
        "client/**/*",
        "!client/styles/**",
        "!client/**/*.{scss,js,jpg,png,gif,svg}", // all handled by other tasks
      ],
      { dot: true }
    )
    .pipe(gulp.dest("public"));
});

// clears out the dist and .tmp folders
gulp.task("clean", del.bind(null, ["public/*", "!public/.git"], { dot: true }));

gulp.task("rev", () => {
  return (
    gulp
      .src(
        [
          "public/styles/**/*.css",
          "public/scripts/**/*.js",
          "public/images/**/*.{png,svg,gif,jpg}",
        ],
        { base: "assets" }
      )
      .pipe(gulp.dest("public")) // copy original assets to build dir
      // .pipe(rev())
      .pipe(revReplace({ replaceInExtensions: [".css"] }))
      .pipe(revNapkin({ verbose: false }))
      .pipe(gulp.dest("public")) // write rev'd assets to build dir
      .pipe(rev.manifest())
      .pipe(gulp.dest("public"))
  ); // write manifest to build dir
});

// makes a production build (client => dist)
gulp.task(
  "default",
  gulp.series("clean", "copy", "styles", "scripts", "images", "rev"),
  (done) => {
    done();
  }
);

// sets up watch-and-rebuild for JS and CSS
gulp.task("watch", () => {
  gulp.watch(
    "./client/**/*.scss",
    gulp.series(["clean", "styles", "scripts", "images"])
  );
  gulp.watch(
    "./client/**/*.{js,hbs}",
    gulp.series(["clean", "styles", "scripts", "images"])
  );
  gulp.watch(
    "./client/**/*.{jpg,png,gif,svg}",
    gulp.series(["clean", "styles", "scripts", "images"])
  );
});

// runs a development server (serving up .tmp and client)
gulp.task("serve", gulp.series(["watch", "images"]), (done) => {
  const bs = require("browser-sync").create();

  bs.init(
    {
      files: ["public/**/*", "client/**/*"],
      server: {
        baseDir: ["public", "client"],
        routes: {
          "/bower_components": "bower_components",
        },
      },
      open: false,
      notify: false,
    },
    done
  );
});

// builds and serves up the 'public' directory
gulp.task("serve:dist", gulp.series(["default"]), (done) => {
  require("browser-sync").create().init(
    {
      open: false,
      notify: false,
      server: "public",
    },
    done
  );
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
// gulp.task('scsslint', () => {
//   return obt.verify.scssLint(gulp, {
//     sass: './client/styles/*.scss',
//   }).on('error', function (error) {
//     console.error('\n', error, '\n');
//     this.emit('end');
//   });
// });
