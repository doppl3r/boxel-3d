import levels from '../../json/levels.json';

if (window.electron) {
  // Add Workshop pack with empty levels
  levels.packs.push({
    title: "Workshop",
    theme: "blue-mountains",
    description: "Your Steam Workshop subscriptions.",
    levels: []
  });

  try {
    // Get array of item ids
    const appId = window.electron.client.utils.getAppId();
    const appInstallDir = window.electron.client.apps.appInstallDir(appId);
    const itemIds = window.electron.client.workshop.getSubscribedItems();
    
    if (itemIds.length > 0) {
      // Get array of item objects
      try {
        const data = await window.electron.client.workshop.getItems(itemIds);
        const items = data.items.filter(item => item !== null);
        items.sort((a, b) => b.timeUpdated - a.timeUpdated);

        // TODO: Get files and add them to the Workshop pack
        items.forEach(async item => {
          const installInfo = window.electron.client.workshop.installInfo(item.publishedFileId);
          if (installInfo) {
            const files = await window.electron.getFileNames(installInfo.folder);
            const file = await window.electron.getFile(installInfo.folder, files[0]);

            // TODO: Add level to workshop pack
            console.log(installInfo, files, file)
          }
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