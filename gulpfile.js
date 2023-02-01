const gulp = require("gulp");
const inline = require("gulp-inline");
var header = require('gulp-header');
var footer = require('gulp-footer');

gulp.task("default", () => {
  return gulp
    .src("./dist/*.html")
    .pipe(inline())
    .pipe(header('{% verbatim %}'))
    .pipe(footer('{% endverbatim %}'))
    .pipe(gulp.dest("./single-dist"));
});