<script lang="ts">
import type { TreeNodeData } from '@arco-design/web-vue';

import type { PropType } from 'vue';

import type { TableSize, TableTextControl } from './hooks/useTableSetting';

import { defineComponent, ref, watch } from 'vue';

import {
  Divider,
  Drawer,
  Radio,
  RadioGroup,
  Switch,
  Tree,
} from '@arco-design/web-vue';
import {
  IconCheckCircleFill,
  IconDragDotVertical,
} from '@arco-design/web-vue/es/icon';

import sizeLarge from './assets/images/table-size-large.png';
import sizeSmall from './assets/images/table-size-small.png';
import { useTableSetting } from './hooks/useTableSetting';

export default defineComponent({
  components: {
    Drawer,
    Divider,
    Tree,
    RadioGroup,
    Radio,
    Switch,
    IconCheckCircleFill,
    IconDragDotVertical,
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
    const {
      sortedColumns,
      setTextControl,
      textControl,
      setTableSize,
      tableSize,
      saveSortedColumns,
    } = useTableSetting(props);

    watch(
      () => props.modelValue,
      (val) => {
        innerVisible.value = val || false;
      },
    );

    const handleChangeTextControl = (type: any) => {
      setTextControl(type as TableTextControl);
    };

    const handleSelectSize = (size: TableSize) => {
      setTableSize(size);
    };

    const handleDrop = ({
      dragNode,
      dropNode,
      dropPosition,
    }: {
      dragNode: TreeNodeData;
      dropNode: TreeNodeData;
      dropPosition: number;
    }) => {
      const columns = [...sortedColumns.value];

      const loop = (
        columns: any[],
        key: string,
        callback: (item: any, index: number, arr: any[]) => void,
      ) => {
        columns.some((item, index, arr) => {
          if (item.dataIndex === key) {
            callback(item, index, arr);
            return true;
          }
          return false;
        });
      };

      loop(columns, dragNode.key as string, (_, index, arr) => {
        arr.splice(index, 1);
      });

      if (dropPosition === 0) {
        loop(columns, dropNode.key as string, (_item, _index, arr) => {
          arr.unshift(dragNode);
        });
      } else {
        loop(columns, dropNode.key as string, (_, index, arr) => {
          arr.splice(dropPosition < 0 ? index : index + 1, 0, dragNode);
        });
      }

      sortedColumns.value = [...columns];

      saveSortedColumns(sortedColumns.value);
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
      handleDrop,
      handleClose,
    };
  },
});
</script>

<template>
  <Drawer
    v-model:visible="innerVisible"
    class="stall-galaxy-table__setting"
    :width="592"
    :mask="false"
    :footer="false"
    @close="handleClose"
  >
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
        <RadioGroup
          class="text-control-list"
          v-model="textControl"
          @change="handleChangeTextControl"
        >
          <Radio value="wrap" class="text-control-item">
            <div class="text-control-title">自动换行</div>
            <div class="text-control-desc">
              超出单元格宽度的内容将在单元格内自动换行显示，不被省略
            </div>
          </Radio>
          <Radio value="ellipsis" class="text-control-item">
            <div class="text-control-title">内容溢出省略</div>
            <div class="text-control-desc">
              超出单元格宽度的内容将以省略号代替
            </div>
          </Radio>
        </RadioGroup>
      </div>
    </div>

    <div class="table-setting__right-section">
      <div class="table-columns-sort-wrapper">
        <div class="wrapper-title">字段显示设置</div>
        <Tree
          draggable
          :data="
            sortedColumns
              .filter(
                (c: any) => !['id', 'uuid', 'optional'].includes(c.dataIndex),
              )
              .map((c: any) => ({ ...c, key: c.dataIndex }))
          "
          @drop="handleDrop"
        >
          <template #title="{ key, title, disabled }">
            <span>
              <IconDragDotVertical />
              {{ title }}
            </span>

            <Switch
              v-model="
                sortedColumns.find((c: any) => c.dataIndex === key).visible
              "
              :disabled="disabled"
              size="small"
            />
          </template>
        </Tree>
      </div>
    </div>
  </Drawer>
</template>
