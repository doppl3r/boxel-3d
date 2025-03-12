<script setup>
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Loader from './Loader.vue';
  
  // Initialize attributes
  const i18n = useI18n({ useScope: 'global' });
  const isElectronApp = ref(window.electron != undefined);
  const isLoading = ref(false);
  const itemTypes = ref([
    { title: 'Subscriptions', id: 'subscriptions' },
    { title: 'Creations', id: 'creations' }
  ]);
  const itemsSubscriptions = ref([]);
  const itemsCreations = ref([]);
  const selectedItemType = ref(itemTypes.value[0]);
  const selectedItem = ref({});
  const search = ref('');
  const filteredItems = computed(() => {
    const items = selectedItemType.value.id == 'subscriptions' ? itemsSubscriptions : itemsCreations;
    
    // Evaluate true if any object value matches
    return items.value.filter(item => Object.values(item).some(val => val?.toString().toLowerCase().includes(search.value.toLowerCase())))
  });

  function clearSearch() {
    search.value = '';
  }

  function selectItemType(type) {
    selectedItemType.value = type;

    if (selectedItemType.value.id == 'subscriptions') {
      getSubscriptions();
    }
    else {
      getCreations();
    }
  }

  function selectItem(item) {
    // Set new selected item value
    selectedItem.value = item;
  }

  function openLink(url, target = '_self') {
    if (isElectronApp.value == true) {
      window.electron.client.overlay.activateToWebPage(url);
    }
    else {
      window.open(url, target);
    }
  }

  async function getSubscriptions() {
    isLoading.value = true;
    if (isElectronApp.value == true) {
      // Get array of item ids
      const itemIds = window.electron.client.workshop.getSubscribedItems();

      if (itemIds.length > 0) {
        // Get array of item objects
        const data = await window.electron.client.workshop.getItems(itemIds);
        const items = data.items;
        itemsSubscriptions.value = items;
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
      const data = await window.electron.client.workshop.getUserItems(1, appOwner.accountId, 0, 13, 0, { creator: appId });
      const items = data.items;
      itemsCreations.value = items;
    }
    isLoading.value = false;
  }

  function createItem() {
    
  }

  async function selectContent(item) {
    const data = await electron.dialog({
      properties: ['openFile'],
      filters: [{ 'name': 'Level File', 'extensions': ['json'] }]
    });

    // Update if data is not canceled
    if (data.canceled == false) {
      // title, description, changeNote, previewPath, contentPath, tags, visibility
      const results = await window.electron.client.workshop.updateItem(item.publishedFileId, {
        contentPath: data.filePaths[0]
      });

      console.log(results)
    }
  }

  function loadModal() {
    getSubscriptions();
  }
</script>

<template>
  <Transition name="fade-modal" @before-enter="loadModal">
    <div class="modal workshop">
      <div class="workshop__background" @click="$emit('close')"></div>
      <div class="workshop__container">
        <div class="workshop__types">
          <div class="workshop__types-header">Workshop</div>
          <ul class="workshop__types-list">
            <template v-for="itemType in itemTypes" :key="itemType.id">
              <li>
                <button :class="{ selected: selectedItemType == itemType }" @click="selectItemType(itemType)">
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
          <ul class="workshop__items-list">
            <li>
              <button v-if="selectedItemType.id == 'subscriptions'" @click="openLink('https://steamcommunity.com/workshop/browse/?appid=3208440', '_blank')">
                <span class="material-symbols-rounded">open_in_new</span>
                <span>Add Subscription</span>
              </button>
              <template v-else-if="selectedItemType.id == 'creations'">
                <button v-if="isElectronApp == true" @click="createItem()">
                  <span class="material-symbols-rounded">add</span>
                  <span>Add Creation</span>
                </button>
                <button v-else @click="openLink('https://store.steampowered.com/app/3208440/Boxel_3D/', '_blank')">
                  <span class="material-symbols-rounded">warning</span>
                  <span>Only available on Steam</span>
                </button>
              </template>
            </li>
            <li v-for="item in filteredItems" :key="item.title">
              <button :class="{ selected: selectedItem == item }" @click="selectItem(item)">
                <img :src="item.thumbnail" :alt="item.title" />
                <span>{{ item.title }}</span>
              </button>
              <button v-if="selectedItemType.id == 'creations'" @click="selectContent(item)" title="Upload content">
                <span class="material-symbols-rounded">folder_open</span>
              </button>
            </li>
          </ul>
        </div>
        <div class="workshop__info">
          <div class="workshop__info-header">{{ i18n.t('popup.text.info') }}</div>
          <div class="workshop__info-content">
            <div class="workshop__info-thumbnail" :key="selectedItem.title">
              <img :src="selectedItem.thumbnail" :alt="selectedItem.description" />
              <label v-if="selectedItem.label">
                <span>{{ selectedItem.label }}</span>
              </label>
            </div>
            <div class="workshop__info-details">
              <ul>
                <li>
                  <span>{{ selectedItem.description }}</span>
                </li>
              </ul>
            </div>
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
    transition: opacity 1s ease;
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

            &:hover {
              background-color: rgba(#000000, 0.25);
            }

            &.selected {
              background-color: rgba(#000000, 0.5);
            }

            img {
              box-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
              border-radius: 0.25em;
              height: 1.5em;
              width: 1.5em;
              visibility: hidden

              [src] {
                visibility: visible;
              }
            }

            span {
              font-size: 0.75em;
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

          .score {
            align-items: center;
            display: flex;
            margin-left: auto;
            text-align: left;
            flex-basis: 5em;
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
            box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
            display: flex;
            position: relative;
            width: 100%;

            img {
              animation: fadeIn 1s ease-out;
              animation-fill-mode: forwards;
              filter: contrast(1.25);
              height: 6.25em;
              position: relative;
              visibility: hidden;
              width: 6.25em;
              z-index: 0;

              [src] {
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
            text-shadow: 0em 0.125em 0em rgba(#000000, 0.25);
            width: 100%;
            word-wrap: break-word;

            ul {
              overflow-x: hidden;
              overflow-y: auto;

              li {
                line-height: 0.75em;
                
                &.links {
                  align-items: center;
                  display: flex;
                  flex-wrap: wrap;
                  gap: 0.25em;
                }

                a {
                  background-color: rgba(#000000, 0.1);
                  border-radius: 0.25em;
                  padding: 0.25em;

                  &:hover {
                    background-color: rgba(#000000, 0.2);
                  }

                  span {
                    font-size: 1em;
                  }
                }

                span {
                  font-size: 0.75em;
                }
              }
            }
          }
        }
      }

      .workshop__loading {
        align-items: center;
        background-color: rgba(#9F00FF, 0.5);
        height: 100%;
        display: flex;
        justify-content: center;
        left: 0;
        position: absolute;
        top: 0;
        width: 100%;
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
      }
    }
  }
</style>