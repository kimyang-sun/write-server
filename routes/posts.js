const express = require('express');
const { Op } = require('sequelize');
const { Post, User, Image, Comment } = require('../models');

const router = express.Router();

// 전체 글 불러오기 - GET /posts/
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    // 초기 로딩시에는 lastId가 0이 넘어옴. 이 밑은 초기로딩이 아닐때부터 실행됨.
    if (parseInt(req.query.lastId, 10)) {
      where.id = { [Op.lt]: parseInt(req.query.lastId, 10) };
    }
    const posts = await Post.findAll({
      where, // offset으로 하면 중간에 삭제하거나 추가하면 바뀔 수 있음
      limit: 5,
      order: [
        ['createdAt', 'DESC'], // 최신글이 맨 위로
        // 만약 댓글도 최신댓글이 맨 위로 나오게 하려면 이 코드를 넣어주면 됨
        // [Comment, 'createdAt', 'DESC'],
      ],
      include: [
        { model: User, attributes: ['id', 'nickname', 'avatar'] }, // 게시글 작성자
        { model: Image }, // 게시글 이미지
        {
          model: Comment, // 댓글
          include: [{ model: User, attributes: ['id', 'nickname', 'avatar'] }], // 댓글 작성자
        },
        { model: User, as: 'Likers', attributes: ['id'] }, // 좋아요 누른 사람
        {
          model: Post, // 스크랩 포스트
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

// 팔로우한 유저의 글 불러오기 - GET /posts/related
router.get('/related', async (req, res, next) => {
  try {
    const followings = await User.findAll({
      attributes: ['id'],
      include: [{ model: User, as: 'Followers', where: { id: req.user.id } }],
    });
    const where = { UserId: { [Op.in]: followings.map(value => value.id) } };

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

// 좋아요 누른 글 불러오기 - GET /posts/liked
router.get('/liked', async (req, res, next) => {
  try {
    const likes = await Post.findAll({
      attributes: ['id'],
      include: [{ model: User, as: 'Likers', where: { id: req.user.id } }],
    });
    const where = { id: { [Op.in]: likes.map(value => value.id) } };

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
