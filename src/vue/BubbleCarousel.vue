<script setup>
  import { onMounted, onUnmounted, ref, toRef } from 'vue';

  // Define items for carousel
  var props = defineProps({ items: Object });
  var selectedItem = ref();

  function selectItem(item, e) {
    var el = getSelectedItem(e.target);
    if (selectedItem.value) selectedItem.value.selected = false
    selectedItem.value = item;
    selectedItem.value.selected = true;
    window.dispatchEvent(new CustomEvent('itemSelected', { detail: item }));
    scrollToSelected(el);
  }

  function getSelectedItem(node) {
    if (node == null) return null;
    if (node.classList.contains('item')) return node;
    else return getSelectedItem(node.parentNode);
  }

  function scrollFromEvent(e) {
    var parent = getScrollParent(e.target);
    parent.scrollLeft += e.deltaX + e.deltaY;
  }

  function getScrollParent(node) {
    if (node == null) return null;
    if (node.scrollWidth > node.clientWidth) return node;
    else return getScrollParent(node.parentNode);
  }

  function scrollToSelected(el) {
    if (el == null) el = document.querySelector("[class*='selected']");
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  // Run function after being mounted (visible)
  onMounted(function() {
    scrollToSelected();
  });

  onUnmounted(function() {
    
  })
</script>

<template>
  <div class="carousel" @wheel="scrollFromEvent($event)">
    <template v-for="(item, key) of items">
      <div class="item" :class="{ selected: item.selected == true }" :id="item.id" @click="selectItem(item, $event)">
        <img :src="item.url">
        <p class="text">{{ item.title }}</p>
      </div>
    </template>
  </div>
</template>