<script setup lang="ts">
import type { PropType } from 'vue';

import { inject, ref, watch } from 'vue';

import { GalaxyTable, useTableFetchData } from '@stall/galaxy-ui';

import { Button, Modal } from '@arco-design/web-vue';
import { IconUserGroup } from '@arco-design/web-vue/es/icon';

import { columns } from './columns';

const props = defineProps({
  data: {
    default: () => [],
    type: Array as PropType<any[]>,
  },
  maxCount: {
    default: 50,
    type: Number,
  },
  modelValue: {
    default: false,
    required: true,
    type: Boolean,
  },
  multiple: {
    default: true,
    type: Boolean,
  },
});

const emits = defineEmits(['update:modelValue', 'change']);

const request = inject('request') as any;

const visible = ref<boolean>(false);

const tableRef = ref(null);
const isChangedSelectedRowKeys = ref<boolean>(false);
const selectedRowKeys = ref<number[]>([]);
const memberDataList = ref<any[]>([]);

watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val;

    if (val === true) {
      memberDataList.value = [...props.data];
      selectedRowKeys.value = props.data.map((d) => d.id);

      await getMemberListByPage();
    }
  },
);

async function queryByPage(params: any) {
  const apiUrl = '/api/member/list';

  const res = await request.get(apiUrl, {
    params,
  });

  const ids = new Set(memberDataList.value.map((d) => d.id));
  const newItems = res.items.filter((d: { id: any }) => !ids.has(d.id));
  if (newItems?.length > 0) {
    memberDataList.value.push(...newItems);
  }

  return res;
}
const { dataSource, fetchData, loading, pagination } = useTableFetchData(
  queryByPage,
  tableRef,
);

function getMemberListByPage(params: Record<string, string> = {}) {
  isChangedSelectedRowKeys.value = false;

  fetchData({
    ...params,
  });
}

const handleSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys;
  isChangedSelectedRowKeys.value = true;
};

const handleSearch = (data: Record<string, any>) => {
  getMemberListByPage(data);
};

const handleClose = () => {
  emits('update:modelValue', false);
};

const handleChange = () => {
  if (isChangedSelectedRowKeys.value) {
    const memberList = memberDataList.value
      .filter((d: any) => selectedRowKeys.value.includes(d.id))
      .map((d: any) => {
        const {
          email,
          gender,
          id,
          phone,
          position,
          roleName,
          status,
          supplier,
          userName,
        } = d;

        return {
          email,
          gender,
          id,
          phone,
          position,
          roleName,
          status,
          supplier,
          userName,
        };
      });

    emits('change', memberList);
  }

  emits('update:modelValue', false);
};
</script>

<template>
  <Modal
    v-model:visible="visible"
    class="stall-jssdk__member-modal-container"
    title="选择人员"
    size="x-large"
    :body-style="{ height: '528px' }"
    @close="handleClose"
  >
    >
    <GalaxyTable
      v-if="visible"
      uuid="member-selector-modal-table"
      label="人员"
      ref="tableRef"
      :loading="loading"
      :default-selected-keys="selectedRowKeys"
      :max-selected-keys-count="maxCount"
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      page-position="tr"
      :row-selection-type="!!props.multiple ? 'checkbox' : 'radio'"
      :optional="{ visible: false }"
      :filter="{ moreFilter: false, myFilter: false, summary: false }"
      @selection-change="handleSelectChange"
      @search="handleSearch"
    />

    <template #footer>
      <div class="left-section">
        <IconUserGroup />
        已选 {{ selectedRowKeys.length }} 人
      </div>
      <div class="right-section">
        <Button @click="handleClose">取消</Button>
        <Button type="primary" @click="handleChange">确定</Button>
      </div>
    </template>
  </Modal>
</template>
