const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Op } = require('sequelize');
const { User, Post, Image, Comment } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

// 회원가입 - POST /user/
router.post('/', async (req, res, next) => {
  try {
    // 이미 존재하는 이메일인지 체크
    const exUser = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (exUser) {
      res.status(403).send('이미 가입된 이메일입니다.');
      return;
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // 테이블 안에 데이터를 넣습니다.
    await User.create({
      email: req.body.email,
      nickname: req.body.nickname,
      password: hashedPassword,
    }); // await을 붙혀서 이게 실행된 후에 밑에 코드가 실행됩니다.
    res.status(201).send('ok');
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 새로고침하거나 할 때, 내 로그인 정보 불러오기 - GET /user/
router.get('/', async (req, res, next) => {
  try {
    if (req.user) {
      const userWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        attributes: { exclude: ['password'] }, // 비밀번호 제외
        include: [
          { model: Post, attributes: ['id'] },
          { model: User, as: 'Followers', attributes: ['id'] },
          { model: User, as: 'Followings', attributes: ['id'] },
        ],
      });
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(200).json(null);
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 로그인 - POST /user/login
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error(err);
      next(err);
    }
    if (info) {
      return res.status(401).send(info.reason);
    }
    return req.login(user, async loginErr => {
      if (loginErr) {
        console.error(loginErr);
        return next(loginErr);
      }

      // 비밀번호는 굳이 프론트로 보내줄 필요가 없어서 제외해주고 Post 정보도 같이 넣어줌
      const userWithoutPassword = await User.findOne({
        where: { id: user.id },
        attributes: { exclude: ['password'] }, // 비밀번호 제외
        include: [
          { model: Post, attributes: ['id'] },
          { model: User, as: 'Followers', attributes: ['id'] },
          { model: User, as: 'Followings', attributes: ['id'] },
        ],
      });

      return res.status(200).json(userWithoutPassword); // 완료되면 유저정보를 프론트로 보내줌
    });
  })(req, res, next);
});

// 로그아웃 - POST /user/logout
router.post('/logout', isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('ok');
});

// 프로필 수정 - PATCH /user/profile
router.patch('/profile', isLoggedIn, async (req, res, next) => {
  try {
    User.update(
      {
        nickname: req.body.nickname,
        introduction: req.body.introduction,
        avatar: req.body.avatar,
      },
      { where: { id: req.user.id } } // 조건 : 내 아이디의 프로필을 수정해야함
    );
    res.status(200).json({
      nickname: req.body.nickname,
      introduction: req.body.introduction,
      avatar: req.body.avatar,
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// Cloudinary로 대체했습니다.
// // 프로필 이미지 첨부 - POST /user/image
// const upload = multer({
//   storage: multer.diskStorage({
//     destination(_req, _file, done) {
//       done(null, 'uploads');
//     },
//     filename(_req, file, done) {
//       // ex) kim.png
//       const ext = path.extname(file.originalname); // 확장자 추출 - png
//       const basename = path.basename(file.originalname, ext); // 이름 추출 - kim
//       done(null, basename + '_' + new Date().getTime() + ext); // kim 뒤에 시간초가 붙음 (중복방지)
//     },
//   }),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20mb
// });
// // upload. array는 여러개의 사진 single은 하나의 사진 이미지가 없으면 none()
// router.post('/image', isLoggedIn, upload.single('file'), (req, res) => {
//   res.json(req.file.filename);
// });

// 팔로우 - PATCH /user/:userId/follow
router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } }); // 팔로우 하려는 유저가 있는지 확인
    if (!user) {
      res.status(403).send('팔로우하려는 사람이 존재하지 않습니다.');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 팔로우 취소 - DELETE /user/:userId/follow
router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } }); // 팔로우 하려는 유저가 있는지 확인
    if (!user) {
      res.status(403).send('언팔로우하려는 사람이 존재하지 않습니다.');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 팔로워 삭제 - DELETE /user/follower/:userId
router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } }); // 로그인된 본인을 찾습니다.
    if (!user) {
      res.status(403).send('삭제할 팔로워가 없습니다.');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 팔로우 목록 가져오기 - GET /user/followers
router.get('/followers', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 로그인 된 본인을 찾습니다.
    if (!user) {
      res.status(403).send('존재하지 않는 사용자입니다.');
    }
    const followers = await user.getFollowers({
      limit: parseInt(req.query.limit, 10)
        ? parseInt(req.query.limit, 10)
        : null,
      attributes: ['id', 'nickname', 'avatar'],
    });
    res.status(200).json(followers);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 팔로잉 목록 가져오기 - GET /user/followings
router.get('/followings', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); // 로그인 된 본인을 찾습니다.
    if (!user) {
      res.status(403).send('존재하지 않는 사용자입니다.');
    }
    const followings = await user.getFollowings({
      limit: parseInt(req.query.limit, 10)
        ? parseInt(req.query.limit, 10)
        : null,
      attributes: ['id', 'nickname', 'avatar'],
    });
    res.status(200).json(followings);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 특정 사용자 정보 불러오기 - GET /user/:userId
router.get('/:userId', async (req, res, next) => {
  try {
    const userWithoutPassword = await User.findOne({
      where: { id: req.params.userId },
      attributes: { exclude: ['password'] }, // 비밀번호 제외
      include: [
        { model: Post, attributes: ['id'] },
        { model: User, as: 'Followers', attributes: ['id'] },
        { model: User, as: 'Followings', attributes: ['id'] },
      ],
    });

    // userId가 존재하지 않는 아아디일 경우.
    if (userWithoutPassword) {
      // 다른 사용자의 정보를 가져오기 때문에, toJSON으로 해서 각각의 데이터의 length만 챙겨와서 보내줍니다. (개인정보 보호)
      const data = userWithoutPassword.toJSON();
      data.Posts = data.Posts.length;
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      res.status(200).json(data);
    } else {
      res.status(404).json('사용자가 존재하지 않습니다.');
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
});

// 해당 사용자의 게시글 불러오기 - GET /user/:userId/posts
router.get('/:userId/posts', async (req, res, next) => {
  try {
    const where = { UserId: req.params.userId };
    if (parseInt(req.query.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where,
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, attributes: ['id', 'nickname', 'avatar'] },
        { model: Image },
        {
          model: Comment,
          include: [{ model: User, attributes: ['id', 'nickname', 'avatar'] }],
        },
        { model: User, as: 'Likers', attributes: ['id'] },
        {
          model: Post,
          as: 'Scrap',
          include: [
            { model: User, attributes: ['id', 'nickname', 'avatar'] },
            { model: Image },
          ],
        },
      ],
    });
    res.status(200).json(posts);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;

/* 
error number 백번대
200 - 성공
300 - 리다이렉트 or 캐싱
400 - 클라이언트 에러
500 - 서버 에러
*/
