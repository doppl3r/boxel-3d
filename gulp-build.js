var gulp = require('gulp');
gulp.src(
    [
        'manifest.json',
        'index.html',
        'audio/**/*',
        'css/**/*',
        'fonts/**/*',
        'img/**/*',
        'js/**/*'
    ], { base: './' }
).pipe(
    gulp.dest(
        'build'
    )
);