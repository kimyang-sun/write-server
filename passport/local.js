const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
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
      }
    )
  );
};
