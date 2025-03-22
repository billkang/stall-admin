<template>
  <Dropdown
    :popup-visible="isOpenOverlay"
    position="bottom"
    trigger="click"
    @click.stop="handleToggle"
    @popup-visible-change="handlePopupVisibleChange">
    <!-- 触发器内容 -->
    <div
      class="flex stall-galaxy-table-filter__more-filter"
      :class="{ 'focused-filter': focusedFilter === 'moreFilter' }">
      <!-- 图标 -->
      <IconAlignCenter />

      <!-- 标题 -->
      <div class="dropdown-title">
        更多筛选
        <!-- 筛选数量 -->
        <span v-if="filterCount > 0" class="filter-count">{{ filterCount }}</span>
      </div>

      <!-- 箭头图标 -->
      <IconUp v-if="isOpenOverlay" />
      <IconDown v-else />
    </div>

    <!-- 弹出内容 -->
    <template #content>
      <div class="stall-galaxy-table-filter__more-filter-overlay">
        <!-- 表单 -->
        <Form :model="formData" layout="vertical" class="stall-dropdown-menu">
          <!-- 表单项 -->
          <FormItem
            :class="{ 'grid-rang-picker': column.filterable?.componentType === 'rang-picker' }"
            v-for="column in filterableColumns"
            :key="column.dataIndex"
            :name="column.dataIndex"
            :label="`${column.title || ''}`"
            label-col-flex="30px">
              <!-- 根据 componentType 渲染不同组件 -->
              <template v-if="column.filterable?.componentType">
                <Input
                  v-if="column.filterable.componentType === 'input'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear />
                <DatePicker
                  v-else-if="column.filterable.componentType === 'date-picker'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear />
                <TimePicker
                  v-else-if="column.filterable.componentType === 'time-picker'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear />
                <RangePicker
                  v-else-if="column.filterable.componentType === 'rang-picker'"
                  v-model="formData[column.dataIndex!]"
                  :time-picker-props="{
                    defaultValue: ['00:00:00', '00:00:00'],
                  }"
                  showTime
                  allow-clear />
                <Select
                  v-else-if="column.filterable?.filters"
                  v-model="formData[column.dataIndex!]"
                  :multiple="column.filterable.multiple === true"
                  allowClear>
                  <SelectOption v-for="opt in column.filterable.filters" :value="opt.value" :key="opt.value">
                    {{ opt.text }}
                  </SelectOption>
                </Select>
              </template>
              <!-- 兼容没有设置 componentType 的情况 -->
              <template v-else-if="column.filterable?.filters">
                <Select
                  v-model="formData[column.dataIndex!]"
                  :multiple="column.filterable.multiple === true"
                  allowClear>
                  <SelectOption v-for="opt in column.filterable.filters" :value="opt.value" :key="opt.value">
                    {{ opt.text }}
                  </SelectOption>
                </Select>
            </template>
          </FormItem>
          <!-- 表单底部 -->
          <div class="form-footer">
            <div class="left"></div>
            <div class="right">
              <Space :size="8">
                <!-- 重置按钮 -->
                <Button @click="handleReset">重置</Button>
                <!-- 筛选按钮 -->
                <Button type="primary" @click="handleSubmit">筛选</Button>
              </Space>
            </div>
          </div>
        </Form>
      </div>
    </template>
  </Dropdown>
</template>

<script lang="ts">
import type { PropType, ComputedRef } from 'vue';
import { defineComponent, ref, computed, onMounted } from 'vue';
import {
  Dropdown,
  Form,
  FormItem,
  Select,
  Option as SelectOption,
  Space,
  Input,
  DatePicker,
  RangePicker,
  TimePicker,
  Button,
  Tooltip
} from '@arco-design/web-vue';
import {
  IconAlignCenter,
  IconUp,
  IconDown,
  IconQuestionCircle
} from '@arco-design/web-vue/es/icon';
import { useTableSetting } from './hooks/useTableSetting';
import { useTable } from './hooks/useTable';

export default defineComponent({
  components: {
    Dropdown,
    Form,
    FormItem,
    Select,
    SelectOption,
    Space,
    Input,
    DatePicker,
    RangePicker,
    TimePicker,
    Button,
    IconAlignCenter,
    IconUp,
    IconDown,
    IconQuestionCircle,
    Tooltip,
  },
  props: {
    uuid: {
      type: String,
      required: true, // 必须传入 uuid
    },
    filterableColumns: {
      type: Array as PropType<any[]>,
      required: true, // 必须传入可筛选的列
    },
  },
  emits: ['reset', 'custom-search', 'submit'], // 定义组件触发的事件
  setup(props, { emit }) {
    // 获取表格的聚焦过滤器状态和相关方法
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } = useTable({ props, emit });

    // 获取表单数据和重置方法
    const { formData, resetFormData } = useTableSetting(props);

    // 计算属性：筛选条件的数量
    const filterCount: ComputedRef<number> = computed(() => {
      return Object.values(formData).filter(v => !!v).length; // 统计非空值的数量
    });

    // 控制【更多筛选】菜单是否可见
    const isOpenOverlay = ref<boolean>(false);

    // 切换菜单显示状态
    const handleToggle = () => {
      handleClickFilter('moreFilter'); // 触发聚焦过滤器事件
      isOpenOverlay.value = !isOpenOverlay.value; // 切换菜单显示状态
    };

    // 监听菜单显示状态变化
    const handlePopupVisibleChange = (val: boolean) => {
      isOpenOverlay.value = val;
    };

    // 组件挂载时
    onMounted(() => {
      handleClearFocusedFilter(); // 清空聚焦过滤器
    });

    // 重置表单
    const handleReset = () => {
      resetFormData(); // 重置表单数据
      emit('reset'); // 触发 reset 事件
    };

    // 提交筛选
    const handleSubmit = () => {
      isOpenOverlay.value = false; // 关闭菜单
      emit('submit', formData); // 触发 submit 事件
    };

    return {
      formData, // 表单数据
      filterCount, // 筛选条件数量
      isOpenOverlay, // 菜单显示状态
      focusedFilter, // 聚焦过滤器状态
      handleToggle, // 切换菜单显示状态
      handlePopupVisibleChange, // 监听菜单显示状态变化
      handleReset, // 重置表单
      handleSubmit, // 提交筛选
      handleClearFocusedFilter, // 清空聚焦过滤器
      handleClickFilter, // 点击过滤器
    };
  },
});
</script>
