<script lang="ts" setup>
import { inject, ref, useTemplateRef } from 'vue';

import { Alert, Button } from '@arco-design/web-vue';
import { IconUpload } from '@arco-design/web-vue/es/icon';
import SparkMD5 from 'spark-md5';

const request = inject('request') as any;

const inputRef = useTemplateRef('fileInput');

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const CONCURRENT_LIMIT = 4; // 并发数

const uploading = ref(false);
const progress = ref(0);
const success = ref<null | string>(null);
const error = ref<null | string>(null);

const apiPrefix = 'http://localhost:4100/api/files';

/**
 * 计算文件的MD5哈希值
 * @param file 文件对象
 * @returns 文件的MD5哈希值
 */
const calculateFileHash = (file: any): Promise<string> => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks for hash
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;

    reader.addEventListener('load', (e: any) => {
      spark.append(e.target.result);
      currentChunk++;
      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    });

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
};

/**
 * 检查文件和分片是否存在
 * @param file 文件对象
 * @param fileHash 文件的MD5哈希值
 * @returns 已存在的分片索引数组
 */
const checkFileAndChunks = async (file: any, fileHash: string) => {
  // 合并后的检查接口，同时检查文件是否存在和获取已存在的分片列表
  const { chunks, fileExists } = await request.post(`${apiPrefix}/check`, {
    ext: file.name.split('.').pop(),
    hash: fileHash,
  });

  if (fileExists) {
    throw new Error('文件已存在');
  }

  return chunks;
};

/**
 * 上传单个分片
 * @param chunk 分片对象
 * @param fileHash 文件的MD5哈希值
 * @param chunkIndex 分片索引
 * @param chunkCount 分片总数
 * @returns 上传结果
 */
const uploadSingleChunk = async (
  chunk: Blob,
  fileHash: string,
  chunkIndex: number,
  chunkCount: number,
) => {
  const formData = new FormData();
  formData.append('chunk', chunk);

  const params = new URLSearchParams({
    filename: file.name,
    hash: fileHash,
    index: chunkIndex.toString(),
    total: chunkCount.toString(),
  });

  await request.post(`${apiPrefix}/upload?${params}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return true;
};

/**
 * 合并分片
 * @param fileHash 文件的MD5哈希值
 * @param filename 文件名
 * @returns 合并结果
 */
const mergeChunks = async (fileHash: string, filename: string) => {
  await request.post(`${apiPrefix}/merge`, {
    chunkSize: CHUNK_SIZE,
    filename,
    hash: fileHash,
  });
  return true;
};

/**
 * 处理文件选择事件
 * @param e 文件选择事件
 */
const handleFileSelect = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    uploading.value = true;
    error.value = null;
    success.value = null;
    progress.value = 0;

    // 计算文件哈希
    const fileHash = await calculateFileHash(file);

    // 检查文件和分片
    const existingChunks = await checkFileAndChunks(file, fileHash);

    const chunkSize = CHUNK_SIZE;
    const chunkCount = Math.ceil(file.size / chunkSize);
    const chunksToUpload = Array.from(
      { length: chunkCount },
      (_, i) => i,
    ).filter((i) => !existingChunks.includes(i));

    // 并发上传分片
    const uploadPromises = [];
    for (let i = 0; i < chunksToUpload.length; i += CONCURRENT_LIMIT) {
      const batch = chunksToUpload.slice(i, i + CONCURRENT_LIMIT);
      const batchPromises = batch.map((chunkIndex) => {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        return uploadSingleChunk(chunk, fileHash, chunkIndex, chunkCount)
          .then(() => {
            progress.value = Math.round(
              ((existingChunks.length + batch.indexOf(chunkIndex) + 1) /
                chunkCount) *
                100,
            );
          })
          .catch((error) => {
            error.value = `分片 ${chunkIndex} 上传失败`;
            throw error;
          });
      });
      uploadPromises.push(Promise.all(batchPromises));
    }

    await Promise.all(uploadPromises);

    // 合并分片
    await mergeChunks(fileHash, file.name);

    success.value = '文件上传成功';
  } catch (error: any) {
    error.value = error.message;
  } finally {
    uploading.value = false;
  }
};

const handleUpload = () => {
  inputRef.value.click();
};
</script>

<template>
  <div class="stall-jssdk__file-uploader-container">
    <input
      ref="fileInput"
      class="stall-jssdk__file-uploader-input"
      type="file"
      @change="handleFileSelect"
    />
    <Button
      type="primary"
      :loading="uploading"
      :disabled="uploading"
      @click="handleUpload"
    >
      <template #icon>
        <IconUpload />
      </template>
      <template #default>
        {{ uploading ? `上传中 (${progress}%)` : '上传文件' }}
      </template>
    </Button>
    <Alert v-if="success" type="success">{{ success }}</Alert>
    <Alert v-if="error" type="error">{{ error }}</Alert>
  </div>
</template>

<style lang="less">
@import url('@arco-design/web-vue/es/index.css');

.stall-jssdk__file-uploader-container {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.stall-jssdk__file-uploader-input {
  display: none;
}
</style>
