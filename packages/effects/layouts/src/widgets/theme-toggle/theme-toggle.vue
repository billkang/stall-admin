<script lang="ts" setup>
import type { ThemeModeType } from '@stall/types';

import { MoonStar, Sun, SunMoon } from '@stall/icons';
import { $t } from '@stall/locales';
import {
  preferences,
  updatePreferences,
  usePreferences,
} from '@stall/preferences';

import {
  ToggleGroup,
  ToggleGroupItem,
  StallTooltip,
} from '@stall-core/shadcn-ui';

import ThemeButton from './theme-button.vue';

defineOptions({
  name: 'ThemeToggle',
});

withDefaults(defineProps<{ shouldOnHover?: boolean }>(), {
  shouldOnHover: false,
});

function handleChange(isDark: boolean) {
  updatePreferences({
    theme: { mode: isDark ? 'dark' : 'light' },
  });
}

const { isDark } = usePreferences();

const PRESETS = [
  {
    icon: Sun,
    name: 'light',
    title: $t('preferences.theme.light'),
  },
  {
    icon: MoonStar,
    name: 'dark',
    title: $t('preferences.theme.dark'),
  },
  {
    icon: SunMoon,
    name: 'auto',
    title: $t('preferences.followSystem'),
  },
];
</script>
<template>
  <div>
    <StallTooltip :disabled="!shouldOnHover" side="bottom">
      <template #trigger>
        <ThemeButton
          :model-value="isDark"
          type="icon"
          @update:model-value="handleChange"
        />
      </template>
      <ToggleGroup
        :model-value="preferences.theme.mode"
        class="gap-2"
        type="single"
        variant="outline"
        @update:model-value="
          (val) => updatePreferences({ theme: { mode: val as ThemeModeType } })
        "
      >
        <ToggleGroupItem
          v-for="item in PRESETS"
          :key="item.name"
          :value="item.name"
        >
          <component :is="item.icon" class="size-5" />
        </ToggleGroupItem>
      </ToggleGroup>
    </StallTooltip>
  </div>
</template>
