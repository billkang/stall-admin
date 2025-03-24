<script lang="ts" setup>
// import { defineSDKProductTable } from '@stall-jssdk/components';
import { defineSDKMemberSelector } from '@stall-jssdk/components';

import '@stall-jssdk/components/dist/jssdk.css';

// defineSDKProductTable();
defineSDKMemberSelector();
</script>

<template>
  <!-- <stall-jssdk-product-table></stall-jssdk-product-table> -->
  <stall-jssdk-member-selector></stall-jssdk-member-selector>
</template>
