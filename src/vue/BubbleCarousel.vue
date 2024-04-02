<script setup>
  import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';

  // Define items for carousel
  var props = defineProps(['items', 'selected']);
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
    scrollToSelected(el);
    selectedItem.value = item;
    window.dispatchEvent(new CustomEvent('itemSelected', { detail: item }));
  }

  function selectNext() {
    var el = document.querySelector("[class*='selected']");
    if (el && el.nextElementSibling) el.nextElementSibling.click();
  }

  function selectPrev() {
    var el = document.querySelector("[class*='selected']");
    if (el && el.previousElementSibling) el.previousElementSibling.click();
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

  function scrollToSelected(el) {
    if (el == null) el = document.querySelector("[class*='selected']");
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function isSelected(item) {
    if (item.title == null || selectedItem.value == null) return false;
    return selectedItem.value.title == item.title;
  }
  
  function setDefaultItem() {
    if (props['selected']) selectedItem.value = props['selected'];
  }

  function keydown(e) {
    if (e.code == 'KeyA' || e.code == 'ArrowLeft') {
      selectPrev();
    }
    else if (e.code == 'KeyD' || e.code == 'ArrowRight') {
      selectNext();
    }
  }

  onBeforeMount(function() {
    setDefaultItem();
  });

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSelected();
    addEventListeners();
  });

  onUnmounted(function() {
    removeEventListeners();
  });
</script>

<template>
  <div class="carousel" @wheel.passive="scrollFromEvent($event)">
    <template v-for="(item, key) of items">
      <div class="item" :class="{ 'selected': isSelected(item) }" @click="selectItem(item, $event)">
        <img :src="item.url">
        <p class="title">{{ item.title }}</p>
      </div>
    </template>
  </div>
</template>