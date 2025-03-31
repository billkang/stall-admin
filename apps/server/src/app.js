const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

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
    // 从请求参数中获取 hash（注意这里使用 req.query 替代 req.body）
    const { hash } = req.query; // 改为从 URL 参数获取
    const chunkDir = path.resolve(TEMP_DIR, hash);
    fs.mkdirSync(chunkDir, { recursive: true }); // 更安全的目录创建方式
    cb(null, chunkDir);
  },
  filename: (req, file, cb) => {
    const { index } = req.query; // 改为从 URL 参数获取
    cb(null, `${index}`);
  },
});

const upload = multer({ storage });

// 检查文件是否已存在
app.post('/api/files/check', (req, res) => {
  const { hash, ext } = req.body;
  const filename = `${hash}.${ext}`;
  const filePath = path.resolve(UPLOAD_DIR, filename);

  res.json({
    code: 0,
    data: {
      exists: fs.existsSync(filePath),
    }
  });
});

// 上传分片
app.post(
  '/api/files/upload',
  (req, res, next) => {
    // 手动解析 URL 参数（Express 默认不解析 POST 请求的 query 参数）
    req.query = { ...req.query, ...req.body };
    next();
  },
  upload.single('chunk'),
  (req, res) => {
    res.json({ code: 0, data: 'success' });
  },
);

// 合并分片
app.post('/api/files/merge', async (req, res) => {
  const { hash, filename, chunkSize } = req.body;
  const ext = path.extname(filename);
  const finalFilename = `${hash}${ext}`;
  const chunkDir = path.resolve(TEMP_DIR, hash);
  const chunks = fs.readdirSync(chunkDir);

  // 按索引排序
  chunks.sort((a, b) => a - b);

  // 合并文件
  const writeStream = fs.createWriteStream(
    path.resolve(UPLOAD_DIR, finalFilename),
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
  } catch (err) {
    res.status(500).json({ code: -1, error: '合并失败' });
  }
});

app.listen(4100, () => {
  console.log('Server running on port 4100');
});
