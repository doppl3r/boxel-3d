<script setup>
  
</script>

<template>
  <div class="loader">
    <div class="loader__circle"></div>
  </div>
</template>

<style lang="scss" scoped>
  .loader {
    display: inline-block;
    
    .loader__circle {
      border: 0.5em solid rgba(#000000, 1);
      border-radius: 50%;
      border-top: 0.5em solid rgba(#FFCB4C, 1);
      width: 2em;
      height: 2em;
      animation: spin 2s ease-in-out infinite;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(720deg); }
  }
</style>