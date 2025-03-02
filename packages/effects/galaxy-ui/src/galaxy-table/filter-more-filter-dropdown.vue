<template>
  <Dropdown
    :popup-visible="isOpenOverlay"
    position="bottom"
    trigger="click"
    @click.stop="handleToggle"
    @popup-visible-change="handlePopupVisibleChange">
    <div
      class="flex stall-galaxy-table-filter__more-filter"
      :class="{ 'focused-filter': focusedFilter === 'moreFilter' }">
      <IconAlignCenter />

      <div class="dropdown-title">
        更多筛选
        <span v-if="filterCount > 0" class="filter-count">{{ filterCount }}</span>
      </div>

      <IconUp v-if="isOpenOverlay" />
      <IconDown v-else />
    </div>

    <template #content>
      <div class="stall-galaxy-table-filter__more-filter-overlay">
        <Form :model="formData" layout="vertical" class="stall-dropdown-menu">
          <FormItem
            :class="{ 'grid-rang-picker': column.filterable?.componentType === 'rang-picker' }"
            v-for="column in filterableColumns"
            :key="column.dataIndex"
            :name="column.dataIndex"
            :label="`${column.title || ''}`"
            label-col-flex="30px">
            <!-- 根据column类型，展示不同组件 -->
            <template v-if="column.filterable?.render">
              <FilterCustomRender :render="column.filterable.render" />
            </template>
            <template v-else>
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
                  allowClear
                  @search="handleCustomSearch(`${column.dataIndex}`, $event)">
                  <SelectOption v-for="opt in column.filterable.filters" :value="opt.value" :key="opt.value">
                    {{ opt.text }}
                  </SelectOption>
                </Select>
              </template>
              <!-- 兼容 没有设置componentType -->
              <template v-else-if="column.filterable?.filters">
                <Select
                  v-model="formData[column.dataIndex!]"
                  :multiple="column.filterable.multiple === true"
                  allowClear
                  @search="handleCustomSearch(`${column.dataIndex}`, $event)">
                  <SelectOption v-for="opt in column.filterable.filters" :value="opt.value" :key="opt.value">
                    {{ opt.text }}
                  </SelectOption>
                </Select>
              </template>
            </template>
          </FormItem>
          <div class="form-footer">
            <div class="left"></div>
            <div class="right">
              <Space :size="8">
                <Button @click="handleReset">重置</Button>
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
import { Dropdown, Form, FormItem, Select, Option as SelectOption, Space, Input, DatePicker, RangePicker, TimePicker,Checkbox,Button,Message,Tooltip } from '@arco-design/web-vue';
import { IconAlignCenter, IconUp, IconDown, IconQuestionCircle } from '@arco-design/web-vue/es/icon';
import { useTableSetting } from './hooks/useTableSetting';
import { useTable } from './hooks/useTable';
import FilterCustomRender from './filter-custom-render.vue';

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
    Checkbox,
    Button,
    IconAlignCenter,
    IconUp,
    IconDown,
    IconQuestionCircle,
    Tooltip,
    FilterCustomRender,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    filterableColumns: {
      type: Array as PropType<any[]>,
      required: true,
    },
  },
  emits: ['reset', 'custom-search', 'submit'],
  setup(props, { emit }) {
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } = useTable({ props, emit });

    const { formData, resetFormData } = useTableSetting(props);

    const filterCount: ComputedRef<number> = computed(() => {
      return Object.values(formData).filter(v => !!v).length;
    });

    // 控制【更多筛选】菜单是否可见
    const isOpenOverlay = ref<boolean>(false);
    const handleToggle = () => {
      handleClickFilter('moreFilter');
      isOpenOverlay.value = !isOpenOverlay.value;
    };

    const handlePopupVisibleChange = (val: boolean) => {
      isOpenOverlay.value = val;
    };

    onMounted(() => {
      handleClearFocusedFilter();
    });

    const handleReset = () => {
      resetFormData();

      emit('reset');
    };

    const handleSubmit = () => {
      isOpenOverlay.value = false;

      emit('submit', formData);
    };

    const handleCustomSearch = (key: string, value: string) => {
      emit('custom-search', { key, value });
    };

    return {
      formData,
      filterCount,
      isOpenOverlay,
      focusedFilter,
      handleToggle,
      handlePopupVisibleChange,
      handleReset,
      handleSubmit,
      handleClearFocusedFilter,
      handleClickFilter,
      handleCustomSearch,
    };
  },
});
</script>
