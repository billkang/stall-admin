<template>
  <Drawer
    v-model:visible="innerVisible"
    class="stall-galaxy-table__setting"
    :width="592"
    :mask="false"
    :footer="false"
    @close="handleClose"
  >
    <template #title>{{ t('table.setting.title') }}</template>
    <div class="table-setting__left-section">
      <div class="table-size-wrapper">
        <div class="wrapper-title">{{ t('table.setting.size.title') }}</div>
        <div class="size-list">
          <div class="size-item">
            <div class="img-box" :class="{ selected: tableSize === 'large' }">
              <img :src="sizeLarge" @click="handleSelectSize('large')" />
              <span class="app-iconify">
                <IconCheckCircleFill />
              </span>
            </div>
            {{ t('table.setting.size.large') }}
          </div>
          <div class="size-item">
            <div class="img-box" :class="{ selected: tableSize === 'small' }">
              <img :src="sizeSmall" @click="handleSelectSize('small')" />
              <span class="app-iconify">
                <IconCheckCircleFill />
              </span>
            </div>
            {{ t('table.setting.size.small') }}
          </div>
        </div>
      </div>

      <Divider />

      <div class="table-text-control-wrapper">
        <div class="wrapper-title">
          {{ t('table.setting.textControl.title') }}
        </div>
        <RadioGroup
          class="text-control-list"
          v-model="textControl"
          @change="handleChangeTextControl"
        >
          <Radio value="wrap" class="text-control-item">
            <div class="text-control-title">
              {{ t('table.setting.textControl.wrapTitle') }}
            </div>
            <div class="text-control-desc">
              {{ t('table.setting.textControl.wrapDesc') }}
            </div>
          </Radio>
          <Radio value="ellipsis" class="text-control-item">
            <div class="text-control-title">
              {{ t('table.setting.textControl.ellipsisTitle') }}
            </div>
            <div class="text-control-desc">
              {{ t('table.setting.textControl.ellipsisTitle') }}
            </div>
          </Radio>
        </RadioGroup>
      </div>
    </div>

    <div class="table-setting__right-section">
      <div class="table-columns-sort-wrapper">
        <div class="wrapper-title">{{ t('table.setting.sort.title') }}</div>
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
                sortedColumns.find((c: any) => c.dataIndex === key)['visible']
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

<script lang="ts">
import type { PropType } from 'vue';
import type { TreeNodeData } from '../tree';
import { defineComponent, ref, watch } from 'vue';
import { Drawer, Divider, Tree, Switch, useI18n } from 'ant-design-vue';
import Radio, { RadioGroup } from '../radio';
import IconCheckCircleFill from '../icon/icon-check-circle-fill';
import IconDragDotVertical from '../icon/icon-drag-dot-vertical';
import {
  TableSize,
  TableTextControl,
  useTableSetting,
} from './hooks/useTableSetting';
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
    const { t } = useI18n();
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
      t,
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
