<template>
  <div class="stall-jssdk__file-uploader-container">
    <input type="file" @change="handleFileSelect" />
    <button @click="startUpload" :disabled="uploading">
      {{ uploading ? `上传中 (${progress}%)` : '开始上传' }}
    </button>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import SparkMD5 from 'spark-md5';

const request = inject('request') as any;

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const CONCURRENT_LIMIT = 4; // 并发数
const uploading = ref(false);
const progress = ref(0);
const error = ref<string | null>(null);

const apiPrefix = 'http://localhost:4100/api/files';

let file: any | null = null;
let fileHash: string = '';

const handleFileSelect = async (e: any) => {
  file = e.target.files[0];
  if (!file) return;

  try {
    fileHash = await calculateFileHash(file);
  } catch (err) {
    error.value = '文件读取失败';
  }
};

const calculateFileHash = (file: any): Promise<string> => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks for hash
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    reader.onload = (e: any) => {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end =
        start + chunkSize >= file.size ? file.size : start + chunkSize;
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
};

const startUpload = async () => {
  if (!file) return;

  uploading.value = true;
  error.value = null;
  progress.value = 0;

  try {
    // 检查文件是否存在
    const { exists } = await request.post(`${apiPrefix}/check`, {
      hash: fileHash,
      ext: file.name.split('.').pop(),
    });

    if (exists) {
      alert('文件已存在');
      return;
    }

    // 分片上传
    const chunkSize = CHUNK_SIZE;
    const chunkCount = Math.ceil(file.size / chunkSize);
    const uploadedChunks = new Array(chunkCount).fill(false);
    let uploadedCount = 0;

    const uploadChunk = async (chunkIndex: any) => {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      // 先添加文件字段
      formData.append('chunk', chunk);

      // 创建携带参数的 URL
      const params = new URLSearchParams({
        hash: fileHash,
        index: chunkIndex,
        total: chunkCount,
        filename: file.name,
      } as any);

      try {
        await request.post(`${apiPrefix}/upload?${params}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedChunks[chunkIndex] = true;
        uploadedCount++;
        progress.value = Math.round((uploadedCount / chunkCount) * 100);
      } catch (err) {
        error.value = `分片 ${chunkIndex} 上传失败`;
        throw err;
      }
    };

    // 并发控制
    const chunksToUpload = Array.from({ length: chunkCount }, (_, i) => i);
    const queue: (number | Promise<void> | undefined)[] = [];
    while (chunksToUpload.length) {
      while (queue.length < CONCURRENT_LIMIT && chunksToUpload.length) {
        const chunkIndex = chunksToUpload.shift();
        queue.push(
          uploadChunk(chunkIndex).finally(() => {
            queue.splice(queue.indexOf(chunkIndex), 1);
          }),
        );
      }
      await Promise.race(queue);
    }

    // 合并请求
    await request.post(`${apiPrefix}/merge`, {
      hash: fileHash,
      filename: file.name,
      chunkSize: CHUNK_SIZE,
    });

    alert('上传成功');
  } catch (err: any) {
    error.value = '上传失败: ' + err.message;
  } finally {
    uploading.value = false;
  }
};
</script>

<style lang="less">
@import url('@arco-design/web-vue/es/index.css');

.stall-jssdk__file-uploader-container {
}
</style>
