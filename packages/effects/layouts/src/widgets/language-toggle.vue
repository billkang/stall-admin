<script setup lang="ts">
import type { SupportedLanguagesType } from '@stall/locales';

import { SUPPORT_LANGUAGES } from '@stall/constants';
import { Languages } from '@stall/icons';
import { loadLocaleMessages } from '@stall/locales';
import { preferences, updatePreferences } from '@stall/preferences';

import { StallDropdownRadioMenu, StallIconButton } from '@stall-core/shadcn-ui';

defineOptions({
  name: 'LanguageToggle',
});

async function handleUpdate(value: string) {
  const locale = value as SupportedLanguagesType;
  updatePreferences({
    app: {
      locale,
    },
  });
  await loadLocaleMessages(locale);
}
</script>

<template>
  <div>
    <StallDropdownRadioMenu
      :menus="SUPPORT_LANGUAGES"
      :model-value="preferences.app.locale"
      @update:model-value="handleUpdate"
    >
      <StallIconButton>
        <Languages class="text-foreground size-4" />
      </StallIconButton>
    </StallDropdownRadioMenu>
  </div>
</template>
