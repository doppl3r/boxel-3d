import levels from '../json/levels.json';
import themes from '../json/themes.json';
import skins from '../json/skins.json';
import mods from '../json/mods.json';

// Format existing levels
levels.packs.forEach(function(pack, i) {
  pack.levels.forEach(function(level, j) {
    // Add level number to label
    level.label = level.label || `${ i + 1 }-${ j + 1 }`;
    level.overlay = true;
  })
});

// Format existing skins
skins.forEach(skin => {
  skin.overlay = true;
  skin.tag = skin.title;
});

function isValidUrl(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch (error) {
    return false;
  }
}

async function fetchLevelPacks() {
  // Get settings from local storage
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');

  // Get list of URLs (and remove duplicates)
  const urls = [...new Set(settings?.levelPacks?.split(/\r?\n/) || [])];
  const pack = {
    title: "Level Packs",
    theme: "classic",
    description: "Custom community levels",
    levels: []
  }

  // Loop through URLs
  for (let i = 0; i < urls?.length || 0; i++) {
    try {
      const url = urls[i];

      // Check if URL is valid
      if (isValidUrl(url)) {
        const root = url.substring(0, url.lastIndexOf('/')) + '/';
        const response = await fetch(`${url}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        else {
          // Assign community levels to response JSON data
          const data = await response.json();
          
          // Add levels to the community pack (only once)
          const hasPack = levels.packs.some(p => p.title === pack.title);
          if (hasPack === false) {
            // Allow publisher to change the pack theme
            pack.theme = data.theme ?? pack.theme;
            pack.description = data.description ?? pack.description

            // Add new pack
            levels.packs.push(pack);
          }

          // Update level data from data
          data.levels.forEach(level => {
            level.path = root + level.path;
            level.description = level.title;
            level.overlay = true;
            pack.levels.push(level);
          });
        }
      }
    } catch (error) {
      console.error("Error fetching JSON from GitHub:", error);
    }
  }
}

fetchLevelPacks();

export { levels, mods, skins, themes};