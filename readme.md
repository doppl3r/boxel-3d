# Boxel 3D

## Local Development

- Install NodeJS package libraries: `npm install`
- Run development libraries `npm run dev`
- Use the link it provides

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (for Rapier.js, replace `latest` with `canary`)

## Build for release

- Run build with `npm run build` to create a fresh `/build` folder
- Compress `/build` folder into a `.zip` file format
- (Optional) Replace the manifest.json data from manifest-[browser].json
- Upload to Chrome Webstore

## Test Chrome Extension

- Rebuild extension and open Google Chrome
- Click Extensions > Manage Extensions
- Enable Developer mode (top right)
- Click `Load unpacked` and navigate to the `/build` folder
- Open extension within Chrome

## Test Electron Application

- Update release version in `package.json`
- Install dependencies: `npm install`
- Run custom script from package.json: `npm start`

## Build Application

- Update release version in `package.json`
- Install dependencies: `npm install`
- Run custom script from package.json: `npm run dist`
- Upload application from `/dist/boxel-3d x.x.x` to Steam
  - Note: You need a PC to generate `.exe`, a Mac to generate `.app` and Linux to generate `.whatever`

## Install Steamworks SDK

- Win: Download Steamworks SDK (`https://partner.steamgames.com/doc/sdk`). Then extract contents into a new folder. Ex: `C:\steamworks\sdk`
- Mac: Create a new directory and enter it: `mkdir ~/Steam && cd ~/Steam`. Then run `curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz"`
- Copy/Paste build scripts
  - Option 1: Watch videos showing how to do it: `https://partner.steamgames.com/doc/sdk/uploading`
  - Option 2:
    - Win: Copy the build & depot `.vdf` files from `/files/vdf/` to `C:\steamworks\sdk\tools\ContentBuilder\scripts`
    - Mac: Copy the build & depot `.vdf` files from `/files/vdf/` to `/Users/jacob/Steam/sdk/tools/ContentBuilder/scripts`

## Building to Steam (Windows)

- Copy app files:
  - Copy: `D:\Development\boxel-3d\dist`
  - Paste: `C:\steamworks\sdk\tools\ContentBuilder\content\boxel-3d\windows`
- Run SteamCMD `C:\steamworks\sdk\tools\ContentBuilder\builder\steamcmd.exe +login fragem123`
- Run build script `run_app_build C:\steamworks\sdk\tools\ContentBuilder\scripts\app_build_3208440.vdf`.

## Building to Steam (Mac)

- Copy app files:
  - Copy: `/Users/jacob/Development/boxel-3d/dist/mac`
  - Paste: `/Users/jacob/Steam/sdk/tools/ContentBuilder/content/boxel-3d/mac`
- Run SteamCMD `cd /Users/jacob/Steam && ./steamcmd.sh +login fragem123`
- Run build script `run_app_build /Users/jacob/Steam/sdk/tools/ContentBuilder/scripts/app_build_3208440.vdf`

## Publish on Steam

- Navigate to the Partner Builds page: `https://partner.steamgames.com/apps/builds/3208440`
- Scroll to the latest `BuildID` and set the dropdown to the `default` branch, the click "Preview Change" to "publish" to Steam users.

## Build on Android/iOS

- Run build with `npm run build` to create a fresh `/build` folder
- Run sync script to copy files to device folders: `npx cap sync` 
- Open Android Studio: `npx cap open android`
- Select Build > Generate Signed App Bundle or APK...

## Update App Icon/Splash

- Run asset plugin with `npx capacitor-assets generate --android`