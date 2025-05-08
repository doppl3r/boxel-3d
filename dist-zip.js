import gulp from 'gulp';
import zip from 'gulp-zip';
import { readFileSync, writeFileSync } from 'fs';

const manifestChrome = readFileSync('./build/manifest.json', 'utf8');
const manifestFirefox = readFileSync('./files/json/firefox/manifest.json', 'utf8');
const version = JSON.parse(manifestChrome).version;

function zipBuildFiles(platform = 'chrome', callback = () => {}) {
  // Build Chrome file
  gulp
    .src(['./build/**/*'], { encoding: false })
    .pipe(zip(`boxel-3d-${ version }-${ platform }.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist'))
    .on('end', callback);
}

function zipSrcFiles() {
  // Build Chrome file
  gulp
    .src(['./index.html', './src/**/*', './v1/**/*', './v2/**/*'], { base: '.', encoding: false })
    .pipe(zip(`boxel-3d-${ version }-src.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist'));
}

// Start zipping
zipBuildFiles('chrome', function() {
  // Replace manifest with Firefox manifest
  writeFileSync('./build/manifest.json', manifestFirefox);

  // Build Firefox zip file
  zipBuildFiles('firefox', function() {
    // Revert manifest
    writeFileSync('./build/manifest.json', manifestChrome);
  });
});

// Zip source files for Firefox submission
zipSrcFiles();