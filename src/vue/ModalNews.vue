<script setup>
  import { ref } from 'vue';
  import Modal from './Modal.vue';
  import Loader from './Loader.vue';

  const text = ref('');
  const isLoading = ref(true);

  function getNews() {
    fetch('https://dopplercreative.com/wp-json/wp/v2/pages/3354?_fields=content,title')
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json(); 
      })
      .then(data => {
        text.value = data.content.rendered;
        isLoading.value = false;
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        text.value = '<p>All caught up! Check back in tomorrow 😄</p>';
        isLoading.value = false;
      });
  }

  function updateModal(el) {
    // Only load the page once
    if (isLoading.value == true) {
      getNews();
    }
  }
</script>

<template>
  <Modal @before-enter="updateModal($el)" class="news">
    <template #title>
      News & Events
    </template>
    
    <template #text>
      <Loader v-if="isLoading" />
      <div v-else v-html="text"></div>
    </template>

    <template #buttons>
      <button @click="$emit('close')">Close</button>
    </template>
  </Modal>
</template>

<style lang="scss" scoped>
  
</style>