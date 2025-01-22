<template>
  <Dropdown
    :popup-visible="isOpenOverlay"
    position="bottom"
    trigger="click"
    @click.stop="handleToggle"
    @popup-visible-change="handlePopupVisibleChange"
  >
    <div
      class="stall-galaxy-table-filter__more-filter flex"
      :class="{ 'focused-filter': focusedFilter === 'moreFilter' }"
    >
      <IconAlignCenter />

      <div class="dropdown-title">
        {{ t(`table.filter.moreConditions`) }}
        <span v-if="filterCount > 0" class="filter-count">{{
          filterCount
        }}</span>
      </div>

      <IconUp v-if="isOpenOverlay" />
      <IconDown v-else />
    </div>

    <template #content>
      <div class="stall-galaxy-table-filter__more-filter-overlay">
        <Form :model="formData" layout="vertical" class="stall-dropdown-menu">
          <FormItem
            :class="{
              'grid-rang-picker':
                column.filterable?.componentType === 'rang-picker',
            }"
            v-for="column in filterableColumns"
            :key="column.dataIndex"
            :name="column.dataIndex"
            :label="`${column.title || ''}`"
            label-col-flex="30px"
          >
            <!-- 根据column类型，展示不同组件 -->
            <template v-if="column.filterable?.render">
              <FilterCustomRender :render="column.filterable.render" />
            </template>
            <template v-else>
              <template v-if="column.filterable?.componentType">
                <Input
                  v-if="column.filterable.componentType === 'input'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear
                />
                <DatePicker
                  v-else-if="column.filterable.componentType === 'date-picker'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear
                />
                <TimePicker
                  v-else-if="column.filterable.componentType === 'time-picker'"
                  v-model="formData[column.dataIndex!]"
                  allow-clear
                />
                <RangePicker
                  v-else-if="column.filterable.componentType === 'rang-picker'"
                  v-model="formData[column.dataIndex!]"
                  :time-picker-props="{
                    defaultValue: ['00:00:00', '00:00:00'],
                  }"
                  showTime
                  allow-clear
                />
                <Select
                  v-else-if="column.filterable?.filters"
                  v-model="formData[column.dataIndex!]"
                  :multiple="column.filterable.multiple === true"
                  allowClear
                  @search="handleCustomSearch(`${column.dataIndex}`, $event)"
                >
                  <SelectOption
                    v-for="opt in column.filterable.filters"
                    :value="opt.value"
                    :key="opt.value"
                  >
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
                  @search="handleCustomSearch(`${column.dataIndex}`, $event)"
                >
                  <SelectOption
                    v-for="opt in column.filterable.filters"
                    :value="opt.value"
                    :key="opt.value"
                  >
                    {{ opt.text }}
                  </SelectOption>
                </Select>
              </template>
            </template>
          </FormItem>
          <div class="form-footer">
            <div class="left">
              <Checkbox class="checker" v-model="isOpenCustomFilterName" />
              {{ t(`table.filter.saveText`) }}
              <Tooltip :content="t(`table.filter.saveTooltip`)">
                <IconQuestionCircle />
              </Tooltip>
              <Input
                v-if="isOpenCustomFilterName"
                class="custom-filter-input"
                v-model="customFilterName"
                :placeholder="t(`table.filter.enterCustomFilterName`)"
                show-word-limit
                :max-length="10"
                allow-clear
              />
            </div>
            <div class="right">
              <Space :size="8">
                <Button @click="handleReset">{{
                  t(`table.filter.resetText`)
                }}</Button>
                <Button type="primary" @click="handleSubmit">{{
                  t(`table.filter.filterText`)
                }}</Button>
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
import type { TableColumnData } from '../table/interface';
import { defineComponent, ref, computed, onMounted } from 'vue';
import Dropdown from '../dropdown';
import Form from '../form';
import FormItem from '../form/form-item.vue';
import Select, { Option as SelectOption } from '../select';
import Space from '../space';
import Input from '../input';
import DatePicker, { RangePicker } from '../date-picker';
import TimePicker from '../time-picker';
import Checkbox from '../checkbox';
import Button from '../button';
import Message from '../message';
import IconAlignCenter from '../icon/icon-align-center';
import IconUp from '../icon/icon-up';
import IconDown from '../icon/icon-down';
import IconQuestionCircle from '../icon/icon-question-circle';
import Tooltip from '../tooltip';
import { useI18n } from '../locale';
import { useTableSetting } from './hooks/useTableSetting';
import { useTable } from './hooks/useTable';
import FilterCustomRender from './filter-custom-render.vue';
import { isValidValue } from '../_utils/is';

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
      type: Array as PropType<TableColumnData[]>,
      required: true,
    },
  },
  emits: ['reset', 'custom-search', 'submit'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const { handleClickFilter, focusedFilter, handleClearFocusedFilter } =
      useTable({ props, emit, t });

    const { formData, resetFormData, saveCustomFilter } =
      useTableSetting(props);

    const filterCount: ComputedRef<number> = computed(() => {
      return Object.values(formData).filter((v) => isValidValue(v)).length;
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

    const isOpenCustomFilterName = ref(false);
    const customFilterName = ref();
    const handleCustomFilterName = () => {
      const name = customFilterName.value;

      try {
        saveCustomFilter(name, formData);

        isOpenCustomFilterName.value = false;
        customFilterName.value = null;
      } catch (e: any) {
        Message.error(e.message);
      }
    };

    onMounted(() => {
      handleClearFocusedFilter();
    });

    const handleReset = () => {
      resetFormData();

      emit('reset');
    };

    const handleSubmit = () => {
      if (isOpenCustomFilterName.value) {
        const name = customFilterName.value;
        if (!name) {
          Message.warning(t(`table.filter.enterFilterName`));
          return;
        }

        const hasValue =
          Object.values(formData).filter((v) => isValidValue(v)).length > 0;
        if (!hasValue) {
          Message.warning(t(`table.filter.selectFilter`));
          return;
        }
        handleCustomFilterName();
      }

      isOpenOverlay.value = false;

      emit('submit', formData);
    };

    const handleCustomSearch = (key: string, value: string) => {
      emit('custom-search', { key, value });
    };

    return {
      t,
      formData,
      filterCount,
      isOpenOverlay,
      isOpenCustomFilterName,
      customFilterName,
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
