<script setup>
  
</script>

<template>
  <Transition name="fade-modal">
    <div class="modal">
      <div class="background" @click="$emit('close')"></div>
      <div class="container">
        <div class="content">
          <slot></slot>
          <div class="title">
            <slot name="title"></slot>
          </div>
          <div class="text">
            <slot name="text"></slot>
          </div>
          <div class="buttons">
            <slot name="buttons"></slot>
          </div>
        </div>
        <a class="close" @click="$emit('close')">
          <span>x</span>
        </a>
      </div>
    </div>
  </Transition>
</template>
<style lang="scss" scoped>
  // Modal fade transition
  .fade-modal-enter-active {
    animation: fade 0.2s;

    .container {
      animation: twist 0.2s;
    }
  }
  
  .fade-modal-leave-active {
    animation: fade 0.2s reverse;

    .container {
      animation: twist 0.2s reverse;
    }
  }

  // Animations
  @keyframes translateBackground { 0% { background-position: 0em 0em; } 100% { background-position: -8em -8em; } }
  @keyframes grow { 0% { transform: scale(1); } 50% { transform: scale(1.20); } 100% { transform: scale(1); } }
  @keyframes shake { 0% { transform: rotate(0); } 33% { transform: rotate(10deg); } 66% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }
  @keyframes fade { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes twist { 0% { opacity: 0; transform: rotate(15deg) scale(0.75); } 100% { opacity: 1; transform: rotate(0deg) scale(1); } }

  .modal {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5em;
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;

    /* Scrollbar */
    ::-webkit-scrollbar { width: 0.25em; }
    ::-webkit-scrollbar-track { background: rgba(#000000, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb { background: rgba(#FFCB4C, 1); border-radius: 99em; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(#ffffff, 1); border-radius: 99em; }

    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .container {
      display: flex;
      max-height: 100%;
      position: relative;
      width: 22.5em; // 360px      

      .content {
        align-items: center;
        animation: translateBackground 5s linear;
        animation-iteration-count: infinite;
        background-color: #FFCB4C;
        background-image: url('/svg/background-stars-purple.svg');
        background-size: 8em;
        background-position: center;
        border-radius: 1em;
        border: 0 solid #000000;
        box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 1em 1em 2em;
        position: relative;

        .title {
          background-color: #000000;
          border-radius: 99em;
          color: #ffffff;
          font-size: 1.5em;
          line-height: 1.5em;
          margin: 0 auto 1em;
          padding: 0.25em 1em;
        }
        
        .text {
          color: #ffffff;
          font-size: 1.25em;
          line-height: 1.25em;
          margin: 0;
          max-height: 8em;
          overflow-y: auto;
          padding-bottom: 0.5em;
          text-align: center;
          text-shadow: 0 0.125em 0 #000000;
          width: 100%;

          :deep(h1),
          :deep(h2),
          :deep(h3),
          :deep(h4),
          :deep(h5),
          :deep(h6),
          :deep(p) {
            font-size: inherit;
            margin: 0 0 1em;
          }

          :deep(a) {
            color: #ffcb4c;
            text-decoration: none;

            &:after {
              content: '\e5c8';
              font-family: "Material Symbols Rounded";
              font-size: 1.5em;
              vertical-align: middle;
            }
          }

          :deep(strong) {
            color: #ffcb4c;
          }
        }
  
        .buttons {
          position: absolute;
          display: flex;
          column-gap: 0.5em;
          bottom: 0;
          left: 50%;
          transform: translate(-50%, 50%);
        }

        :deep(button),
        :deep(.button) {
          background-color: #F52D59;
          border-width: 0;
          border-radius: 99em;
          box-shadow: 0em 0.25em 0em rgba(#000000, 0.25);
          color: #000000;
          cursor: pointer;
          font-family: inherit;
          padding: 0.5em 1em;

          &:hover {
            animation: shake 0.25s ease-in-out;
            animation-fill-mode: forwards;
          }

          &:last-of-type {
            background-color: #FFCB4C;
            margin: 0;
          }
        }
      }

      .close {
        background-color: #FFCB4C;
        border-radius: 99em;
        border: 0 solid #000000;
        box-shadow: 0em 0.25em 0em #000000;
        color: #000000;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 2em;
        width: 2em;
        position: absolute;
        top: 0;
        right: 0;
        margin: -1em -1em 0em 0em;

        &:hover {
          animation: grow 0.25s ease-in-out;
          animation-fill-mode: forwards;
        }
      }
    }
  }
</style>