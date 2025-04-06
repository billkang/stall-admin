# 大文件上传核心API解析

## 一、文件处理基础：前端FileReader API

### 1.1 简介
`FileReader` 是 HTML5 提供的核心 API，用于在浏览器端异步读取文件内容。它允许开发者通过 JavaScript 操作用户选择的文件（如图片、文档等），并将其转换为可处理的格式（如二进制数据、文本或 Base64 编码的字符串）。其核心特性包括：  
- **非阻塞操作**：通过事件驱动机制避免页面卡顿。  
- **灵活的编码支持**：支持二进制、文本、Base64 等多种数据格式。  
- **分片读取能力**：结合 `Blob.slice()` 实现大文件分片处理。

**注意**：`FileReader` 不支持超过 2GB 的文件（部分浏览器限制），且在处理大文件时需配合分片操作以避免内存溢出。

### 1.2 API核心方法解析
```javascript
const reader = new FileReader();

// 读取方法族
reader.readAsArrayBuffer(blob)  // 返回二进制原始数据（ArrayBuffer）
reader.readAsDataURL(blob)      // 返回 Base64 编码的 Data URL（如图片预览）
reader.readAsText(blob, 'UTF-8')// 将文件内容解码为文本（支持自定义编码）

// 已废弃方法（不推荐使用）
reader.readAsBinaryString(blob) // 返回原始二进制字符串（仅兼容旧浏览器）

// 事件处理
reader.onloadstart = () => { console.log('开始读取'); };
reader.onprogress = (e) => { 
    const percent = (e.loaded / e.total) * 100;
    console.log(`进度：${percent.toFixed(2)}%`);
};
reader.onload = (e) => { 
    const result = e.target.result; // 获取读取结果
    console.log('读取成功:', result);
};
reader.onerror = () => { console.error('读取失败'); };
reader.onloadend = () => { console.log('读取结束'); };
```

### 1.3 适用场景分析
| 场景类型          | 技术方案                     | 典型用例                 | 示例代码片段 |
|-------------------|-----------------------------|------------------------|-------------|
| 小文件预览        | `readAsDataURL`             | 图片缩略图生成          | const img = new Image(); img.src = reader.result; |
| 文本解析          | `readAsText`                | CSV 文件解析            | const csvLines = result.split('\n'); |
| 二进制处理        | `readAsArrayBuffer`         | 文件分片、哈希计算      | const buffer = new Uint8Array(result); |

### 1.4 优缺点对比
**优势：**  
- 原生支持，无需插件。  
- 支持多种编码格式转换。  
- 可与 `Blob` 结合实现分片读取。  

**局限：**  
- 同步回调模式可能导致代码嵌套复杂。  
- 大文件全量读取可能占用大量内存（需配合分片）。  
- 不支持超过 2GB 文件（部分浏览器限制）。  

---

## 二、流式传输引擎：Node.js Stream

### 2.1 简介
Node.js 的 `Stream` 模块是处理流式数据的核心机制，通过事件驱动和非阻塞 I/O 实现高效的大文件传输。其核心设计思想是将数据分为多个小块（chunk）逐次处理，避免一次性加载全部数据到内存，从而降低资源消耗。

Stream 分为四类：  
- **可读流（Readable）**：用于读取数据（如文件、网络请求）。  
- **可写流（Writable）**：用于写入数据（如文件、数据库）。  
- **双工流（Duplex）**：同时支持读写（如 TCP 连接）。  
- **转换流（Transform）**：处理数据并输出（如加密、解压）。

### 2.2 核心API架构
```javascript
const { Readable, Writable, Transform } = require('stream');

// 自定义可读流
class MyReadable extends Readable {
    _read() { // 读取时触发
        const chunk = getSomeData(); // 获取数据块
        if (chunk) this.push(chunk); // 推送数据
        else this.push(null);        // 结束流
    }
}

// 自定义可写流
const writer = new Writable({
    write(chunk, encoding, callback) {
        console.log(`写入数据：${chunk.toString()}`);
        callback(); // 调用回调表示处理完成
    }
});

// 自定义转换流（如加密）
const cryptoStream = new Transform({
    transform(chunk, encoding, callback) {
        const encrypted = encrypt(chunk); // 加密逻辑
        this.push(encrypted);
        callback();
    }
});
```

### 2.3 工程实践场景
#### 典型应用模式
```mermaid
graph LR
A[客户端请求] --> B[HTTP 请求体（IncomingMessage）]
B --> C[解压流（如 zlib.Unzip）]
C --> D[加密流（如 crypto.createDecipher）]
D --> E[文件写入流（fs.createWriteStream）]
```

#### 适用场景
- **实时视频转码**：边上传边压缩视频流。  
- **日志分析**：逐行处理日志文件并统计关键指标。  
- **ETL 数据处理**：将 CSV 文件转换为 JSON 并写入数据库。  

### 2.4 性能基准对比
| 处理方式 | 内存消耗（1GB 文件） | 处理耗时 | 异常恢复能力 | 适用场景 |
|---------|---------------------|----------|--------------|----------|
| 传统 Buffer | 1.2GB              | 12秒     | 无           | 小文件快速处理 |
| Stream 管道 | 5MB~50MB           | 15秒     | 支持断点续传 | 大文件/实时数据 |

**说明**：性能数据基于典型场景估算，实际性能可能因硬件和网络条件有所不同。

---

## 三、文件接收中间件：Multer 深度剖析

### 3.1 简介
Multer 是 Node.js 中用于处理 `multipart/form-data` 表单数据（如文件上传）的中间件。它通过解析 HTTP 请求体中的文件流，支持将文件存储到内存、磁盘或云存储，并提供丰富的配置选项（如文件类型校验、大小限制）。其核心设计目标是：  
- **高性能**：通过流式处理减少内存占用。  
- **易扩展**：支持自定义存储引擎。  
- **安全性**：内置文件类型、大小过滤机制。

### 3.2 核心配置参数
```javascript
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({ // 存储配置
        destination: (req, file, cb) => cb(null, '/tmp/uploads'), // 存储路径
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname) // 文件名
    }),
    limits: { // 限制配置
        fileSize: 5 * 1024 * 1024, // 单文件最大 5MB
        files: 5,                  // 最大上传文件数
        fieldNameSize: 100         // 字段名长度限制
    },
    fileFilter: (req, file, cb) => { // 文件类型校验
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('仅支持图片文件'));
        }
        cb(null, true);
    }
});
```

### 3.3 存储引擎对比
| 引擎类型         | 内存消耗 | 适用场景           | 性能表现 | 代码示例 |
|------------------|----------|--------------------|----------|----------|
| `memoryStorage`  | 高       | 小文件快速处理     | 快       | const upload = multer(); |
| `diskStorage`    | 低       | 大文件安全存储     | 中等     | const upload = multer({ storage: multer.diskStorage(...) }); |
| `s3Storage`      | 无       | 云原生应用（AWS）  | 依赖网络 | const s3Storage = require('multer-s3'); |
| `customStorage`  | 可变     | 特殊需求（如加密） | 自定义   | const customStorage = { _handleFile: ... }; |

### 3.4 企业级最佳实践
#### 混合存储策略
```javascript
const multer = require('multer');
const fs = require('fs');

// 自定义混合存储引擎
const hybridStorage = {
    _handleFile(req, file, cb) {
        if (file.size > 100 * 1024 * 1024) { // 大于 100MB 使用磁盘存储
            const diskStorage = multer.diskStorage({
                destination: '/tmp/uploads',
                filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
            });
            diskStorage._handleFile(req, file, cb);
        } else { // 小文件暂存内存
            const memoryStorage = multer.memoryStorage();
            memoryStorage._handleFile(req, file, cb);
        }
    },
    _removeFile(req, file, cb) {
        // 统一删除逻辑
        fs.unlink(file.path, cb);
    }
};

const upload = multer({ storage: hybridStorage });
```

#### 异常处理增强
```javascript
app.post('/upload', upload.array('files', 5), (req, res) => {
    res.status(200).json({ message: '上传成功' });
}, (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: '文件格式错误' });
    }
    next(err);
});
```

---

## 四、技术信息汇总

| 技术组合               | 适用场景                     | 优势                          | 注意事项                     | 成功案例 |
|------------------------|----------------------------|-------------------------------|------------------------------|----------|
| **FileReader + Stream** | 浏览器端大文件分片          | 内存占用低，支持断点续传      | 需处理分片顺序和哈希校验     | 视频平台上传（如 YouTube 1GB+ 文件） |
| **Multer + diskStorage** | 传统表单文件上传            | 配置简单，开箱即用            | 不支持超大文件（需分片）     | 企业级表单提交（如文档管理系统 <500MB） |
| **Stream + 云存储SDK**  | 企业级云原生应用            | 无缝对接云服务，扩展性强      | 依赖网络稳定性，成本较高     | 日志实时上传至 AWS S3（如云监控系统） |
