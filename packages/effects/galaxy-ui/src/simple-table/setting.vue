<template>
  <Drawer
    v-model:visible="innerVisible"
    class="stall-galaxy-table__setting"
    :width="592"
    :mask="false"
    :footer="false"
    @close="handleClose">
    <!-- 抽屉标题 -->
    <template #title>表格显示设置</template>

    <!-- 左侧区域 -->
    <div class="table-setting__left-section">
      <!-- 显示密度设置 -->
      <div class="table-size-wrapper">
        <div class="wrapper-title">显示密度</div>
        <div class="size-list">
          <!-- 宽松模式 -->
          <div class="size-item">
            <div class="img-box" :class="{ selected: tableSize === 'large' }">
              <img :src="sizeLarge" @click="handleSelectSize('large')" />
              <span class="app-iconify">
                <IconCheckCircleFill />
              </span>
            </div>
            宽松
          </div>

          <!-- 紧凑模式 -->
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

      <!-- 分割线 -->
      <Divider />

      <!-- 文本控制设置 -->
      <div class="table-text-control-wrapper">
        <div class="wrapper-title">文本控制</div>
        <RadioGroup
          class="text-control-list"
          v-model="textControl"
          @change="handleChangeTextControl">
          <!-- 自动换行 -->
          <Radio value="wrap" class="text-control-item">
            <div class="text-control-title">自动换行</div>
            <div class="text-control-desc">超出单元格宽度的内容将在单元格内自动换行显示，不被省略</div>
          </Radio>

          <!-- 内容溢出省略 -->
          <Radio value="ellipsis" class="text-control-item">
            <div class="text-control-title">内容溢出省略</div>
            <div class="text-control-desc">超出单元格宽度的内容将以省略号代替</div>
          </Radio>
        </RadioGroup>
      </div>
    </div>

    <!-- 右侧区域 -->
    <div class="table-setting__right-section">
      <!-- 字段显示设置 -->
      <div class="table-columns-sort-wrapper">
        <div class="wrapper-title">字段显示设置</div>
        <Tree
          :data="mergedColumns
            .filter((c: any) => !['id', 'uuid', 'optional'].includes(c.dataIndex))
            .map((c: any) => ({ ...c, key: c.dataIndex }))">
          <!-- 自定义树节点 -->
          <template #title="{ key, title, disabled }">
            <span>
              {{ title }}
            </span>

            <!-- 开关按钮 -->
            <Switch
              v-model="mergedColumns.find((c: any) => c.dataIndex === key)['visible']"
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
      default: false, // 默认值为 false
    },
    uuid: {
      type: String,
      required: true, // 必须传入 uuid
    },
    columns: {
      type: Array as PropType<any>,
      required: true, // 必须传入列配置
    },
  },
  emits: ['update:modelValue'], // 定义组件触发的事件
  setup(props, { emit }) {
    // 内部可见性状态
    const innerVisible = ref<boolean>(false);

    // 获取表格设置的逻辑
    const { mergedColumns, setTextControl, textControl, setTableSize, tableSize } = useTableSetting(props);

    // 监听 modelValue 的变化
    watch(
      () => props.modelValue,
      val => {
        innerVisible.value = val || false;
      },
    );

    // 处理文本控制方式变化
    const handleChangeTextControl = (type: any) => {
      setTextControl(type as TableTextControl); // 设置文本控制方式
    };

    // 处理表格尺寸选择
    const handleSelectSize = (size: TableSize) => {
      setTableSize(size); // 设置表格尺寸
    };

    // 处理关闭事件
    const handleClose = () => {
      emit('update:modelValue', false); // 触发 update:modelValue 事件，关闭抽屉
    };

    return {
      innerVisible, // 内部可见性状态
      textControl, // 当前文本控制方式
      tableSize, // 当前表格尺寸
      mergedColumns, // 合并后的列配置
      sizeLarge, // 宽松模式图片
      sizeSmall, // 紧凑模式图片
      handleChangeTextControl, // 处理文本控制方式变化
      handleSelectSize, // 处理表格尺寸选择
      handleClose, // 处理关闭事件
    };
  },
});
</script>
