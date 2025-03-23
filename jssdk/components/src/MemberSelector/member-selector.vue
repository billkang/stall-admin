<template>
  <div class="stall-jssdk__member-selector-container">
    <InputTag
      :class="{ empty: memberNameList.length === 0 }"
      v-model:model-value="memberNameList"
      :max-tag-count="5"
      :disabled="disabled"
      :placeholder="`请选择${type === 'person' ? '人员' : '用户'}`"
      @remove="handleRemove">
      <template #prefix>{{ `${type === 'person' ? '人员: ' : '用户: '}` }}</template>
      <template #suffix>
        <template v-if="memberNameList.length > 0">
          <Button type="text" @click="handleOpenModal">编辑</Button>
          <Button type="text" @click="handleClear">清空</Button>
        </template>
        <template v-else>
          <Button type="text" @click="handleOpenModal">添加{{ `${type === 'person' ? '人员' : '用户'}` }}</Button>
        </template>
      </template>
    </InputTag>

    <MemberModal
      v-model="visible"
      :type="type"
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
  type: {
    type: String as PropType<'person' | 'user'>,
    default: 'person',
  },
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

function queryByPage(data: any = { pageIndex: 1, pageSize: 100 }) {
  let apiUrl =
    '/api-proxy/person/queryConditionPage';
  if (props.type === 'user') {
    apiUrl = '/api-proxy/user/queryConditionPage';
  }

  return request.post(apiUrl, data);
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
  if (props.type === 'person') {
    memberNameList.value = data.map((d: any) => d.personName);
  } else {
    memberNameList.value = data.map((d: any) => `${d.personName}(${d.userName})`);
  }
}

const handleRemove = (val: string) => {
  let data: any[] = [];
  if (props.type === 'person') {
    data = memberDataList.value.filter(d => d.personName !== val);
  } else {
    const userName = val.replace(/[\S|\s]+\(([\S\s]+)\)/g, '$1');
    data = memberDataList.value.filter(d => d.userName !== userName);
  }

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
@import url('@arco-design/web-vue/es/style/index.less');
@import url('@arco-design/web-vue/es/input-tag/style/index.less');
@import url('@arco-design/web-vue/es/button/style/index.less');

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
