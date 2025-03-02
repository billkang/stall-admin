<template>
  <div
    class="stall-galaxy-table-filter__input-search"
    :class="{ 'focused-filter': focusedFilter === 'inputSearch' }"
  >
    <!-- 输入框 -->
    <Input
      v-if="visible"
      v-model="formData[column.dataIndex]"
      placeholder="请输入"
      allow-clear
      @clear="handleClear"
      @press-enter="handleSearch"
    >
      <!-- 输入框前缀图标 -->
      <template #prefix>
        <IconSearch />
      </template>
    </Input>
    <!-- 搜索图标（当输入框隐藏时显示） -->
    <div
      class="icon-search-wrapper"
      v-else
      @click.stop="handleClickInputSearch"
    >
      <IconSearch class="icon-search" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType, ref, onMounted, onBeforeUnmount } from 'vue';
import { Input } from '@arco-design/web-vue';
import { IconSearch } from '@arco-design/web-vue/es/icon';
import { useTableSetting } from './hooks/useTableSetting';
import { recursiveCheckNodeClass } from './utils';
import { useTable } from './hooks/useTable';

export default defineComponent({
  // 注册组件
  components: {
    Input,
    IconSearch,
  },
  // 定义组件的 props
  props: {
    uuid: {
      type: String,
      required: true, // 必须传入
    },
    column: {
      type: Object as PropType<any>,
      required: true, // 必须传入
    },
    expand: {
      type: Boolean,
      default: false, // 默认值为 false
    },
  },
  // 定义组件的事件
  emits: ['search'],
  setup(props, { emit }) {
    // 获取表格设置的表单数据
    const { formData } = useTableSetting(props);
    // 获取表格的聚焦过滤器状态和相关方法
    const { focusedFilter, handleClickFilter, handleClearFocusedFilter } = useTable({ props, emit });

    // 定义输入框是否可见
    const visible = ref<boolean>(props.expand);

    // 点击搜索图标时显示输入框
    const handleClickInputSearch = () => {
      visible.value = true; // 显示输入框
      handleClickFilter('inputSearch'); // 触发聚焦过滤器事件
    };

    // 点击外部区域时关闭输入框
    const handleToggleVisible = (e: Event) => {
      if (!props.expand) {
        // 检查点击的元素是否属于当前组件
        const found = recursiveCheckNodeClass(e.target as any, 'stall-galaxy-table-filter__input-search');
        if (!found) {
          visible.value = false; // 隐藏输入框
        }
      }
    };

    // 组件挂载时
    onMounted(() => {
      handleClearFocusedFilter(); // 清空聚焦过滤器
      window.addEventListener('click', handleToggleVisible, false); // 添加全局点击事件监听
    });

    // 组件卸载时
    onBeforeUnmount(() => {
      window.removeEventListener('click', handleToggleVisible, false); // 移除全局点击事件监听
    });

    // 清空输入框内容
    const handleClear = () => {
      formData[props.column.dataIndex] = null; // 清空对应列的表单数据
      emit('search', formData); // 触发搜索事件
    };

    // 搜索事件
    const handleSearch = () => {
      emit('search', formData); // 触发搜索事件
    };

    // 返回组件的逻辑
    return {
      visible, // 输入框是否可见
      formData, // 表单数据
      focusedFilter, // 聚焦过滤器状态
      handleClear, // 清空输入框方法
      handleSearch, // 搜索方法
      handleClickInputSearch, // 点击搜索图标方法
      handleClickFilter, // 点击过滤器方法
      handleClearFocusedFilter, // 清空聚焦过滤器方法
    };
  },
});
</script>
