import gulp from 'gulp';
import zip from 'gulp-zip';
import { readFileSync, writeFileSync } from 'fs';

let packagePath = './package.json';
let manifestChromePath = './build/manifest.json';
let manifestFirefoxPath = './files/json/firefox/manifest.json';
let packageFile = readFileSync(packagePath, 'utf8');
let manifestChrome = readFileSync(manifestChromePath, 'utf8');
let manifestFirefox = readFileSync(manifestFirefoxPath, 'utf8');
let version = JSON.parse(packageFile).version;

function updateManifestVersionFromPackage() {
  // Convert string to object
  const manifestChromeData = JSON.parse(manifestChrome);
  const manifestFirefoxData = JSON.parse(manifestFirefox);

  // Assign package version to each manifest
  manifestChromeData.version = version;
  manifestFirefoxData.version = version;

  // Convert object back to a string before writing
  manifestChrome = JSON.stringify(manifestChromeData, null, 2);
  manifestFirefox = JSON.stringify(manifestFirefoxData, null, 2);
  writeFileSync(manifestChromePath, manifestChrome);
  writeFileSync(manifestFirefoxPath, manifestFirefox);
}

function zipBuildFiles(platform = 'chrome', callback = () => {}) {
  // Build Chrome file
  gulp
    .src(['./build/**/*'], { encoding: false })
    .pipe(zip(`boxel-3d-${ version }-${ platform }.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist'))
    .on('end', callback); // Execute callback
}

function zipSrcFiles() {
  // Create zip file from source files
  gulp
    .src([
      './index.html',
      './src/**/*',
      './v1/**/*',
      './v2/**/*'
    ], { base: '.', encoding: false })
    .pipe(zip(`boxel-3d-${ version }-src.zip`, { buffer: true }))
    .pipe(gulp.dest('./dist'));
}

// Rewrite manifest versions from package version
updateManifestVersionFromPackage();

// Start zipping
zipBuildFiles('chrome', function() {
  // Replace manifest with Firefox manifest
  writeFileSync(manifestChromePath, manifestFirefox);

  // Build Firefox zip file
  zipBuildFiles('firefox', function() {
    // Revert manifest
    writeFileSync(manifestChromePath, manifestChrome);
  });
});

// Zip source files for Firefox submission
zipSrcFiles();