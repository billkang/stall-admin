<template>
  <Modal
    v-model:visible="visible"
    class="stall-jssdk__organization-modal-container"
    title="选择组织"
    size="large"
    :bodyStyle="{ height: '528px' }"
    @ok="handleChange"
    @close="handleClose">
    <div class="left-section">
      <div class="header-wrapper">
        <Input placeholder="搜索：请输入部门名称" allow-clear @change="handleSearch">
          <template #prefix>
            <IconSearch />
          </template>
        </Input>
      </div>
      <div class="content-wrapper">
        <Tree
          v-model:checkedKeys="checkedKeys"
          :data="treeData"
          :expanded-keys="expandKeys"
          :fieldNames="treeProps"
          :check-strictly="true"
          :checkable="true"
          :load-more="loadMoreOrg"
          @expand="handleExpand"
          @check="handleCheckTreeNode" />
      </div>
    </div>

    <div class="right-section">
      <div class="header-wrapper">已选{{ checkedNodeList.length }}个部门</div>
      <div class="content-wrapper">
        <List :bordered="false" size="large">
          <ListItem v-for="item in checkedNodeList" :key="item.id">
            <ListItemMeta :title="item.orgName" :description="item.orgDesc" />
            <template #actions>
              <IconClose @click="handleDelete(item)" />
            </template>
          </ListItem>
        </List>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { PropType, ref, inject, watch } from 'vue';
import { Modal, Tree, Input, List, ListItem, ListItemMeta, Message } from '@arco-design/web-vue';
import { IconSearch, IconClose } from '@arco-design/web-vue/es/icon';

type OrgItemType = {
  id: number;
  deleted: number | null;
  orgArea: string;
  orgBranchPrincipalList: string[];
  orgCode: string;
  orgDesc: string;
  orgLevel: number | null;
  orgLogo: string;
  orgName: string;
  orgPrincipalList: string[];
  orgType: string;
  parentId: number;
  parentOrgName: string;
  personCount: number;
  children: OrgItemType[];
};

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
const treeData = ref<OrgItemType[]>([]);
const expandKeys = ref<number[]>([]);
const treeProps = {
  key: 'id',
  title: 'orgName',
  children: 'children',
};
const checkedKeys = ref<number[]>([]);
const checkedNodeList = ref<OrgItemType[]>([]);

async function fetchData(params = {}) {
  const data = await request.get(
    '/api-proxy/organization/queryOrgTreeLazyList',
    { params },
  );

  if (data.length === 1) {
    const list = await queryChildrenById(data[0].id);
    data[0].children = list;
  }

  treeData.value = data;
  expandKeys.value = data.map(d => d.id);
}

async function queryChildrenById(id: string) {
  return request.get(
    '/api-proxy/organization/queryChildLazyList',
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
    nodeData.children.push(...data);
  } else {
    nodeData.children = null;
    nodeData.isLeaf = true;
  }
}

watch(
  () => props.modelValue,
  async val => {
    visible.value = val;

    if (val === true) {
      await fetchData();

      if (props.data.length > 0) {
        checkedNodeList.value = props.data;
        checkedKeys.value = props.data.map(d => d.id);
      } else {
        checkedNodeList.value = [];
        checkedKeys.value = [];
      }
    }
  },
);

const handleSearch = async (keyword: string) => {
  fetchData({ keyword });
};

const handleExpand = (keys: number[]) => {
  expandKeys.value = keys;
};

const handleCheckTreeNode = (_checkedKeys: string[], { checkedNodes }: { checkedNodes: OrgItemType[] }) => {
  if (checkedNodes.length > props.maxCount) {
    // @ts-ignore
    Message.warning(`最大允许选中${props.maxCount}条数据`);
    return;
  }

  checkedNodeList.value = checkedNodes;
};

const handleDelete = (item: OrgItemType) => {
  const index = checkedNodeList.value.findIndex(d => d.id === item.id);
  checkedNodeList.value.splice(index, 1);
  checkedKeys.value = checkedNodeList.value.map(d => d.id);
};

const emits = defineEmits(['update:modelValue', 'change']);

const handleClose = () => {
  emits('update:modelValue', false);
};

const handleChange = () => {
  emits('change', checkedNodeList.value);
};
</script>
