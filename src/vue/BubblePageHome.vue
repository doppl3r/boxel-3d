<script setup>
  import { onMounted } from 'vue';
  import BubbleButtonSettings from './BubbleButtonSettings.vue';
  
  // Run function after being mounted (visible)
  onMounted(function() {
    
  });
</script>

<template>
  <div class="page">
    <div class="background">
      <img src="/img/svg/background-purple.svg">
    </div>
    <div class="nav">
      <BubbleButtonSettings class="button square right" />
    </div>
    <div class="content">
      <h1>BOXEL3D</h1>
      <p>Now includes free cookies!</p>
      <div class="carousel">
        <div class="item">
          <img src="/img/svg/button-skins.svg">
          <p class="text">Skins</p>
        </div>
        <div class="item">
          <img src="/img/svg/button-level-editor.svg">
          <p class="text">Level Editor</p>
        </div>
        <div class="item">
          <img src="/img/svg/button-play.svg">
          <p class="text">Play</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <a class="button wide right">
        <span class="material-symbols-rounded blue">sms</span>
        Write a review
      </a>
    </div>
  </div>
</template>