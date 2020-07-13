var gulp = require('gulp');
var zip  = require('gulp-zip');
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
var version = obj.version;

// Distribute to 1) web, and 2) zip format
gulp.src(['./build/' + version + '/**/*']).pipe(gulp.dest('./dist/website/' + version + '/'));
gulp.src(['./build/' + version + '/**/*']).pipe(zip('boxel3d-' + version + '.zip')).pipe(gulp.dest('./dist/chrome/'));