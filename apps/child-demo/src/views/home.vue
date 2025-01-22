<script lang="ts">
import { defineComponent } from 'vue';

import HelloWorld from '../components/HelloWorld.vue';

const logoPath = new URL('../assets/logo.png', import.meta.url).href;

export default defineComponent({
  name: 'Home',
  components: {
    HelloWorld,
  },
  setup() {
    return { logoPath };
  },
});
</script>

<template>
  <div>
    <img class="img" alt="Vue logo" :src="logoPath" />
    <HelloWorld msg="子应用 -- Vite+Vue@3.x" />
  </div>
</template>

<style>
.img {
  margin: 0 auto;
}
</style>
