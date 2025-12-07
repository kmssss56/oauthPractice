const express = require('express');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 구글 설정 (Vercel 환경변수에서 가져옴)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI // 중요: Vercel 주소/auth/google/callback
);

// 1. 로그인 버튼 보여주기
app.get('/', (req, res) => {
  res.send(`
    <h1>Google 로그인 실습</h1>
    <a href="/auth/google">
      <button style="padding:10px; font-size:16px;">구글로 로그인하기</button>
    </a>
  `);
});

// 2. 구글 로그인 페이지로 이동시키기
app.get('/auth/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });
  res.redirect(authorizationUrl);
});

// 3. 구글에서 로그인 하고 돌아왔을 때 처리 (콜백)
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('코드가 없습니다.');

  try {
    // 구글이 준 암호표(Code)를 진짜 열쇠(Token)로 교환
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // 사용자 정보 가져오기
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    const userInfo = await oauth2.userinfo.get();

    // 성공 화면 출력
    res.send(`
      <h1>로그인 성공! 🎉</h1>
      <p>이름: ${userInfo.data.name}</p>
      <p>이메일: ${userInfo.data.email}</p>
      <img src="${userInfo.data.picture}" alt="프로필사진">
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('로그인 에러 발생: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});