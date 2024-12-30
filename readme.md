# Boxel 3D

## Local Development

- Install NodeJS package libraries: `npm install`
- Run development libraries `npm run dev`
- Use the link it provides

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (replace "package-name" for each package listed)

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

## Deploy to Steam - Part 1: Install Steamworks SDK
- Win: Download Steamworks SDK (`https://partner.steamgames.com/doc/sdk`). Then extract contents into a new folder. Ex: `C:\steamworks\sdk`
- Mac: Create a new directory and enter it: `mkdir ~/Steam && cd ~/Steam`. Then run `curl -sqL "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz"`

## Deploy to Steam - Part 2: Building to Steam (Use Mac for building)
- Copy app files into each steamworks content folder.
  - Win: `C:\steamworks\sdk\tools\ContentBuilder\content\boxel-3d\windows`
  - Mac: copy the contents from `mac` or `boxel-3d.zip` and paste into the `/Users/jacob/Steam/sdk/tools/ContentBuilder/content/boxel-3d/mac` folder.
- Build your game
  - Option 1: Watch videos showing how to do it: `https://partner.steamgames.com/doc/sdk/uploading`
  - Option 2:
    - Win: Copy the build & depot `.vdf` files from `/files/vdf/` to `C:\steamworks\sdk\tools\ContentBuilder\scripts`
    - Mac: Copy the build & depot `.vdf` files from `/files/vdf/` to `/Users/jacob/Steam/sdk/tools/ContentBuilder/scripts`
- Run SteamCMD
  - Win: `C:\steamworks\sdk\tools\ContentBuilder\builder\steamcmd.exe`
  - Mac: `cd /Users/jacob/Steam && ./steamcmd.sh`
- Login using `login <username>`
- Run build script. 
  - Win: `run_app_build C:\steamworks\sdk\tools\ContentBuilder\scripts\app_build_3208440.vdf`. Alternatively, you can run the `run_build.bat` file outside of the `/scripts` folder
  - Mac: `run_app_build /Users/jacob/Steam/sdk/tools/ContentBuilder/scripts/app_build_3208440.vdf`
- Navigate to the Partner Builds page: `https://partner.steamgames.com/apps/builds/3208440`
- Scroll to the latest `BuildID` and set the dropdown to the `default` branch, the click "Preview Change" to "publish" to Steam users.