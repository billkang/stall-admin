<script lang="ts" setup>
import { defineSDKProductTable } from '@stall-jssdk/components';
import { initContext } from '@stall-jssdk/core';
// import { defineSDKMemberSelector } from '@stall-jssdk/components';

import '@stall-jssdk/components/dist/jssdk.css';

initContext({
  CORE_ACCESS: 'stall-web-play-1.0.0-dev-core-access',
});

defineSDKProductTable();
// defineSDKMemberSelector();
</script>

<template>
  <div class="jssdk-example">
    <stall-jssdk-product-table />
    <!-- <stall-jssdk-member-selector></stall-jssdk-member-selector> -->
  </div>
</template>

<style lang="less" scoped>
.jssdk-example {
  padding: 20px;
  color: blue;
}
</style>
