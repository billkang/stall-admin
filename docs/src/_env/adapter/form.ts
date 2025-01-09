import type {
  StallFormSchema as FormSchema,
  StallFormProps,
} from '@stall/common-ui';

import type { ComponentType } from './component';

import { setupStallForm, useStallForm as useForm, z } from '@stall/common-ui';
import { $t } from '@stall/locales';

import { initComponentAdapter } from './component';

initComponentAdapter();
setupStallForm<ComponentType>({
  config: {
    baseModelPropName: 'value',
    emptyStateValue: null,
    modelPropNameMap: {
      Checkbox: 'checked',
      Radio: 'checked',
      Switch: 'checked',
      Upload: 'fileList',
    },
  },
  defineRules: {
    required: (value, _params, ctx) => {
      if (value === undefined || value === null || value.length === 0) {
        return $t('ui.formRules.required', [ctx.label]);
      }
      return true;
    },
    selectRequired: (value, _params, ctx) => {
      if (value === undefined || value === null) {
        return $t('ui.formRules.selectRequired', [ctx.label]);
      }
      return true;
    },
  },
});

const useStallForm = useForm<ComponentType>;

export { useStallForm, z };

export type StallFormSchema = FormSchema<ComponentType>;
export type { StallFormProps };
