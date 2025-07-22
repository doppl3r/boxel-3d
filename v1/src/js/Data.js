import levels from '../json/levels.json';
import themes from '../json/themes.json';
import skins from '../json/skins.json';
import mods from '../json/mods.json';

// Declare Steam variables
const isSteamEnabled = window.electron?.client != undefined;

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

function getItemState(item, key) {
  return localStorage.getItem(`item_${ item.publishedFileId }_${ key }`);
}

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
    theme: "workshop",
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
          const communityLevels = await response.json();
          
          // Add levels to the community pack (only once)
          const hasPack = levels.packs.some(p => p.title === pack.title);
          if (hasPack === false) levels.packs.push(pack);

          // Update level data from response
          communityLevels.levels.forEach(level => {
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

// Add workshop items to data points
if (isSteamEnabled) {
  // Add Workshop pack with empty levels
  const pack = {
    title: "Workshop",
    theme: "workshop",
    description: "Your Steam Workshop subscriptions.",
    levels: []
  }
  levels.packs.push(pack);

  // Make a request to Steam Workshop API
  try {
    // Get array of item ids
    const itemIds = window.electron.client.workshop.getSubscribedItems();
    
    if (itemIds.length > 0) {
      // Get array of item objects
      try {
        // Get workshop items using a promise
        window.electron.client.workshop.getItems(itemIds).then(data => {
          const items = data.items.filter(item => item !== null);
          items.sort((a, b) => b.timeUpdated - a.timeUpdated);

          // Loop through each item for unique data
          items.forEach(item => {
            // Get item enabled state
            let enabled = getItemState(item, 'enabled');
            if (enabled === null) enabled = true; // Default enabled
            else enabled = enabled === 'true'; // Convert string to boolean

            // Get item install information
            const installInfo = window.electron.client.workshop.installInfo(item.publishedFileId);
            if (installInfo && enabled === true) {
              // Get filenames using a Promise
              window.electron.getFileNames(installInfo.folder).then(fileNames => {
                // Loop through each file name
                fileNames.forEach(fileName => {
                  // Assign keys/values to item (BubbleCarousel.vue format)
                  Object.assign(item, {
                    title: item.title,
                    description: item.description,
                    thumbnail: item.previewUrl,
                    path: `${ installInfo.folder }\\${ fileName }`,
                    overlay: true,
                    links: [
                      `https://steamcommunity.com/sharedfiles/filedetails/?id=${ item.publishedFileId.toString() }`
                    ]
                  });

                  // Conditionally populate data by file extensions
                  if (['.json'].some(ext => fileName.includes(ext))) {
                    Object.assign(item, {
                      description: item.title
                    })
                    pack.levels.push(item);
                  }
                  else if (['.js'].some(ext => fileName.includes(ext))) {
                    mods.push(item);
                  }
                  else if (['.png', '.jpg'].some(ext => fileName.includes(ext))) {
                    Object.assign(item, {
                      id: item.publishedFileId.toString(),
                      url: item.path,
                      title: item.title,
                      tag: item.title
                    });
                    skins.push(item);
                  }
                })
              });
            }
          });
        });
      }
      catch (getItemsError) {
        console.error(getItemsError)
      }
    }
  }
  catch (subscribedError) {
    console.error(subscribedError);
  }
}

export { levels, mods, skins, themes};