<script setup>
  import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';

  // Define items for carousel
  const props = defineProps({
    hideLabel: Boolean,
    hideTag: Boolean,
    hideTitle: Boolean,
    hideSubtitle: Boolean,
    items: Object,
    selected: Object,
  });
  var selectedItem = ref();

  // Add event listener(s)
  function addEventListeners() {
    window.addEventListener('keydown', keydown);
  }
  
  // Remove event listeners
  function removeEventListeners() {
    window.removeEventListener('keydown', keydown);
  }

  function selectItem(item, e) {
    var el = getSelectedElement(e.target);
    var behavior = e.isTrusted ? 'smooth' : 'instant'; // Keyboard "click" = "not trusted"
    scrollToSelected(el, behavior);

    // Keep the last playable item selected for non-level tiles (for example: "Add").
    if (item?.title != null) selectedItem.value = item;

    window.dispatchEvent(new CustomEvent('itemSelected', { detail: item }));

    // Play click sound
    app.assets.audio.play('click');
  }

  function selectNext() {
    var el = document.querySelector(".item[class*='selected']");
    var next = getPlayableSibling(el, 'next');
    if (next) next.click();
  }

  function selectPrev() {
    var el = document.querySelector(".item[class*='selected']");
    var prev = getPlayableSibling(el, 'previous');
    if (prev) prev.click();
  }

  function getPlayableSibling(el, direction) {
    if (el == null) return null;

    var node = direction == 'next' ? el.nextElementSibling : el.previousElementSibling;
    while (node) {
      if (node.classList && node.classList.contains('item') && !node.classList.contains('add-button')) {
        return node;
      }
      node = direction == 'next' ? node.nextElementSibling : node.previousElementSibling;
    }

    return null;
  }

  function getSelectedElement(node) {
    if (node == null) return null;
    if (node.classList.contains('item')) return node;
    else return getSelectedElement(node.parentNode);
  }

  function scrollFromEvent(e) {
    var parent = getScrollParent(e.target);
    if (parent) parent.scrollLeft += e.deltaX + e.deltaY; // All scroll events move horizontally
  }

  function getScrollParent(node) {
    // Recursively check parent node
    if (node == null) return null;
    if (node.scrollWidth > node.clientWidth) return node;
    else return getScrollParent(node.parentNode);
  }

  function scrollToSelected(el, behavior = 'smooth') {
    if (el == null) el = document.querySelector("[class*='selected']");
    if (el) el.scrollIntoView({ behavior: behavior, block: 'nearest', inline: 'center' });
  }

  function isSelected(item) {
    if (item.title == null || selectedItem.value == null) return false;
    return selectedItem.value.title == item.title;
  }
  
  function setDefaultItem() {
    if (props['selected']) selectedItem.value = props['selected'];
  }

  function keydown(e) {
    // Ignore events from inputs
    if (e.target.value == null) {
      if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
        selectPrev();
      }
      else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
        selectNext();
      }
    }
  }

  onBeforeMount(function() {
    setDefaultItem();
  });

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSelected(null, 'instant');
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="carousel" @wheel.passive="scrollFromEvent($event)">
    <template v-for="(item, key) of items">
      <div class="item" :class="[{ 'selected': isSelected(item) }, item.class]" @click="selectItem(item, $event)">
        <div class="thumbnail">
          <img :src="item.url">
          <div v-if="item.overlay" class="overlay"></div>
          <div class="label" v-if="hideLabel != true && item.label" v-html="item.label"></div>
          <div class="title" v-if="hideTitle != true" v-html="item.description || item.title"></div>
          <div class="tag" v-if="hideTag != true && item.tag">
            <div v-html="item.tag"></div>
          </div>
        </div>
        <div class="subtitle" v-if="hideSubtitle != true">
          <span v-html="item.subtitle"></span>
        </div>
      </div>
    </template>
  </div>
</template>