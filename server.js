const express = require('express');
const path = require('path');
const app = express();

// เสิร์ฟไฟล์ Static ทั้งหมดจากโฟลเดอร์ src
app.use(express.static(path.join(__dirname, 'src')));

// ส่งหน้า index.html เมื่อมีผู้ใช้งานเปิดเข้ามา
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
