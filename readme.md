# Boxel 3D

## License

This project is licensed under the MIT License. You may use, modify,
and distribute the code freely, including for commercial purposes.

The Boxel 3D name, logos, and branding are trademarks of Doppler
Creative and are not licensed by the MIT License. The trademark is
reserved by Doppler Creative and may not be used without permission.

## Local Development

- Install NodeJS package libraries: `npm install`
- Run development libraries `npm run dev`
- Use the link it provides

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (for Rapier.js, replace `latest` with `canary`)

## Test Chrome Extension

- Rebuild extension and open Google Chrome
- Click Extensions > Manage Extensions
- Enable Developer mode (top right)
- Click `Load unpacked` and navigate to the `/build` folder
- Open extension within Chrome

## Test Tauri Application

- Install dependencies: `npm install`
- Ensure Rust is installed (https://www.rust-lang.org/tools/install)
- Run desktop app in development: `npm start`
- Build desktop bundle: `npm run dist-tauri`

## Install Tauri for Windows
 - Build prerequisites: Rust toolchain (`rustup`/`cargo`) and Visual Studio Build Tools (MSVC) with the "Desktop development with C++" workload. Install via the Visual Studio Installer or use a package manager (e.g., Chocolatey) to obtain the build tools.

## Install Tauri for MacOS

- Build prerequisites: Rust toolchain (`rustup`/`cargo`) and Xcode Command Line Tools (`xcode-select --install`).

## Build Desktop Application

- Update release version in `package.json`
- Install dependencies: `npm install`
- Run custom script from package.json: `npm run build-tauri`
- Upload application from `/src-tauri/target/release/bundle` to Steam
  - Note: You need a PC to generate `.exe`, a Mac to generate `.app` and Linux to generate `.whatever`

## Install Steamworks SDK (only needed once)

- Win: Download Steamworks SDK (`https://partner.steamgames.com/doc/sdk`). Then extract contents into a new folder. Ex: `C:\steamworks\sdk`
- Mac: Create a new directory and enter it: `mkdir ~/Steam && cd ~/Steam`. Then run `curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz"`
- Copy/Paste build scripts
  - Option 1: Watch videos showing how to do it: `https://partner.steamgames.com/doc/sdk/uploading`
  - Option 2:
    - Win: Copy the build & depot `.vdf` files from `/files/vdf/` to `C:\steamworks\sdk\tools\ContentBuilder\scripts`

## Building to Steam (Windows)

- Copy app files:
  - Copy `.exe` file: `D:\Development\boxel-3d\src-tauri\target\release`
  - Paste: `C:\steamworks\sdk\tools\ContentBuilder\content\boxel-3d\windows`
- Run SteamCMD `C:\steamworks\sdk\tools\ContentBuilder\builder\steamcmd.exe +login fragem123`
- Run build script `run_app_build C:\steamworks\sdk\tools\ContentBuilder\scripts\app_build_3208440.vdf`.

## Building to Steam (Mac)

- Copy app files:
  - Copy `.app` file: `/Users/jacob/Development/boxel-3d/src-tauri/target/release/bundle/macos/`
  - Paste: `/Users/jacob/Steam/sdk/tools/ContentBuilder/content/boxel-3d/mac`
- Run SteamCMD `cd /Users/jacob/Steam && ./steamcmd.sh +login fragem123`
- Run build script `run_app_build /Users/jacob/Steam/sdk/tools/ContentBuilder/scripts/app_build_3208440.vdf`

## Publish on Steam

- Navigate to the Partner Builds page: `https://partner.steamgames.com/apps/builds/3208440`
- Scroll to the latest `BuildID` and set the dropdown to the `default` branch, the click "Preview Change" to "publish" to Steam users.

## Build on Android/iOS

- Increment `versionCode` and `versionName` in `/android/app/build.gradle`
- Run build & sync with `npm run build-android`
- Open Android Studio: `npx cap open android`
- Copy/paste keystore file from Google Drive to `/android/keystores/my-keystore.jsk`
- Select Build > Generate Signed App Bundle or APK...
- Copy/paste `.aab` file to desktop: `D:\Development\boxel-3d\android\app\release`
- Select "Create new release": `https://play.google.com/console/u/0/developers/7090777458282935969/app/4972579011570604048/tracks/production?tab=releases`
- Upload

## Update App Icon/Splash

- Update the assets within the `/files/png/assets` directory
- Run asset plugin with `npm run generate-assets`