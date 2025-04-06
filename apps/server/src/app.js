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
    // 从请求参数中获取 hash
    const { hash } = req.query;
    const chunkDir = path.resolve(TEMP_DIR, hash);
    fs.mkdirSync(chunkDir, { recursive: true }); // 更安全的目录创建方式
    cb(null, chunkDir);
  },
  filename: (req, file, cb) => {
    const { index } = req.query;
    cb(null, `${index}`);
  },
});

const upload = multer({ storage });

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

// 上传分片
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

// 合并分片
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

app.listen(4100, () => {
  console.log('Server running on port 4100');
});
