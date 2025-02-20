<script setup>
  import { ref } from 'vue';
  import Modal from './Modal.vue';
  import Loader from './Loader.vue';

  const defaultText = ref('<p>Thank you for playing Boxel 3D!</p>\n<p>Good luck beating the community levels lol</p>');
  const text = ref('');
  const isLoading = ref(true);

  function getNews() {
    return fetch('https://dopplercreative.com/wp-json/wp/v2/pages/3354?_fields=content,title')
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
        text.value = defaultText.value;
        isLoading.value = false;
      });
  }

  function onOpened(e) {
    // Only load the page once
    if (isLoading.value == true) {
      text.value = '';
      getNews();
    }
  }
</script>

<template>
  <Modal @before-enter="onOpened($el)">
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