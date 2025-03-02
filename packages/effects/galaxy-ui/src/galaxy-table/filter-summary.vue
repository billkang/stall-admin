<template>
  <div v-if="visible" class="stall-galaxy-table-filter__summary">
    <!-- 筛选结果标题 -->
    <div class="label">筛选结果</div>

    <!-- 筛选条件标签列表 -->
    <Space class="tag-list">
      <Tag
        v-for="tag in tagList"
        :key="tag.key"
        closable
        @close="handleClose(tag)">
        {{ tag.title }} 包含 "{{ tag.value }}"
      </Tag>
    </Space>

    <!-- 清空条件按钮 -->
    <div class="clear-all" @click="handleClear">清空条件</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import { Space, Tag } from '@arco-design/web-vue';
import { useTableSetting } from './hooks/useTableSetting';

// 定义标签数据类型
type TagData = {
  key: string;       // 标签的唯一标识
  title: string;     // 标签的标题
  value: string;     // 标签的值
};

export default defineComponent({
  components: {
    Space,
    Tag,
  },
  props: {
    uuid: {
      type: String,
      required: true, // 必须传入 uuid
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true, // 必须传入列配置
    },
  },
  emits: ['search'], // 定义组件触发的事件
  setup(props, { emit }) {
    // 获取表单数据和相关方法
    const { formData, resetFormData, cleanFormDataByKey } = useTableSetting(props);

    // 计算属性：判断是否显示筛选结果
    const visible = computed(() => Object.values(formData).filter(val => !!val).length > 0);

    // 计算属性：筛选条件的标签列表
    const tagList = computed(() => {
      const tags: Array<TagData> = [];

      // 遍历表单数据
      Object.entries(formData).forEach(d => {
        const [key, val] = d;
        if (!!val) { // 如果值存在
          const col = props.columns.find(c => c.dataIndex === key); // 找到对应的列配置
          if (col) {
            const { title, filterable } = col;

            const tagValue: string[] = [];

            // 如果有筛选条件的 filters 配置
            if (filterable?.filters) {
              let list: any = val;
              if (!Array.isArray(val)) {
                list = [val]; // 如果值不是数组，则转换为数组
              }

              // 遍历筛选值
              list.forEach((val: string) => {
                const item = filterable.filters!.find((d: any) => d.value === val); // 找到对应的筛选项
                tagValue.push((item?.text as string) || `${val}`); // 获取筛选项的文本或值
              });
            } else {
              // 如果没有 filters 配置
              if (Array.isArray(val)) {
                tagValue.push(...val); // 将数组值添加到 tagValue
              } else {
                tagValue.push(`${val}`); // 将值转换为字符串添加到 tagValue
              }
            }

            if (tagValue?.length > 0) { // 如果 tagValue 不为空
              tags.push({
                key,
                title: title as string,
                value: tagValue.join('、'), // 将多个值用“、”连接
              });
            }
          }
        }
      });

      return tags;
    });

    // 关闭单个标签
    const handleClose = (tag: TagData) => {
      cleanFormDataByKey(tag.key); // 清空对应的表单数据
      emit('search', formData); // 触发 search 事件
    };

    // 清空所有筛选条件
    const handleClear = () => {
      resetFormData(); // 重置表单数据
      emit('search', formData); // 触发 search 事件
    };

    return {
      visible,       // 是否显示筛选结果
      tagList,       // 标签列表
      handleClose,   // 关闭单个标签的方法
      handleClear,   // 清空所有筛选条件的方法
    };
  },
});
</script>
