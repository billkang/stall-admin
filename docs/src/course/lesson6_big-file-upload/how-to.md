# 大文件上传技术解析：基于 Vue3 和 Express 的实现

## 一、引言

在当今数字化时代，随着数据量的爆炸式增长，文件上传功能已成为各类应用不可或缺的一部分。然而，传统的文件上传方式在面对大文件（如高清视频、大型文档等）时，往往暴露出诸多问题，如网络不稳定导致的上传失败、文件过大超出服务器或浏览器限制、上传效率低下等。为了解决这些问题，大文件上传技术应运而生。本文将深入探讨大文件上传技术的必要性、核心技术点以及基于 Vue3 和 Express 的实现方式。

## 二、大文件上传技术的必要性

### 2.1 传统文件上传的局限性

传统的文件上传方式通常将整个文件一次性上传到服务器。这种方式在面对小文件时表现良好，但在大文件上传场景下却存在诸多问题：
- **网络波动敏感**：在网络不稳定或带宽受限的情况下，上传过程极易中断，导致整个上传任务失败。
- **服务器压力大**：大文件一次性上传会对服务器造成巨大的内存和带宽压力，可能导致服务器崩溃或响应延迟。
- **用户体验差**：长时间的上传过程会使用户感到沮丧，尤其是在上传失败需要重新开始时。

### 2.2 大文件上传技术的优势

大文件上传技术通过一系列创新手段，有效解决了传统上传方式的局限性：
- **分片上传**：将大文件分割为多个小分片，每个分片独立上传，降低了单次上传的失败风险。
- **并发上传**：同时上传多个分片，显著提升上传效率。
- **断点续传**：支持从上次中断的位置继续上传，避免重复上传已成功部分，节省时间和带宽。
- **文件校验**：通过哈希算法确保文件完整性，避免数据丢失或损坏。

## 三、大文件上传的核心技术点

### 3.1 文件分片

文件分片是大文件上传技术的基础。通过将大文件分割为多个小分片，每个分片可以独立上传，降低了单次上传的失败风险。分片大小的选择需要根据网络状况和服务器限制进行权衡，通常在几兆字节到几十兆字节之间。

### 3.2 文件校验

文件校验是确保文件完整性和一致性的关键。在上传前，客户端计算文件的哈希值（如 MD5），并在上传完成后与服务器端计算的哈希值进行对比。如果两者一致，则文件完整无误；否则，需要重新上传。

### 3.3 并发上传

并发上传通过同时上传多个分片，显著提升上传效率。然而，并发数的设置需要谨慎，过多的并发可能会对服务器造成过大压力，导致性能下降甚至崩溃。

### 3.4 断点续传

断点续传允许从上次中断的位置继续上传，避免重复上传已成功部分，节省时间和带宽。这需要服务器能够记录已上传分片的状态，并在客户端请求时返回这些信息。

### 3.5 合并分片

在所有分片上传完成后，服务器需要将这些分片按顺序合并为完整的文件。这一过程需要确保分片的顺序正确，并验证合并后的文件完整性。

## 四、基于 Vue3 和 Express 的大文件上传实现

### 4.1 前端实现

#### 4.1.1 文件选择与分片

在 Vue3 中，用户通过文件选择器选择文件后，前端代码将文件分割为多个分片。每个分片的大小由 `CHUNK_SIZE` 决定，通常设置为 5MB。

```typescript
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
```

#### 4.1.2 文件哈希计算

使用 `SparkMD5` 库计算文件的 MD5 哈希值，确保文件的唯一性和完整性。

```typescript
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
```

#### 4.1.3 检查文件和分片状态

在上传前，前端向服务器发送请求，检查文件是否已存在以及哪些分片已成功上传。这一步骤支持断点续传功能。

```typescript
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

  return { chunks, fileExists };
};
```

#### 4.1.4 并发上传分片

前端通过控制并发数，同时上传多个分片，提升上传效率。上传进度通过计算已上传分片的比例实时更新。

```typescript
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
    const { chunks: existingChunks, fileExists } = await checkFileAndChunks(
      file,
      fileHash,
    );

    if (fileExists) {
      error.value = '文件已存在';
      return;
    }

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
        return uploadSingleChunk(file, chunk, fileHash, chunkIndex, chunkCount)
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
```

#### 4.1.5 上传单个分片

```typescript
/**
 * 上传单个分片
 * @param file 文件对象
 * @param chunk 分片对象
 * @param fileHash 文件的MD5哈希值
 * @param chunkIndex 分片索引
 * @param chunkCount 分片总数
 * @returns 上传结果
 */
const uploadSingleChunk = async (
  file: File,
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
```

#### 4.1.6 合并分片

```typescript
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
```

### 4.2 后端实现

#### 4.2.1 服务器配置

使用 Express 搭建服务器，配置中间件以支持文件上传和跨域请求。

```javascript
const fs = require('node:fs');
const path = require('node:path');

const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const UPLOAD_DIR = path.resolve(__dirname, 'uploads');
const TEMP_DIR = path.resolve(UPLOAD_DIR, 'temp');

// 确保目录存在
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { hash } = req.query;
    const chunkDir = path.resolve(TEMP_DIR, hash);
    fs.mkdirSync(chunkDir, { recursive: true });
    cb(null, chunkDir);
  },
  filename: (req, file, cb) => {
    const { index } = req.query;
    cb(null, `${index}`);
  },
});

const upload = multer({ storage });
```

#### 4.2.2 检查文件和分片状态

服务器提供接口，检查文件是否已存在以及哪些分片已成功上传。

```javascript
// 检查文件是否已存在
// 检查文件和分片是否存在
app.post('/api/files/check', async (req, res) => {
  const { hash, ext } = req.body;

  // 检查文件是否存在
  const filename = `${hash}.${ext}`;
  const filePath = path.resolve(UPLOAD_DIR, filename);
  const fileExists = fs.existsSync(filePath);

  // 获取已存在的分片列表
  const chunkDir = path.resolve(TEMP_DIR, hash);
  let chunks = [];
  if (fs.existsSync(chunkDir)) {
    chunks = fs
      .readdirSync(chunkDir)
      .map((file) => Number.parseInt(file))
      .filter((num) => !Number.isNaN(num))
      .sort((a, b) => a - b);
  }

  res.json({
    code: 0,
    data: {
      fileExists,
      chunks,
    },
  });
});
```

#### 4.2.3 分片上传

服务器接收分片上传请求，并将分片保存到临时目录。

```javascript
app.post(
  '/api/files/upload',
  (req, res, next) => {
    // 手动解析 URL 参数
    req.query = { ...req.query, ...req.body };
    next();
  },
  upload.single('chunk'),
  (req, res) => {
    res.json({ code: 0, data: 'success' });
  },
);
```

#### 4.2.4 合并分片

在所有分片上传完成后，服务器将分片按顺序合并为完整的文件。

```javascript
app.post('/api/files/merge', async (req, res) => {
  const { hash, filename } = req.body;
  const ext = path.extname(filename);
  const finalFilename = `${hash}${ext}`;
  const chunkDir = path.resolve(TEMP_DIR, hash);
  const chunks = fs.readdirSync(chunkDir);

  // 按索引排序
  chunks.sort((a, b) => a - b);

  // 合并文件
  const writeStream = fs.createWriteStream(
    path.resolve(UPLOAD_DIR, finalFilename),
    'utf8',
  );

  try {
    for (const chunk of chunks) {
      const chunkPath = path.resolve(chunkDir, chunk);
      const buffer = fs.readFileSync(chunkPath);
      writeStream.write(buffer);
      fs.unlinkSync(chunkPath); // 删除分片
    }

    writeStream.end();
    fs.rmdirSync(chunkDir); // 删除临时目录

    res.json({ code: 0, data: 'success' });
  } catch {
    res.status(500).json({ code: -1, error: '合并失败' });
  }
});
```

## 五、总结

大文件上传技术通过分片、并发、校验等手段，解决了传统上传方式的局限性，显著提升了上传效率和稳定性。结合 Vue3 和 Express 的实现，可以快速搭建一个高效、可靠的大文件上传系统。
