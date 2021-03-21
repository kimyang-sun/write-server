const DataTypes = require('sequelize');
const { Model } = DataTypes;

module.exports = class Hashtag extends Model {
  static init(sequelize) {
    return super.init(
      {
        // id가 기본적으로 들어있어 따로 안넣어줘도 됩니다.
        content: { type: DataTypes.STRING(20), allowNull: false },
      },
      {
        modelName: 'Hashtag',
        tableName: 'hashtags',
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci', // 한글적용 이모티콘 저장을 위해 mb4를 붙혀줍니다.
        sequelize,
      }
    );
  }
  static associate(db) {
    db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
  }
};
