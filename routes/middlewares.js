exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next(); // 로그인이 안되어있으면 해당 코드가 실행
  } else {
    // 로그인이 되어있는데 또 로그인을 시도하려고 할 경우
    res.status(401).send('로그인하지 않은 사용자만 가능합니다.');
  }
};
