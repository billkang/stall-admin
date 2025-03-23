<template>
  <div class="stall-jssdk__organization-selector-container">
    <InputTag
      :class="{ empty: orgNameList.length === 0 }"
      v-model:model-value="orgNameList"
      :max-tag-count="5"
      :disabled="disabled"
      prefix="组织: "
      placeholder="请选择组织"
      @remove="handleRemove">
      <template #prefix>组织:</template>
      <template #suffix>
        <template v-if="orgNameList.length > 0">
          <Button type="text" @click="handleOpenModal">编辑</Button>
          <Button type="text" @click="handleClear">清空</Button>
        </template>
        <template v-else>
          <Button type="text" @click="handleOpenModal">添加组织</Button>
        </template>
      </template>
    </InputTag>

    <OrganizationModal
      v-model="visible"
      :data="orgInfoData"
      :maxCount="maxCount"
      :multiple="multiple"
      @change="handleChange" />
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, inject, watch, onBeforeMount } from 'vue';
import { InputTag, Button } from '@arco-design/web-vue';
import OrganizationModal from './components/organization-modal.vue';
import { flatten } from '../utils';

const props = defineProps({
  selectedKeys: {
    type: Array as PropType<number[]>,
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
  disabled: {
    type: Boolean,
    default: false,
  },
});

const request = inject('request') as any;

const visible = ref(false);
const originalOrgData = ref<any[]>([]);
const orgInfoData = ref<any[]>([]);
const orgNameList = ref<string[]>([]);

onBeforeMount(async () => {
  try {
    const data = await request.get(
      '/api-proxy/organization/queryOrgTree',
    );
    originalOrgData.value = flatten(data);

    const keys = props.selectedKeys;
    if (keys?.length > 0) {
      const data = originalOrgData.value.filter(d => keys.includes(d.id));
      updateData(data);
    }
  } catch {}
});

watch(
  () => props.selectedKeys,
  keys => {
    if (keys?.length > 0) {
      const data = originalOrgData.value.filter(d => keys.includes(d.id));
      updateData(data);
    }
  },
);

const emits = defineEmits(['change']);

const handleOpenModal = () => {
  if (!props.disabled) {
    visible.value = true;
  }
};

function updateData(data: any[]) {
  orgInfoData.value = data;
  orgNameList.value = data.map(d => d.orgName);
}

const handleRemove = (val: string) => {
  const data = orgInfoData.value.filter(d => d.orgName !== val);

  updateData(data);

  emits('change', data);
};

const handleClear = e => {
  e.stopPropagation();
  e.preventDefault();

  updateData([]);

  emits('change', []);
};

const handleChange = (data: any) => {
  updateData(data);

  emits('change', data);
};
</script>

<style lang="less">
@import url('@arco-design/web-vue/es/style/index.less');
@import url('@arco-design/web-vue/es/input-tag/style/index.less');
@import url('@arco-design/web-vue/es/button/style/index.less');

.stall-jssdk__organization-selector-container {
  width: 100%;

  .stall-input-tag {
    width: 100%;

    &.empty {
      .stall-input-tag-inner {
        display: none;
      }
    }
  }
}
</style>
