<script setup>
  import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue';

  // Define items for carousel
  var props = defineProps(['items', 'selected']);
  var selectedItem = ref();

  function selectItem(item, e) {
    var el = getSelectedElement(e.target);
    selectedItem.value = item;
    window.dispatchEvent(new CustomEvent('itemSelected', { detail: item }));
    scrollToSelected(el);
  }

  function getSelectedElement(node) {
    if (node == null) return null;
    if (node.classList.contains('item')) return node;
    else return getSelectedElement(node.parentNode);
  }

  function scrollFromEvent(e) {
    var parent = getScrollParent(e.target);
    parent.scrollLeft += e.deltaX + e.deltaY; // All scroll events move horizontally
  }

  function getScrollParent(node) {
    // Recursively check parent node
    if (node == null) return null;
    if (node.scrollWidth > node.clientWidth) return node;
    else return getScrollParent(node.parentNode);
  }

  function scrollToSelected(el) {
    if (el == null) el = document.querySelector("[class*='selected']");
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  function isSelected(item) {
    return selectedItem.value.id == item.id;
  }
  
  function setDefaultItem() {
    if (props['selected']) selectedItem.value = props['selected'];
  }

  onBeforeMount(function() {
    setDefaultItem();
  });

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSelected();
  });

  onUnmounted(function() {
    
  });
</script>

<template>
  <div class="carousel" @wheel.passive="scrollFromEvent($event)">
    <template v-for="(item, key) of items">
      <div class="item" :class="{ 'selected': isSelected(item) }" :id="item.id" @click="selectItem(item, $event)">
        <img :src="item.url">
        <p class="title">{{ item.title }}</p>
      </div>
    </template>
  </div>
</template>