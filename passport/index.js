// const passport = require('passport');
// const local = require('./local');
// const { User } = require('../models');

// module.exports = () => {
//   passport.serializeUser((user, done) => {
//     done(null, user.id); // 첫번째 인자는 서버에러 두번째 인자는 성공
//   });

//   passport.deserializeUser(async (id, done) => {
//     try {
//       const user = await User.findOne({ where: { id } });
//       done(null, user);
//     } catch (e) {
//       console.error(e);
//       done(e);
//     }
//   });

//   local();
// };
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');
const bcrypt = require('bcrypt');
const { User } = require('../models');

const passportConfig = { usernameField: 'email', passwordField: 'password' };
const passportVerify = async (email, password, done) => {
  try {
    // 로그인시 해당 이메일의 유저가 있는지 체크
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return done(null, false, { reason: '가입되지 않은 이메일입니다.' });
    }

    // 비밀번호까지 일치하는지 체크
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      return done(null, user);
    }
    return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
  } catch (e) {
    console.error(e);
    return done(e);
  }
};

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'jwt-secret-key',
};
const JWTVerify = async (jwtPayload, done) => {
  try {
    // payload의 id값으로 유저의 데이터 조회
    const user = await User.findOne({ where: { id: jwtPayload.id } });
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    if (user) {
      done(null, user);
      return;
    }
    // 유저 데이터가 없을 경우 에러 표시
    done(null, false, { reason: '올바르지 않은 인증정보 입니다.' });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

module.exports = () => {
  passport.use('local', new LocalStrategy(passportConfig, passportVerify));
  passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
};
