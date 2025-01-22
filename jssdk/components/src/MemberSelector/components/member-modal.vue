<template>
  <Modal
    v-model:visible="visible"
    class="stall-jssdk__member-modal-container"
    :title="`选择${type === 'person' ? '人员' : '用户'}`"
    size="x-large"
    :bodyStyle="{ height: '528px' }"
    @close="handleClose">
    <div class="left-section">
      <Tree
        :data="treeData"
        :fieldNames="treeProps"
        :expanded-keys="expandKeys"
        :load-more="loadMoreOrg"
        @expand="handleExpand"
        @select="handleSelectTreeNode" />
    </div>

    <div class="right-section">
      <GalaxyTable
        v-if="visible"
        uuid="member-selector-modal-table"
        :label="`${type === 'person' ? '人员' : '用户'}`"
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
    </div>

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
import { PropType, ref, inject, watch } from 'vue';
import { Modal, Tree, Button, GalaxyTable, useTableFetchData } from 'stall-design';
import { IconUserGroup } from 'stall-design/es/icon';
import { getColumnsByType } from './columns';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  type: {
    type: String as PropType<'person' | 'user'>,
    default: 'person',
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
const expandKeys = ref([]);
const treeData = ref([]);
const treeProps = {
  key: 'id',
  title: 'orgName',
  children: 'children',
};
const tableRef = ref(null);
const selectedOrgId = ref('');
const isChangedSelectedRowKeys = ref<boolean>(false);
const selectedRowKeys = ref<number[]>([]);
const columns = getColumnsByType(props.type);
const memberDataList = ref<any[]>([]);

watch(
  () => props.modelValue,
  async val => {
    visible.value = val;

    if (val === true) {
      memberDataList.value = [...props.data];
      selectedRowKeys.value = props.data.map(d => d.id);

      const data = await request.get(
        '/api/proxyService/stall-base-portal/stallbaseserverBffApi/portal/tenant/organization/queryOrgTreeLazyList',
      );

      if (data.length === 1) {
        const childList = await queryChildrenById(data[0].id);
        data[0].children = childList.map(({ id, orgName }) => ({
          id,
          orgName,
          children: [],
        }));
      }

      treeData.value = data;
      expandKeys.value = data.map(d => d.id);

      await getMemberListByPage();
    }
  },
);

async function queryChildrenById(id: string) {
  return request.get(
    '/api/proxyService/stall-base-portal/stallbaseserverBffApi/portal/tenant/organization/queryChildLazyList',
    {
      params: {
        id,
        isQueryPrincipal: false,
      },
    },
  );
}

async function loadMoreOrg(nodeData: any) {
  const data = await queryChildrenById(nodeData.id);

  if (data.length > 0) {
    nodeData.children = nodeData.children || [];
    nodeData.children.push(
      ...data.map(({ id, orgName }) => ({
        id,
        orgName,
        children: [],
      })),
    );
  } else {
    nodeData.children = null;
    nodeData.isLeaf = true;
  }
}

async function queryByPage(data: any) {
  let apiUrl =
    '/api/proxyService/stall-base-portal/stallbaseserverBffApi/portal/aggregation/tenant/person/queryConditionPage';
  if (props.type === 'user') {
    apiUrl = '/api/proxyService/stall-base-portal/stallbaseserverBffApi/portal/aggregation/tenant/user/queryConditionPage';
  }

  const res = await request.post(apiUrl, data);

  const ids = memberDataList.value.map(d => d.id);
  const newItems = res.items.filter(d => !ids.includes(d.id));
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
    leftOrgId: selectedOrgId.value,
  });
}

const handleSelectTreeNode = (_selectedKeys: any, { node }: any) => {
  if (node.id) {
    selectedOrgId.value = node.id;
    getMemberListByPage();
  }
};

const handleSelectChange = (keys: number[]) => {
  selectedRowKeys.value = keys;
  isChangedSelectedRowKeys.value = true;
};

const handleExpand = keys => {
  expandKeys.value = keys;
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
          orgId,
          orgName,
          personCode,
          personName,
          personType,
          phone,
          position,
          roleName,
          status,
          supplier,
          userName,
          userType,
        } = d;

        return {
          id,
          email,
          gender,
          orgId,
          orgName,
          personCode,
          personName,
          personType,
          phone,
          position,
          roleName,
          status,
          supplier,
          userName,
          userType,
        };
      });

    emits('change', memberList);
  }

  emits('update:modelValue', false);
};
</script>
