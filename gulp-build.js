var gulp = require('gulp');
var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
var version = obj.version;
gulp.src(
    [
        'manifest.json',
        'index.html',
        'changelog.txt',
        'audio/**/*',
        'css/**/*',
        'fonts/**/*',
        'img/**/*',
        'json/**/*',
        'js/**/*'
    ], { base: './' }
).pipe(
    gulp.dest(
        'build/' + version
    )
);