<script setup lang="ts">
import { inject } from 'vue';

import { useScrollLock } from '@stall-core/composables';

useScrollLock();
const id = inject('DISMISSABLE_DRAWER_ID');
</script>
<template>
  <div :data-dismissable-drawer="id" class="bg-overlay inset-0"></div>
</template>
