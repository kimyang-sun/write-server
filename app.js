const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');

const db = require('./models');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const hashtagRouter = require('./routes/hashtag');
const passportConfig = require('./passport');

const http = require('http');
setInterval(function () {
  http.get('http://write-mind.herokuapp.com');
}, 600000);

const PORT = process.env.PORT || 3006;
dotenv.config();
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log('데이터베이스 연결 성공 😶');
  })
  .catch(console.error);
passportConfig();

app.use(
  cors({
    origin: 'https://write-mind.vercel.app',
    credentials: true,
  })
);

// 현재 back 폴더 안에 uploads로 합쳐줌, 프론트에서는 백엔드의 폴더 구조를 모름
// 그래서 http://localhost:3006/ 이 백엔드 서버로 접근 가능하도록 '/'으로 해줌
// app.use('/', express.static(path.join(__dirname, 'uploads')));

// 이 코드는 위에쪽에 있어야함.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      domain: '.write-mind.vercel.app',
      secure: true,
      sameSite: 'none',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/post', postRouter);
app.use('/posts', postsRouter);
app.use('/hashtag', hashtagRouter);

app.listen(PORT, () => {
  console.log('서버 실행중 😶');
});

/*  보통은 이렇게 사용합니다.
app.get = 가져오기
app.post = 생성,등록하기
app.put = 전체 수정하기
app.patch = 부분 수정하기
app.delete = 제거하기
app.options = 서버에게 요청을 알리기
app.head = Header만 가져오기
*/
