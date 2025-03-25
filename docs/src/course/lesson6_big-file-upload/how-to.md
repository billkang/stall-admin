# 大文件分片上传：实现指南与最佳实践

## 概述

大文件分片上传是处理大规模文件传输的关键技术，通过将文件分割成多个小片段进行独立传输，有效解决了网络不稳定、请求超时、服务器压力大等问题，同时支持断点续传、进度可视化和高效传输。本文将深入探讨大文件分片上传的实现细节，提供完整的前后端代码示例，并分享优化策略和最佳实践。

## 一、前端实现（Vue3）

### 1. 文件分片处理与哈希计算

```vue
<template>
  <div>
    <input type="file" @change="handleFileSelect" />
    <div v-if="totalProgress !== undefined">
      总进度：{{ totalProgress }}%
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import SparkMD5 from 'spark-md5';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB/分片
const CONCURRENT_NUM = 3; // 并发上传数量
const totalProgress = ref(undefined);

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 计算文件哈希
  const fileHash = await calculateFileHash(file);

  // 文件分片
  const chunks = createFileChunks(file, fileHash);

  // 上传分片
  await uploadChunks(chunks, file.name, fileHash);
};

// 计算文件哈希
const calculateFileHash = (file) => {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer();
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (e) => {
      spark.append(e.target.result);
      resolve(spark.end());
    };
  });
};

// 创建文件分片
const createFileChunks = (file, fileHash) => {
  const chunks = [];
  let cur = 0;
  while (cur < file.size) {
    const chunk = file.slice(cur, cur + CHUNK_SIZE);
    chunks.push({
      hash: `${fileHash}-${chunks.length}`,
      chunk: chunk,
      filename: file.name
    });
    cur += CHUNK_SIZE;
  }
  return chunks;
};
</script>
```

### 2. 分片上传控制与进度管理

```javascript
// 上传分片
const uploadChunks = async (chunks, filename, fileHash) => {
  // 验证已上传分片
  const { uploadedList } = await axios.get('/api/verify', {
    params: { hash: fileHash }
  });

  // 过滤已上传分片
  const filteredChunks = chunks.filter(chunk => !uploadedList.includes(chunk.hash));

  // 创建上传请求
  const uploadQueue = [];
  let currentIndex = 0;

  // 控制并发上传数量
  const uploadNextChunk = async () => {
    if (currentIndex >= filteredChunks.length) return;

    const chunk = filteredChunks[currentIndex];
    currentIndex++;

    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('chunk', chunk.chunk);
      formData.append('hash', chunk.hash);
      formData.append('filename', chunk.filename);

      axios.post('/api/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          chunk.progress = percentCompleted;
          updateTotalProgress(filteredChunks);
        }
      }).then(resolve);
    }).then(uploadNextChunk);
  };

  // 启动上传
  await uploadNextChunk();

  // 通知合并文件
  await axios.post('/api/merge', {
    hash: fileHash,
    filename: filename,
    chunkSize: CHUNK_SIZE
  });
};

// 更新总进度
const updateTotalProgress = (chunks) => {
  if (!chunks.length) return;

  const total = chunks.reduce((acc, cur) => acc + (cur.progress || 0), 0);
  totalProgress.value = Math.round(total / chunks.length);
};
```

## 二、后端实现（Node.js + Koa）

### 1. 基础配置与中间件

```javascript
// server.js
const Koa = require('koa');
const Router = require('@koa/router');
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');

const app = new Koa();
const router = new Router();
const UPLOAD_DIR = path.resolve(__dirname, 'uploads');

// 确保上传目录存在
fs.ensureDirSync(UPLOAD_DIR);

// 验证文件类型
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'];
  return allowedTypes.includes(file.mimetype);
};

// 验证文件大小
const validateFileSize = (file) => {
  const maxSize = 1024 * 1024 * 1024; // 1GB
  return file.size <= maxSize;
};

// 验证中间件
const validateFile = async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.path === '/api/upload') {
    if (!ctx.request.files || !ctx.request.files.chunk) {
      ctx.status = 400;
      ctx.body = { code: 1, message: '未上传文件' };
      return;
    }

    const file = ctx.request.files.chunk;
    if (!validateFileType(file)) {
      ctx.status = 400;
      ctx.body = { code: 1, message: '不允许的文件类型' };
      return;
    }

    if (!validateFileSize(file)) {
      ctx.status = 400;
      ctx.body = { code: 1, message: '文件过大' };
      return;
    }
  }

  await next();
};

app.use(validateFile);
```

### 2. 核心接口实现与文件处理

```javascript
// 存储配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, req.body.hash)
});

const upload = multer({ storage });

// 验证接口
router.get('/verify', async (ctx) => {
  const { hash } = ctx.query;
  const chunkDir = path.resolve(UPLOAD_DIR, hash);

  // 获取已上传分片列表
  const uploadedList = fs.existsSync(chunkDir)
    ? await fs.readdir(chunkDir)
    : [];

  ctx.body = { uploadedList };
});

// 分片上传接口
router.post('/upload', upload.single('chunk'), async (ctx) => {
  const { hash } = ctx.request.body;
  const chunkDir = path.resolve(UPLOAD_DIR, hash);

  // 创建分片目录
  await fs.ensureDir(chunkDir);

  // 移动文件到分片目录
  await fs.move(
    path.resolve(UPLOAD_DIR, hash),
    path.resolve(chunkDir, hash),
    { overwrite: true }
  );

  ctx.body = { code: 0, message: '上传成功' };
});

// 合并文件接口
router.post('/merge', async (ctx) => {
  const { hash, filename, chunkSize } = ctx.request.body;
  const chunkDir = path.resolve(UPLOAD_DIR, hash);
  const chunks = await fs.readdir(chunkDir);

  // 按序号排序分片
  chunks.sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));

  // 合并文件
  const filePath = path.resolve(UPLOAD_DIR, filename);
  const writeStream = fs.createWriteStream(filePath);

  for (const chunkName of chunks) {
    const chunkPath = path.resolve(chunkDir, chunkName);
    const readStream = fs.createReadStream(chunkPath);
    await new Promise((resolve, reject) => {
      readStream.on('end', resolve);
      readStream.on('error', reject);
      readStream.pipe(writeStream, { end: false });
    });
  }

  writeStream.end();

  // 清理临时目录
  await fs.remove(chunkDir);
  ctx.body = { code: 0, message: '合并成功' };
});
```

## 三、优化扩展点

### 1. 进度显示优化

```javascript
// 前端增加进度监控
const totalProgress = ref(0);

// 在上传请求中添加onUploadProgress
const createUploadRequest = (chunk) => {
  const formData = new FormData();
  formData.append('chunk', chunk.chunk);
  formData.append('hash', chunk.hash);
  formData.append('filename', chunk.filename);

  return axios.post('/api/upload', formData, {
    onUploadProgress: (progressEvent) => {
      chunk.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      updateTotalProgress(filteredChunks);
    }
  });
};
```

### 2. 断点续传策略

- 通过文件哈希值标识唯一文件
- 服务端记录已上传分片信息
- 上传前先查询已上传分片列表

```javascript
// 上传前验证已上传分片
const { uploadedList } = await axios.get('/api/verify', {
  params: { hash: fileHash }
});

// 过滤已上传分片
const filteredChunks = chunks.filter(chunk => !uploadedList.includes(chunk.hash));
```

### 3. 秒传功能

```javascript
// 合并前检查文件是否存在
router.post('/merge', async (ctx) => {
  const { hash, filename } = ctx.request.body;
  const filePath = path.resolve(UPLOAD_DIR, filename);

  if (fs.existsSync(filePath)) {
    ctx.body = { code: 0, message: '文件已存在' };
    return;
  }

  // 继续合并逻辑...
});
```

### 4. 分片大小优化

- 根据网络环境动态调整分片大小
- 推荐范围：1MB~10MB
- 考虑公式：Math.ceil(file.size / (5 * 1024 * 1024))

```javascript
// 根据文件大小动态调整分片大小
const calculateChunkSize = (fileSize) => {
  if (fileSize < 10 * 1024 * 1024) return 1 * 1024 * 1024; // 小于10MB，1MB/分片
  if (fileSize < 100 * 1024 * 1024) return 5 * 1024 * 1024; // 10MB-100MB，5MB/分片
  return 10 * 1024 * 1024; // 大于100MB，10MB/分片
};

const CHUNK_SIZE = calculateChunkSize(file.size);
```

## 四、部署注意事项

1. **文件存储建议使用云存储服务（如AWS S3、OSS）**
   - 利用云存储的高可用性和扩展性
   - 减轻服务器存储压力
   - 提供CDN加速访问

2. **增加身份验证中间件**
   - 使用JWT或OAuth2.0进行用户认证
   - 保护上传接口，防止未授权访问

3. **限制单用户并发上传数**
   - 防止服务器过载
   - 公平分配资源

4. **配置合理的请求超时时间**
   - 根据网络环境和文件大小调整
   - 避免过早中断大文件上传

5. **添加文件类型白名单验证**
   - 限制允许上传的文件类型
   - 防止恶意文件上传

6. **实现自动清理过期临时文件**
   - 定期清理未完成合并的分片文件
   - 节省存储空间

## 五、安全与性能优化

### 1. 安全性增强

```javascript
// 验证文件内容
const validateFileContent = async (file) => {
  const allowedMagicNumbers = {
    'ffd8ffe0': ['image/jpeg'], // JPEG
    '89504e47': ['image/png'], // PNG
    '25504446': ['application/pdf'], // PDF
    '00000018': ['video/mp4'] // MP4
  };

  const buffer = await fs.readFile(file.path);
  const magicNumber = buffer.toString('hex', 0, 4);

  return allowedMagicNumbers[magicNumber]?.includes(file.mimetype) || false;
};

// 在验证中间件中添加文件内容验证
const validateFile = async (ctx, next) => {
  if (ctx.request.method === 'POST' && ctx.request.path === '/api/upload') {
    // ...其他验证逻辑...

    if (ctx.request.files && ctx.request.files.chunk) {
      const file = ctx.request.files.chunk;
      const isValid = await validateFileContent(file);
      if (!isValid) {
        ctx.status = 400;
        ctx.body = { code: 1, message: '不允许的文件内容' };
        return;
      }
    }
  }

  await next();
};
```

### 2. 性能优化

```javascript
// 使用内存映射文件进行快速合并
router.post('/merge', async (ctx) => {
  // ...合并前的逻辑...

  const fileDescriptor = await fs.open(filePath, 'w');
  for (const [index, chunkName] of chunks.entries()) {
    const chunkPath = path.resolve(chunkDir, chunkName);
    const chunkDescriptor = await fs.open(chunkPath, 'r');
    await chunkDescriptor.copyRange(fileDescriptor, index * chunkSize, 0, chunkSize);
    await chunkDescriptor.close();
  }
  await fileDescriptor.close();

  // ...清理逻辑...
});
```

## 六、总结

该方案通过分片上传实现了大文件可靠传输，结合Vue3的响应式特性和Koa的轻量级优势，构建了高性能的文件上传系统。开发者可根据实际业务需求扩展文件管理、权限控制等功能，建议结合Web Worker优化前端哈希计算性能，进一步提升用户体验。
