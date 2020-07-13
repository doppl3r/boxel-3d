var gulp = require('gulp');
var zip  = require('gulp-zip');
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
gulp.src(['./build/**/*']).pipe(zip('boxel3d-' + obj.version + '.zip')).pipe(gulp.dest('./dist'));