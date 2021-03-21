const express = require('express');
const { Op } = require('sequelize');
const { Post, Hashtag, User, Image, Comment } = require('../models');

const router = express.Router();

// 해당 해시태그의 게시글 불러오기 - GET /hashtag/:hashtag
router.get('/:hashtag', async (req, res, next) => {
  try {
    const where = {};
    if (parseInt(req.query.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where,
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Hashtag,
          where: { content: decodeURIComponent(req.params.hashtag) },
        },
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
