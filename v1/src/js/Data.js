import levels from '../json/levels.json';
import themes from '../json/themes.json';
import skins from '../json/skins.json';

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

// Add workshop items to data points
if (window.electron) {
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
            const installInfo = window.electron.client.workshop.installInfo(item.publishedFileId);
            if (installInfo) {
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
                    pack.levels.push(item);
                  }
                  else if (['.png', '.jpg'].some(ext => fileName.includes(ext))) {
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

export { levels, themes, skins };