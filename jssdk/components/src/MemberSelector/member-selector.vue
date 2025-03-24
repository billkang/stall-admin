<template>
  <div class="stall-jssdk__member-selector-container">
    <InputTag
      :class="{ empty: memberNameList.length === 0 }"
      v-model:model-value="memberNameList"
      :max-tag-count="5"
      :disabled="disabled"
      placeholder="请选择人员"
      @remove="handleRemove">
      <template #prefix>人员:</template>
      <template #suffix>
        <template v-if="memberNameList.length > 0">
          <Button type="text" @click="handleOpenModal">编辑</Button>
          <Button type="text" @click="handleClear">清空</Button>
        </template>
        <template v-else>
          <Button type="text" @click="handleOpenModal">添加人员</Button>
        </template>
      </template>
    </InputTag>

    <MemberModal
      v-model="visible"
      :data="memberDataList"
      :maxCount="maxCount"
      :multiple="multiple"
      @change="handleChange" />
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, inject, watch, onBeforeMount } from 'vue';
import { InputTag, Button } from '@arco-design/web-vue';
import MemberModal from './components/member-modal.vue';

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
const originalMemberData = ref<any[]>([]);
const memberDataList = ref<any[]>([]);
const memberNameList = ref<string[]>([]);

function queryByPage(params: any = { page: 1, pageSize: 100 }) {
  const apiUrl = '/api/member/list';

  return request.get(apiUrl, {
    params
  });
}

onBeforeMount(async () => {
  try {
    const { items } = await queryByPage();
    originalMemberData.value = items;

    const keys = props.selectedKeys;
    if (keys?.length) {
      const data = originalMemberData.value.filter(d => keys.includes(d.id));
      updateData(data);
    }
  } catch {}
});

watch(
  () => props.selectedKeys,
  keys => {
    if (keys?.length) {
      const data = originalMemberData.value.filter(d => keys.includes(d.id));
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
  memberDataList.value = data;
  memberNameList.value = data.map((d: any) => d.userName);
}

const handleRemove = (val: string) => {
  let data: any[] = [];
  data = memberDataList.value.filter(d => d.userName !== val);

  updateData(data);

  emits('change', data);
};

const handleClear = (e: { stopPropagation: () => void; preventDefault: () => void; }) => {
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
@import url('@arco-design/web-vue/es/index.css');

.stall-jssdk__member-selector-container {
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
