<script setup>
  import { computed, nextTick, ref, toRaw } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Loader from './Loader.vue';
  
  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  const isElectronApp = ref(window.electron != undefined);
  const isLoading = ref(false);
  const itemsRef = ref();
  const itemTypes = ref([
    { title: 'Subscriptions', id: 'subscriptions', icon: 'check_box' },
    { title: 'Creations', id: 'creations', icon: 'add_box' }
  ]);
  const itemsSubscriptions = ref([]);
  const itemsCreations = ref([]);
  const selectedItemType = ref(itemTypes.value[0]);
  const selectedItem = ref({});
  const selectedItemUpdateDetails = ref({});
  const itemIsSelected = computed(() => item => {
    const itemEqualsSelected = item == selectedItem.value;
    const itemHasKeys = (item == null && Object.keys(selectedItem.value).length > 0);
    return itemEqualsSelected || itemHasKeys;
  });
  const search = ref('');
  const filteredItems = computed(() => {
    const items = selectedItemType.value.id == 'subscriptions' ? itemsSubscriptions : itemsCreations;
    
    // Evaluate true if any object value matches
    return items.value.filter(item => item && Object.values(item).some(val => val?.toString().toLowerCase().includes(search.value.toLowerCase())))
  });
  const showSaveButton = computed(() => {
    const isCreation = selectedItemType.value.id == 'creations';
    const isChanged = Object.keys(selectedItemUpdateDetails.value).length > 0;
    return isCreation && isChanged && isLoading.value == false;
  });

  function clearSearch() {
    search.value = '';
  }

  async function selectItemType(type) {
    selectedItemType.value = type;
    if (selectedItemType.value.id == 'subscriptions') await getSubscriptions();
    else await getCreations();
    selectFirstItem();
  }

  function selectItem(item) {
    // Set new selected item value
    if (selectedItem.value != item) {
      selectedItemUpdateDetails.value = {}; // Reset changes
      selectedItem.value = item;
    }
  }

  function selectFirstItem() {
    selectItem(filteredItems.value[0] || {});
    scrollToSelected();
  }

  function selectLastItem() {
    const length = filteredItems.value.length;
    const index = length - 1;
    if (length > 0) {
      selectItem(filteredItems.value[index] || {});
      scrollToSelected();
    }
  }

  function openLink(url, target = '_self') {
    window.open(url, target);
  }

  async function getSubscriptions() {
    isLoading.value = true;
    if (isElectronApp.value == true) {
      try {
        // Get array of item ids
        const itemIds = window.electron.client.workshop.getSubscribedItems();
        
        if (itemIds.length > 0) {
          // Get array of item objects
          try {
            const data = await window.electron.client.workshop.getItems(itemIds);
            const items = data.items.filter(item => item !== null);
            items.sort((a, b) => b.timeUpdated - a.timeUpdated);
            itemsSubscriptions.value = items;

            // Download immediately if the file is missing
            items.forEach(async item => {
              const installInfo = await window.electron.client.workshop.installInfo(item.publishedFileId);
              if (installInfo) {
                // Download if no file names exist
                const fileNames = await window.electron.getFileNames(installInfo.folder);
                if (fileNames.length == 0) downloadContent(item);
              }
            })
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
    isLoading.value = false;
  }

  async function getCreations() {
    isLoading.value = true;
    if (isElectronApp.value == true) {
      const appOwner = window.electron.client.apps.appOwner();
      const appId = window.electron.client.utils.getAppId();

      // page: 1, accountId: 37133196, listType: Published, itemType: All, sortOrder: CreationOrderAsc, appIds: {}
      try {
        const data = await window.electron.client.workshop.getUserItems(1, appOwner.accountId, 0, 13, 0, { creator: appId });
        const items = data.items;
        items.sort((a, b) => b.timeUpdated - a.timeUpdated);
        itemsCreations.value = items;
      }
      catch (error) {
        console.error(error);
      }
    }
    isLoading.value = false;
  }

  async function createItem() {
    try {
      // Create item and select it
      isLoading.value = true;
      const appId = window.electron.client.utils.getAppId();
      const data = await window.electron.client.workshop.createItem(appId);
      const item = await window.electron.client.workshop.getItem(data.itemId);
      const preview = await window.electron.getFilePath('public/png/workshop-thumbnail.png');
      const meta = {
        title: 'New Workshop Item',
        description: 'Workshop item description',
        previewPath: preview,
        previewUrl: preview
      };
      await updateItem(item, meta);
      isLoading.value = false;

      // Update item for later
      Object.assign(item, meta);
      itemsCreations.value.unshift(item);
      selectFirstItem();
    }
    catch (error) {
      console.error(error);
    }
  }

  function scrollToSelected() {
    nextTick(() => {
      const index = filteredItems.value.findIndex(item => item == selectedItem.value);
      if (index >= 0) itemsRef.value.children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  async function updateItem(item, updateDetails) {
    let ugcResult;

    try {
      // Assign additional details
      Object.assign(updateDetails, {
        visibility: 0 // 0 = Public, 1 = FriendsOnly, 2 = Private, 3 = Unlisted
      });
      
      // updateDetails: title, description, changeNote, previewPath, contentPath, tags, visibility
      isLoading.value = true;
      ugcResult = await window.electron.client.workshop.updateItem(item.publishedFileId, updateDetails);
    }
    catch (error) {
      console.error(error);
    }
    isLoading.value = false;
    return ugcResult;
  }

  async function updateSelectedItem() {
    const ugcResult = await updateItem(toRaw(selectedItem.value), toRaw(selectedItemUpdateDetails.value));
    selectedItemUpdateDetails.value = {};
    return ugcResult
  }

  function getTagFromPath(path) {
    let tag;
    if (['.json'].some(ext => path.includes(ext))) tag = 'Level';
    else if (['.js'].some(ext => path.includes(ext))) tag = 'Mod';
    else if (['.png', '.jpg'].some(ext => path.includes(ext))) tag = 'Skin';
    return tag;
  }

  async function downloadContent(item) {
    isLoading.value = true;
    let downloaded = await window.electron.client.workshop.download(item.publishedFileId, true);
    isLoading.value = false;
    return downloaded;
  }

  async function selectContent(item) {
    // Ensure item is selected
    selectItem(item);

    // Prompt dialog for data
    const data = await electron.dialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { 'name': 'Level File(s)', 'extensions': ['json'] },
        { 'name': 'Skin File(s)', 'extensions': ['jpg', 'png'] },
        { 'name': 'Mod File(s)', 'extensions': ['js'] },
      ]
    });

    // Update if data is not canceled
    if (data.canceled == false) {
      const tags = [getTagFromPath(data.filePaths[0])];

      // Assign new data to updateDetails object
      Object.assign(selectedItemUpdateDetails.value, {
        contentPath: data.filePaths[0],
        tags: tags // Ex: "Level", "Skin", or "Mod"
      });
    }
  }

  function updateTitle(item, e) {
    item.title = e.target.value;
    selectedItemUpdateDetails.value.title = e.target.value;
  }

  function updateDescription(item, e) {
    item.description = e.target.value;
    selectedItemUpdateDetails.value.description = e.target.value;
  }

  async function selectImage(item) {
    // Ensure item is selected
    selectItem(item);

    // Prompt dialog for data
    const data = await electron.dialog({
      properties: ['openFile'],
      filters: [{ 'name': 'Preview Image', 'extensions': ['png', 'jpg', 'gif'] }]
    });

    // Update if data is not canceled
    if (data.canceled == false) {
      item.previewUrl = data.filePaths[0];
      selectedItemUpdateDetails.value.previewPath = data.filePaths[0];
    }
  }

  async function loadModal() {
    await selectItemType(selectedItemType.value);
    selectFirstItem()
  }
</script>

<template>
  <Transition name="fade-modal" @before-enter="loadModal">
    <div class="modal workshop">
      <div class="workshop__background" @click="$emit('close')"></div>
      <div class="workshop__container">
        <div class="workshop__types">
          <div class="workshop__types-header">{{ i18n.t('workshop.text.workshop') }}</div>
          <ul class="workshop__types-list">
            <template v-for="itemType in itemTypes" :key="itemType.id">
              <li>
                <button :class="{ selected: selectedItemType == itemType }" @click="selectItemType(itemType)">
                  <span class="material-symbols-rounded">{{ itemType.icon }}</span>
                  <span>{{ itemType.title }}</span>
                </button>
              </li>
            </template>
          </ul>
        </div>
        <div class="workshop__items">
          <div class="workshop__items-header">
            <input class="workshop__search" v-model="search" :placeholder="`${ i18n.t('popup.text.search') }...`" type="text">
            <button class="search-icon" tabindex="-1">
              <span class="material-symbols-rounded">search</span>
            </button>
            <button class="clear-icon" @click="clearSearch()" v-if="search.length > 0">
              <span class="material-symbols-rounded">close</span>
            </button>
          </div>
          <ul class="workshop__items-list" ref="itemsRef">
            <li>
              <template v-if="selectedItemType.id == 'subscriptions'">
                <template v-if="isElectronApp == true">
                  <button @click="openLink('https://steamcommunity.com/workshop/browse/?appid=3208440', '_blank')">
                    <span class="material-symbols-rounded">open_in_new</span>
                    <span>{{ i18n.t('workshop.text.browse_items') }}</span>
                  </button>
                </template>
                <template v-else>
                  <button @click="openLink('https://steamcommunity.com/workshop/browse/?appid=3208440', '_blank')">
                    <span class="material-symbols-rounded">open_in_new</span>
                    <span>{{ i18n.t('workshop.text.browse_items') }} ({{ i18n.t('workshop.text.steam_version') }})</span>
                  </button>
                </template>
              </template>
              <template v-else-if="selectedItemType.id == 'creations'">
                <template v-if="isElectronApp == true">
                  <button @click="createItem()">
                    <span class="material-symbols-rounded">add</span>
                    <span>{{ i18n.t('workshop.text.create_item') }}</span>
                  </button>
                </template>
                <template v-else>
                  <button @click="openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank')">
                    <span class="material-symbols-rounded">add</span>
                    <span>{{ i18n.t('workshop.text.create_item') }} ({{ i18n.t('workshop.text.steam_version') }})</span>
                  </button>
                </template>
              </template>
            </li>
            <li v-for="item in filteredItems" :key="item.title">
              <button :class="{ selected: selectedItem == item }" @click="selectItem(item)">
                <img :src="item.previewUrl || undefined" :alt="item.title" />
                <span v-if="selectedItemType.id == 'subscriptions'">{{ item.title }}</span>
                <template v-else>
                  <input type="text" :value="item.title" @change="updateTitle(item, $event)" />
                  <span class="accept material-symbols-rounded">check</span>
                </template>
              </button>
              <button v-if="itemIsSelected(item) && selectedItemType.id == 'subscriptions'" @click="downloadContent(item)" title="Force update">
                <span class="material-symbols-rounded">refresh</span>
              </button>
              <button v-if="itemIsSelected(item) && selectedItemType.id == 'creations'" @click="selectContent(item)" title="Upload new content (ex: My Level.json)">
                <span class="material-symbols-rounded">folder_open</span>
              </button>
              <button v-if="itemIsSelected(item)" @click="openLink('https://steamcommunity.com/sharedfiles/filedetails/?id=' + item.publishedFileId, '_blank')" title="View item">
                <span class="material-symbols-rounded">link</span>
              </button>
            </li>
          </ul>
        </div>
        <div class="workshop__info">
          <div class="workshop__info-header">{{ i18n.t('popup.text.info') }}</div>
          <div class="workshop__info-content">
            <div class="workshop__info-thumbnail">
              <img :src="selectedItem.previewUrl || undefined" :alt="selectedItem.description" />
              <label v-if="selectedItem.label">
                <span>{{ selectedItem.label }}</span>
              </label>
              <button
                v-if="itemIsSelected(null) && selectedItemType.id == 'creations' && isElectronApp == true"
                @click="selectImage(selectedItem)"
              >
                <span class="material-symbols-rounded">edit</span>
                <span>{{ i18n.t('workshop.text.edit') }}</span>
              </button>
            </div>
            <div class="workshop__info-details">
              <textarea :disabled="selectedItemType.id == 'subscriptions'" @change="updateDescription(selectedItem, $event)" :key="selectedItem.publishedFileId">{{ selectedItem.description }}</textarea>
              <span class="accept material-symbols-rounded">check</span>
            </div>
            <button
              v-if="showSaveButton"
              @click="updateSelectedItem()"
            >
              <span class="material-symbols-rounded">save</span>
              <span>Save</span>
            </button>
          </div>
        </div>
        <Transition name="loading">
          <div class="workshop__loading" v-if="isLoading">
            <Loader />
          </div>
        </Transition>
        <a class="workshop__close" @click="$emit('close')" :title="i18n.t('popup.button.close')">
          <span class="material-symbols-rounded">close</span>
        </a>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
  // Animations
  @keyframes translateBackground { 0% { background-position: 0em 0em; } 100% { background-position: -8em -8em; } }
  @keyframes fade { 0% { opacity: 0; } 100% { opacity: 1; } }

  // Modal fade transition
  .fade-modal-enter-active {
    animation: fade 0.2s;
  }
  
  .fade-modal-leave-active {
    animation: fade 0.2s reverse;
  }

  .loading-enter-active,
  .loading-leave-active {
    transition: opacity 0.2s ease;
  }

  .loading-enter-from,
  .loading-leave-to {
    opacity: 0;
  }

  .workshop {
    align-items: center;
    display: flex;
    font-family: 'Comfortaa-Bold';
    height: 100%;
    justify-content: center;
    left: 0;
    overflow: hidden;
    padding: 2.5em;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;

    /* Scrollbar */
    ::-webkit-scrollbar { height: 0.25em; width: 0.25em; }
    ::-webkit-scrollbar-track { background: rgba(#000000, 0.1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb { background: rgba(#FFFFFF, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(#FFFFFF, 1); border-radius: 99em; }

    .workshop__background {
      background-color: rgba(#000000, 0.5);
      height: inherit;
      left: 0;
      position: absolute;
      top: 0;
      width: inherit;
    }

    .workshop__container {
      animation: translateBackground 5s linear;
      animation-iteration-count: infinite;
      background-color: #9F00FF;
      background-image: url('/svg/background-stars-purple.svg');
      background-size: 8em;
      background-position: center;
      border-radius: 0.75em;
      box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
      display: flex;
      gap: 0.5em;
      height: 17.5em;
      padding: 0.5em;
      position: relative;
      width: 35em;

      ul {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        list-style: none;
        margin: 0;
        overflow-y: scroll;
        padding: 0 0.5em 0 0;
        scroll-padding: 2.5em 0;

        li {
          display: flex;
          font-size: 1em;
          gap: 0.5em;
          padding: 0;

          &:before {
            content: initial;
          }

          button {
            align-items: center;
            background-color: rgba(#000000, 0.1);
            border-width: 0;
            border-radius: 0.5em;
            color: #ffffff;
            cursor: pointer;
            display: flex;
            font-family: inherit;
            font-size: 1em;
            gap: 0.25em;
            height: 2em;
            justify-content: flex-start;
            outline: none;
            padding: 0.25em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            white-space: nowrap;
            
            &:first-of-type {
              flex-grow: 1;
              width: 100%;
            }

            &:nth-child(n+2) {
              background-color: rgba(#000000, 0.5);
            }

            &:hover,
            &.selected:hover {
              background-color: rgba(#000000, 0.25);
            }

            &.selected {
              background-color: rgba(#000000, 0.5);
            }

            img {
              box-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
              border-radius: 0.25em;
              height: 1.5em;
              object-fit: cover;
              width: 1.5em;
              visibility: hidden;

              &[src] {
                visibility: visible;
              }
            }

            span {
              font-size: 0.75em;
            }

            input[type="text"] {
              background-color: transparent;
              border-width: 0;
              color: inherit;
              padding: 0;
              text-shadow: inherit;
              font-family: inherit;
              font-size: 0.75em;
              width: 100%;

              &:focus {
                outline: none;

                + .accept {
                  display: block;
                }
              }
            }

            .accept {
              display: none;
            }
          }
        }
      }

      .workshop__types {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 9.75em;

        .workshop__types-header {
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
        }

        .workshop__types-list {
          .material-symbols-rounded {
            font-size: 1.5em;
          }
        }
      }

      .workshop__items {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 17em;

        .workshop__items-header {
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          padding-right: 0.75em;
          position: relative;

          .workshop__search { // <input>
            background-color: rgba(#000000, 0.1);
            border-width: 0;
            border-radius: 0.5em;
            color: inherit;
            height: 2em;
            font-family: inherit;
            outline: none;
            padding: 0.25em 2em 0.25em 2em;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 100%;

            &::placeholder {
              color: inherit;
              opacity: 0.5;
            }
          }

          button {
            align-items: center;
            background-color: transparent;
            border-width: 0;
            color: inherit;
            cursor: pointer;
            display: flex;
            font-size: 1em;
            height: 2em; 
            justify-content: center;
            outline: none;
            padding: 0;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 2em;

            &.search-icon {
              pointer-events: none;
              position: absolute;
              top: 0;
              left: 0;
            }
  
            &.clear-icon {
              position: absolute;
              top: 0;
              right: 0.75em;
            }
          }
        }

        .workshop__items-list {
          .material-symbols-rounded {
            font-size: 1.5em;
          }
        }
      }

      .workshop__info {
        display: flex;
        flex-direction: column;
        gap: 0.5em;
        height: 100%;
        width: 6.25em;

        .workshop__info-header {
          color: #ffffff;
          font-size: 1em;
          line-height: 2em;
          text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
        }

        .workshop__info-content {
          align-items: center;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 0.5em;
          justify-content: center;
          padding-bottom: 1em;
          position: relative;

          .workshop__info-thumbnail {
            background-color: rgba(#000000, 0.1);
            border-radius: 0.5em;
            display: flex;
            overflow: hidden;
            position: relative;
            width: 100%;

            img {
              animation: fadeIn 1s ease-out;
              animation-fill-mode: forwards;
              filter: contrast(1.25);
              height: 6.25em;
              object-fit: cover;
              position: relative;
              visibility: hidden;
              width: 6.25em;
              z-index: 0;

              &[src] {
                visibility: visible;
              }
            }

            label {
              background-color: #000000;
              border-radius: 99em;
              color: #ffffff;
              font-size: 1em;
              line-height: 1em;
              left: 50%;
              padding: 0 0.5em;
              position: absolute;
              top: 0;
              transform: translate(-50%, -50%);
              z-index: 2;

              span {
                font-size: 0.75em;
              }
            }

            button {
              background-color: #000000;
              bottom: initial;
              font-size: 0.75em;
              left: 0.5em;
              top: 0.5em;
              transform: initial;
              z-index: 2;
            }

            &:after {
              animation: slide 1s ease-out;
              animation-fill-mode: forwards;
              background-image: url('/svg/glass-overlay.svg');
              background-position: 0em 0em;
              background-size: 6.25em 6.25em;
              background-repeat: repeat-y;
              border-radius: 0.5em;
              content: '';
              display: block;
              height: 100%;
              left: 0;
              opacity: 0.25;
              pointer-events: none;
              position: absolute;
              top: 0;
              width: 100%;
              z-index: 1;
            }

            @keyframes slide {
              0% { background-position: 0em 0em; }
              100% { background-position: 0em 6.25em; }
            }

            @keyframes fadeIn {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
          }

          .workshop__info-details {
            background-color: rgba(#000000, 0.1);
            border-radius: 0.5em;
            color: #ffffff;
            flex-grow: 1;
            font-size: 1em;
            max-height: 6em;
            padding: 0.5em;
            position: relative;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 100%;
            word-wrap: break-word;

            textarea {
              background-color: transparent;
              border-width: 0;
              color: inherit;
              font-family: inherit;
              font-size: 0.75em;
              height: 100%;
              padding: 0;
              resize: none;
              text-shadow: inherit;
              width: 100%;

              &:focus {
                outline: none;

                + .accept {
                  display: block
                }
              }
            }

            .accept {
              bottom: 0;
              cursor: pointer;
              display: none;
              position: absolute;
              right: 0;
            }
          }

          button {
            align-items: center;
            background-color: #4CA9FF;
            border-radius: 99em;
            border-width: 0;
            bottom: -1.5em;
            box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
            color: #ffffff;
            cursor: pointer;
            display: flex;
            font-family: inherit;
            font-size: 1em;
            gap: 0.5em;
            height: 2em;
            left: 50%;
            outline: none;
            padding: 0.5em;
            position: absolute;
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            transform: translateX(-50%);
            white-space: nowrap;
            z-index: 2;
          }
        }
      }

      .workshop__loading {
        align-items: center;
        border-radius: inherit;
        height: 100%;
        display: flex;
        justify-content: center;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 3;
      }

      .workshop__close {
        align-items: center;
        background-color: #FFC24C;
        border-radius: 0.5em;
        box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
        color: #EB2B6D;
        cursor: pointer;
        display: flex;
        height: 2em;
        justify-content: center;
        position: absolute;
        right: 0;
        top: 0;
        transform: translate(50%, -50%);
        width: 2em;
        z-index: 2;
      }
    }
  }
</style>