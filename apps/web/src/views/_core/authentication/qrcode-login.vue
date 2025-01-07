<script lang="ts" setup>
import { AuthenticationQrCodeLogin } from '@stall/common-ui';
import { LOGIN_PATH } from '@stall/constants';

defineOptions({ name: 'QrCodeLogin' });
</script>

<template>
  <AuthenticationQrCodeLogin :login-path="LOGIN_PATH" />
</template>
