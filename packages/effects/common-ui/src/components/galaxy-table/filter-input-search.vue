<template>
  <div
    class="stall-galaxy-table-filter__input-search"
    :class="{ 'focused-filter': focusedFilter === 'inputSearch' }"
  >
    <Input
      v-if="visible"
      v-model="formData[column.dataIndex]"
      :placeholder="t(`table.filter.inputPlaceholder`)"
      allow-clear
      @clear="handleClear"
      @press-enter="handleSearch"
    >
      <template #prefix>
        <IconSearch />
      </template>
    </Input>
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
import {
  defineComponent,
  PropType,
  ref,
  onMounted,
  onBeforeUnmount,
} from 'vue';
import { Input, useI18n } from 'ant-design-vue';
import IconSearch from '../icon/icon-search';
import { useTableSetting } from './hooks/useTableSetting';
import { recursiveCheckNodeClass } from './utils';
import { useTable } from './hooks/useTable';

export default defineComponent({
  components: {
    Input,
    IconSearch,
  },
  props: {
    uuid: {
      type: String,
      required: true,
    },
    column: {
      type: Object as PropType<any>,
      required: true,
    },
    expand: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['search'],
  setup(props, { emit }) {
    const { formData } = useTableSetting(props);
    const { t } = useI18n();
    const { focusedFilter, handleClickFilter, handleClearFocusedFilter } =
      useTable({ props, emit, t });

    const visible = ref<boolean>(props.expand);
    const handleClickInputSearch = () => {
      visible.value = true;
      handleClickFilter('inputSearch');
    };

    const handleToggleVisible = (e: Event) => {
      if (!props.expand) {
        const found = recursiveCheckNodeClass(
          e.target as any,
          'stall-galaxy-table-filter__input-search',
        );
        if (!found) {
          visible.value = false;
        }
      }
    };

    onMounted(() => {
      handleClearFocusedFilter();
      window.addEventListener('click', handleToggleVisible, false);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('click', handleToggleVisible, false);
    });

    const handleClear = () => {
      formData[props.column.dataIndex] = null;
      emit('search', formData);
    };

    const handleSearch = () => {
      emit('search', formData);
    };

    return {
      t,
      visible,
      formData,
      focusedFilter,
      handleClear,
      handleSearch,
      handleClickInputSearch,
      handleClickFilter,
      handleClearFocusedFilter,
    };
  },
});
</script>
