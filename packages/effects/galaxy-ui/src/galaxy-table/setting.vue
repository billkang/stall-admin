<template>
  <Drawer
    v-model:visible="innerVisible"
    class="stall-galaxy-table__setting"
    :width="592"
    :mask="false"
    :footer="false"
    @close="handleClose">
    <template #title>表格显示设置</template>
    <div class="table-setting__left-section">
      <div class="table-size-wrapper">
        <div class="wrapper-title">显示密度</div>
        <div class="size-list">
          <div class="size-item">
            <div class="img-box" :class="{ selected: tableSize === 'large' }">
              <img :src="sizeLarge" @click="handleSelectSize('large')" />
              <span class="app-iconify">
                <IconCheckCircleFill />
              </span>
            </div>
            宽松
          </div>
          <div class="size-item">
            <div class="img-box" :class="{ selected: tableSize === 'small' }">
              <img :src="sizeSmall" @click="handleSelectSize('small')" />
              <span class="app-iconify">
                <IconCheckCircleFill />
              </span>
            </div>
            紧凑
          </div>
        </div>
      </div>

      <Divider />

      <div class="table-text-control-wrapper">
        <div class="wrapper-title">文本控制</div>
        <RadioGroup class="text-control-list" v-model="textControl" @change="handleChangeTextControl">
          <Radio value="wrap" class="text-control-item">
            <div class="text-control-title">自动换行</div>
            <div class="text-control-desc">超出单元格宽度的内容将在单元格内自动换行显示，不被省略</div>
          </Radio>
          <Radio value="ellipsis" class="text-control-item">
            <div class="text-control-title">内容溢出省略</div>
            <div class="text-control-desc">超出单元格宽度的内容将以省略号代替</div>
          </Radio>
        </RadioGroup>
      </div>
    </div>

    <div class="table-setting__right-section">
      <div class="table-columns-sort-wrapper">
        <div class="wrapper-title">字段显示设置</div>
        <Tree
          :data="sortedColumns
            .filter((c: any) => !['id', 'uuid', 'optional'].includes(c.dataIndex))
            .map((c: any) => ({ ...c, key: c.dataIndex }))">
          <template #title="{ key, title, disabled }">
            <span>
              {{ title }}
            </span>

            <Switch
              v-model="sortedColumns.find((c: any) => c.dataIndex === key)['visible']"
              :disabled="disabled"
              size="small" />
          </template>
        </Tree>
      </div>
    </div>
  </Drawer>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { TreeNodeData } from '@arco-design/web-vue';
import { defineComponent, ref, watch } from 'vue';
import { Drawer, Divider, Tree, Radio, RadioGroup, Switch } from '@arco-design/web-vue';
import { IconCheckCircleFill } from '@arco-design/web-vue/es/icon';
import { type TableSize, type TableTextControl, useTableSetting } from './hooks/useTableSetting';
import sizeLarge from './assets/images/table-size-large.png';
import sizeSmall from './assets/images/table-size-small.png';

export default defineComponent({
  components: {
    Drawer,
    Divider,
    Tree,
    RadioGroup,
    Radio,
    Switch,
    IconCheckCircleFill,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
      default: false,
    },
    uuid: {
      type: String,
      required: true,
    },
    columns: {
      type: Array as PropType<any>,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const innerVisible = ref<boolean>(false);
    const { sortedColumns, setTextControl, textControl, setTableSize, tableSize, saveSortedColumns } =
      useTableSetting(props);

    watch(
      () => props.modelValue,
      val => {
        innerVisible.value = val || false;
      },
    );

    const handleChangeTextControl = (type: any) => {
      setTextControl(type as TableTextControl);
    };

    const handleSelectSize = (size: TableSize) => {
      setTableSize(size);
    };

    const handleClose = () => {
      emit('update:modelValue', false);
    };

    return {
      innerVisible,
      textControl,
      tableSize,
      sortedColumns,
      sizeLarge,
      sizeSmall,
      handleChangeTextControl,
      handleSelectSize,
      handleClose,
    };
  },
});
</script>
