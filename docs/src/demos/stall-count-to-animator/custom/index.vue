<script lang="ts" setup>
import { StallCountToAnimator } from '@stall/common-ui';
</script>
<template>
  <StallCountToAnimator
    :duration="3000"
    :end-val="2000000"
    :start-val="1"
    prefix="$"
    separator="/"
  />
</template>
