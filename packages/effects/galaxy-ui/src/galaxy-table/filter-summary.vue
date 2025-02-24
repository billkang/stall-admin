<template>
  <div v-if="visible" class="stall-galaxy-table-filter__summary">
    <div class="label">筛选结果</div>

    <Space class="tag-list">
      <Tag v-for="tag in tagList" :key="tag.key" closable @close="handleClose(tag)">
        包含
      </Tag>
    </Space>

    <div class="clear-all" @click="handleClear">清空条件</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { Space, Tag } from '@arco-design/web-vue';
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
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const { formData, resetFormData, cleanFormDataByKey } = useTableSetting(props);

    const visible = computed(() => Object.values(formData).filter(val => !!val).length > 0);
    const tagList = computed(() => {
      const tags: Array<TagData> = [];

      Object.entries(formData).forEach(d => {
        const [key, val] = d;
        if (!!val) {
          const col = props.columns.find(c => c.dataIndex === key);
          if (col) {
            const { title, filterable } = col;
            const tagValue: string[] = [];

            if (filterable?.filters) {
              let list: any = val;
              if (!Array.isArray(val)) {
                list = [val];
              }

              list.forEach((val: string) => {
                const item = filterable.filters!.find((d: any) => d.value === val);
                tagValue.push((item?.text as string) || `${val}`);
              });
            } else {
              if (Array.isArray(val)) {
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
      visible,
      tagList,
      handleClose,
      handleClear,
    };
  },
});
</script>
