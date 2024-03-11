<script setup>
  import { ref } from 'vue';
</script>

<template>
  <div class="level-manager hidden">
    <div class="row top">
      <div class="col">
        <a class="item" action="add-level" title="Add level"><img src="/img/svg/add.svg"></a>
        <a class="item" action="download" title="Download level"><img src="/img/svg/download.svg"></a>
        <a class="item" action="exit-to-home" title="Exit level manager (ESC)"><img src="/img/svg/home.svg"></a>
        <a class="item" action="settings" title="Settings"><img src="/img/svg/gear.svg"></a>
      </div>
    </div>
    <div class="row left">
      <div class="col list"></div>
    </div>
  </div>
</template>