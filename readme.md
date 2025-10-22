# Boxel 3D

## License

This project is released under a custom, source-available,
non-commercial license: "Boxel-3D Non-Commercial License v1.0". The
license permits viewing, modifying, and sharing the source for
non-commercial purposes only. Commercial use and sale are prohibited
unless you obtain explicit written permission from the copyright
holder. This license is not OSI-approved and is not an "open source"
license in the OSI/FSF sense — it is source-available with a
non-commercial restriction. See `public/license.txt` for the full
text.

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

## Test Electron Application

- Install dependencies: `npm install`
- Run custom script from package.json: `npm start`