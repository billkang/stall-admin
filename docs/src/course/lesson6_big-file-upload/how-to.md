# 大文件分片上传实现指南

## 概述
大文件分片上传是应对大体积文件传输的核心解决方案，通过将文件切割为多个片段进行传输，有效解决以下问题：
- 网络中断后断点续传
- 避免单次请求超时
- 降低服务器内存压力
- 实现上传进度可视化
- 支持并行上传加速传输

## 一、前端实现（Vue3）

### 1. 文件分片处理
```vue
<template>
  <input type="file" @change="handleFileSelect" />
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import SparkMD5 from 'spark-md5';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB/分片

const handleFileSelect = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 生成文件指纹
  const fileHash = await calculateFileHash(file);
  
  // 文件分片
  const chunks = createFileChunks(file, fileHash);
  
  // 上传分片
  await uploadChunks(chunks, file.name, fileHash);
};

// 计算文件哈希
const calculateFileHash = (file) => {
  return new Promise(resolve => {
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

### 2. 分片上传控制
```javascript
// 上传分片
const uploadChunks = async (chunks, filename, fileHash) => {
  // 验证已上传分片
  const { uploadedList } = await axios.get('/api/verify', {
    params: { hash: fileHash }
  });

  // 创建上传请求
  const requests = chunks
    .filter(chunk => !uploadedList.includes(chunk.hash))
    .map(chunk => {
      const formData = new FormData();
      formData.append('chunk', chunk.chunk);
      formData.append('hash', chunk.hash);
      formData.append('filename', filename);
      return axios.post('/api/upload', formData);
    });

  // 并行上传（可控制并发数）
  await Promise.all(requests);
  
  // 通知合并文件
  await axios.post('/api/merge', {
    hash: fileHash,
    filename: filename,
    chunkSize: CHUNK_SIZE
  });
};
```

## 二、后端实现（Node.js + Koa）

### 1. 基础配置
```javascript
// server.js
const Koa = require('koa');
const Router = require('@koa/router');
const multer = require('@koa/multer');
const path = require('path');
const fs = require('fs-extra');

const app = new Koa();
const router = new Router();
const UPLOAD_DIR = path.resolve(__dirname, 'uploads');

// 确保上传目录存在
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, req.body.hash)
});

const upload = multer({ storage });
```

### 2. 核心接口实现
```javascript
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
router.post('/upload', upload.single('chunk'), (ctx) => {
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
  await Promise.all(
    chunks.map((chunkName, index) => 
      fs.pipe(
        fs.createReadStream(path.resolve(chunkDir, chunkName)),
        fs.createWriteStream(filePath, { 
          start: index * chunkSize 
        })
      )
    )
  );

  // 清理临时目录
  await fs.remove(chunkDir);
  ctx.body = { code: 0, message: '合并成功' };
});
```

## 三、优化扩展点

1. **进度显示优化**
```javascript
// 前端增加进度监控
const totalProgress = ref(0);

// 在上传请求中添加onUploadProgress
const createUploadRequest = (chunk) => {
  const formData = /*...*/;
  return axios.post('/api/upload', formData, {
    onUploadProgress: progress => {
      chunk.progress = Math.round(
        (progress.loaded / progress.total) * 100
      );
      totalProgress.value = chunks
        .reduce((acc, cur) => acc + (cur.progress || 0), 0) 
        / chunks.length;
    }
  });
};
```

2. **断点续传策略**
- 通过文件哈希值标识唯一文件
- 服务端记录已上传分片信息
- 上传前先查询已上传分片列表

3. **秒传功能**
```javascript
// 合并前检查文件是否存在
if (fs.existsSync(filePath)) {
  ctx.body = { code: 0, message: '文件已存在' };
  return;
}
```

4. **分片大小优化**
- 根据网络环境动态调整分片大小
- 推荐范围：1MB~10MB
- 考虑公式：Math.ceil(file.size / (5 * 1024 * 1024))

## 四、部署注意事项

1. 文件存储建议使用云存储服务（如AWS S3、OSS）
2. 增加身份验证中间件
3. 限制单用户并发上传数
4. 配置合理的请求超时时间
5. 添加文件类型白名单验证
6. 实现自动清理过期临时文件

---

## 总结
该方案通过分片上传实现了大文件可靠传输，结合Vue3的响应式特性和Koa的轻量级优势，构建了高性能的文件上传系统。开发者可根据实际业务需求扩展文件管理、权限控制等功能，建议结合Web Worker优化前端哈希计算性能，进一步提升用户体验。
