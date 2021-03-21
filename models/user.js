const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 기본적으로 들어있어 따로 안넣어줘도 됩니다.
        // allowNull false면 필수, unique는 고유의 값 (중복 X)
        // STRING, TEXT, BOOLEAN, INTEGER, FLOAT, DATATIME
        email: { type: DataTypes.STRING(30), allowNull: false, unique: true },
        nickname: { type: DataTypes.STRING(30), allowNull: false },
        password: { type: DataTypes.STRING(100), allowNull: false },
        introduction: { type: DataTypes.STRING(50), allowNull: true },
        avatar: { type: DataTypes.STRING(200), allowNull: true },
      },
      {
        modelName: 'User',
        tableName: 'users', // MySQL에는 users 테이블로 생성됩니다.
        charset: 'utf8',
        collate: 'utf8_general_ci', // 한글적용
        sequelize,
      }
    );
  }
  static associate(db) {
    db.User.hasMany(db.Post); // 유저가 게시글을 여러개 가질 수 있다.
    db.User.hasMany(db.Comment);
    db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' }); // 하나의 유저가 여러개의 게시글 좋아요가 가능하다. (중간 테이블의 이름을 Like로 변경)
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followers',
      foreignKey: 'FollowingId',
    }); // 나를 팔로우 한 사람을 찾으려면 팔로잉을 먼저 찾아야 합니다.
    db.User.belongsToMany(db.User, {
      through: 'Follow',
      as: 'Followings',
      foreignKey: 'FollowerId',
    });
  }
};
