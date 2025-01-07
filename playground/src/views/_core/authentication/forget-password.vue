<script lang="ts" setup>
import type { StallFormSchema } from '@stall/common-ui';

import { computed, ref } from 'vue';

import { AuthenticationForgetPassword, z } from '@stall/common-ui';
import { $t } from '@stall/locales';

defineOptions({ name: 'ForgetPassword' });

const loading = ref(false);

const formSchema = computed((): StallFormSchema[] => {
  return [
    {
      component: 'StallInput',
      componentProps: {
        placeholder: 'example@example.com',
      },
      fieldName: 'email',
      label: $t('authentication.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
  ];
});

function handleSubmit(value: Record<string, any>) {
  // eslint-disable-next-line no-console
  console.log('reset email:', value);
}
</script>

<template>
  <AuthenticationForgetPassword
    :form-schema="formSchema"
    :loading="loading"
    @submit="handleSubmit"
  />
</template>
