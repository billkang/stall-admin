<script lang="ts" setup>
import {
  defineSDKFileUploader,
  defineSDKFileUploaderWorker,
} from '@stall-jssdk/components';

defineSDKFileUploader();
defineSDKFileUploaderWorker();
</script>

<template>
  <stall-jssdk-file-uploader />
  <!-- <stall-jssdk-file-uploader-worker /> -->
</template>
