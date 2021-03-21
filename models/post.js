const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 기본적으로 들어있어 따로 안넣어줘도 됩니다.
        content: { type: DataTypes.TEXT, allowNull: false },
        tag: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        modelName: 'Post',
        tableName: 'posts',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 한글적용 이모티콘 저장을 위해 mb4를 붙혀줍니다.
        sequelize,
      }
    );
  }
  static associate(db) {
    // 관계를 설정해두면 post.addUser, post.removeUser, post.getUser, post.setUser등이 생김
    db.Post.belongsTo(db.User); // 게시글은 작성자에게 속해있다.
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
    db.Post.hasMany(db.Comment); // 이건 복수형으로 생김 post.addComments...
    db.Post.hasMany(db.Image);
    // 하나의 게시글이 여러 유저에게 좋아요를 받을 수 있다. 포스트에 좋아요 누른사람을 as로 구별해줌
    db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' }); // post.addLikers, post.removeLikers
    db.Post.belongsTo(db.Post, { as: 'Scrap' }); // 게시글 스크랩
  }
};
