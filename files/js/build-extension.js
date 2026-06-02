import gulp from 'gulp';
import zip from 'gulp-zip';
import { readFileSync, writeFileSync } from 'fs';

let packagePath = './package.json';
let manifestChromePath = './dist/manifest.json';
let manifestFirefoxPath = './files/json/firefox/manifest.json';
let packageFile = readFileSync(packagePath, 'utf8');
let manifestChrome = readFileSync(manifestChromePath, 'utf8');
let manifestFirefox = readFileSync(manifestFirefoxPath, 'utf8');
let version = JSON.parse(packageFile).version;

function zipBuildFiles(platform = 'chrome', callback = () => {}) {
  // Build Chrome file
  gulp
    .src(['./dist/**/*'], { encoding: false })
    .pipe(zip(`boxel-3d-${ version }-${ platform }.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist-extension'))
    .on('end', callback); // Execute callback
}

function zipSrcFiles() {
  // Create zip file from source files
  gulp
    .src([
      './index.html',
      './src/**/*'
    ], { base: '.', encoding: false })
    .pipe(zip(`boxel-3d-${ version }-src.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist-extension'));
}

// Start zipping
zipBuildFiles('chrome', function() {
  // Replace manifest with Firefox manifest
  writeFileSync(manifestChromePath, manifestFirefox);

  // Build firefox zip files
  zipBuildFiles('firefox');
  zipSrcFiles();
});