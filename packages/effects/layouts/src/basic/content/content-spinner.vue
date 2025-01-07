<script lang="ts" setup>
import { StallSpinner } from '@stall-core/shadcn-ui';

import { useContentSpinner } from './use-content-spinner';

defineOptions({ name: 'LayoutContentSpinner' });

const { spinning } = useContentSpinner();
</script>
<template>
  <StallSpinner :spinning="spinning" />
</template>
