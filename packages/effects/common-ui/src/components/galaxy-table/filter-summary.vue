<template>
  <div v-if="visible" class="stall-galaxy-table-filter__summary">
    <div class="label">{{ t(`table.filter.summaryLabel`) }}</div>

    <Space class="tag-list">
      <Tag v-for="tag in tagList" :key="tag.key" closable @close="handleClose(tag)">
        {{ t(`table.filter.summaryTag`, tag.title, tag.value) }}
      </Tag>
    </Space>

    <div class="clear-all" @click="handleClear">{{ t(`table.filter.summaryClear`) }}</div>
  </div>
</template>

<script lang="ts">
import type { TableColumnData } from '../table/interface';
import { computed, defineComponent, PropType } from 'vue';
import Space from '../space';
import Tag from '../tag';
import { useI18n } from '../locale';
import { isArray, isValidValue } from '../_utils/is';
import { useTableSetting } from './hooks/useTableSetting';

type TagData = {
  key: string;
  title: string;
  value: string;
};

export default defineComponent({
  components: {
    Space,
    Tag,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    columns: {
      type: Array as PropType<TableColumnData[]>,
      required: true,
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const { formData, resetFormData, cleanFormDataByKey } = useTableSetting(props);
    const { t } = useI18n();

    const visible = computed(() => Object.values(formData).filter(val => isValidValue(val)).length > 0);
    const tagList = computed(() => {
      const tags: Array<TagData> = [];

      Object.entries(formData).forEach(d => {
        const [key, val] = d;
        if (isValidValue(val)) {
          const col = props.columns.find(c => c.dataIndex === key);
          if (col) {
            const { title, filterable } = col;
            const tagValue: string[] = [];

            if (filterable?.filters) {
              let list: any = val;
              if (!isArray(val)) {
                list = [val];
              }

              list.forEach((val: string) => {
                const item = filterable.filters!.find((d: any) => d.value === val);
                tagValue.push((item?.text as string) || `${val}`);
              });
            } else {
              if (isArray(val)) {
                tagValue.push(...val);
              } else {
                tagValue.push(`${val}`);
              }
            }

            if (tagValue?.length > 0) {
              tags.push({
                key,
                title: title as string,
                value: tagValue.join('、'),
              });
            }
          }
        }
      });

      return tags;
    });

    const handleClose = (tag: TagData) => {
      cleanFormDataByKey(tag.key);

      emit('search', formData);
    };

    const handleClear = () => {
      resetFormData();

      emit('search', formData);
    };

    return {
      t,
      visible,
      tagList,
      handleClose,
      handleClear,
    };
  },
});
</script>
