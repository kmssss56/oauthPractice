const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('<h1>Vercel 배포 실습 성공! 🎉</h1><p>이제 깃허브랑 연결되었습니다.</p>');
});

// Vercel이 이 포트를 사용합니다.
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;