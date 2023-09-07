# Boxel 3D

## Local Development

- Install NodeJS package libraries: `npm install`
- Run development libraries `npm run dev`
- Use the link it provides

## Build for release

- Run build with `npm run build` to create a fresh `/dist` folder
- Compress `/dist` folder into a `.zip` file format
- Upload to Chrome Webstore

## Test Chrome Extension

- Rebuild extension and open Google Chrome
- Click Extensions > Manage Extensions
- Enable Developer mode (top right)
- Click `Load unpacked` and navigate to the `/dist` folder
- Open extension within Chrome

## Update NPM libraries

- Run `npm outdated`
- Run `npm i package-name@latest` (replace "package-name" for each package listed)