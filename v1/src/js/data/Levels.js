import levels from '../../json/levels.json';

if (window.electron) {
  // Add Workshop pack with empty levels
  const pack = {
    title: "Workshop",
    theme: "workshop",
    description: "Your Steam Workshop subscriptions.",
    levels: []
  }
  levels.packs.push(pack);

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
                  if (fileName.includes('.json')) {
                    pack.levels.push({
                      title: item.title,
                      description: item.title,
                      thumbnail: item.previewUrl,
                      path: `${ installInfo.folder }\\${ fileName }`,
                      links: [
                        `https://steamcommunity.com/sharedfiles/filedetails/?id=${ item.publishedFileId.toString() }`
                      ]
                    });
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

// Export levels as json data
export default levels;