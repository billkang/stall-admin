<template>
  <Modal
    v-model:visible="visible"
    class="stall-jssdk__member-modal-container"
    title="选择人员"
    size="x-large"
    :bodyStyle="{ height: '528px' }"
    @close="handleClose">
      <GalaxyTable
        v-if="visible"
        uuid="member-selector-modal-table"
        label="人员"
        ref="tableRef"
        :loading="loading"
        :defaultSelectedKeys="selectedRowKeys"
        :maxSelectedKeysCount="maxCount"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="pagination"
        pagePosition="tr"
        :rowSelectionType="!!props.multiple ? 'checkbox' : 'radio'"
        :optional="{ visible: false }"
        :filter="{ moreFilter: false, myFilter: false, summary: false }"
        @selectionChange="handleSelectChange"
        @search="handleSearch" />

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

<script setup lang="ts">
import { type PropType, ref, inject, watch } from 'vue';
import { Modal, Button } from '@arco-design/web-vue';
import { GalaxyTable, useTableFetchData } from '@stall/galaxy-ui';
import { IconUserGroup } from '@arco-design/web-vue/es/icon';
import { columns } from './columns';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  data: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  maxCount: {
    type: Number,
    default: 50,
  },
  multiple: {
    type: Boolean,
    default: true,
  },
});

const request = inject('request') as any;

const visible = ref<boolean>(false);

const tableRef = ref(null);
const isChangedSelectedRowKeys = ref<boolean>(false);
const selectedRowKeys = ref<number[]>([]);
const memberDataList = ref<any[]>([]);

watch(
  () => props.modelValue,
  async val => {
    visible.value = val;

    if (val === true) {
      memberDataList.value = [...props.data];
      selectedRowKeys.value = props.data.map(d => d.id);

      await getMemberListByPage();
    }
  },
);

async function queryByPage(params: any) {
  const apiUrl = '/api/member/list';

  const res = await request.get(apiUrl, {
    params
  });

  const ids = memberDataList.value.map(d => d.id);
  const newItems = res.items.filter((d: { id: any; }) => !ids.includes(d.id));
  if (newItems?.length > 0) {
    memberDataList.value.push(...newItems);
  }

  return res;
}
const { loading, dataSource, pagination, fetchData } = useTableFetchData(queryByPage, tableRef);

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

const emits = defineEmits(['update:modelValue', 'change']);

const handleClose = () => {
  emits('update:modelValue', false);
};

const handleChange = () => {
  if (isChangedSelectedRowKeys.value) {
    const memberList = memberDataList.value
      .filter((d: any) => selectedRowKeys.value.includes(d.id))
      .map((d: any) => {
        const {
          id,
          email,
          gender,
          phone,
          position,
          roleName,
          status,
          supplier,
          userName,
        } = d;

        return {
          id,
          email,
          gender,
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
