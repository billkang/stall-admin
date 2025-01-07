<script lang="ts" setup>
import { Settings } from '@stall/icons';

import { StallIconButton } from '@stall-core/shadcn-ui';

import Preferences from './preferences.vue';

const emit = defineEmits<{ clearPreferencesAndLogout: [] }>();

function clearPreferencesAndLogout() {
  emit('clearPreferencesAndLogout');
}
</script>
<template>
  <Preferences @clear-preferences-and-logout="clearPreferencesAndLogout">
    <StallIconButton>
      <Settings class="text-foreground size-4" />
    </StallIconButton>
  </Preferences>
</template>
