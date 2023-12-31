const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const User = require("../../modules/User");
const Post = require("../../modules/Post");
const Profile = require("../../modules/Profile");

// @route   GET api/user
// @desc    Test route
// @access  Public
router.get(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id).select("-password");

    try {
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/posts
// @desc    get all posts
// @access  private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});
// @route   GET api/posts/:id
// @desc    get all posts
// @access  private

router.get("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    if (!posts) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(posts);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   delet api/posts/:id
// @desc    get all posts
// @access  private

router.delete("/", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);
    if (posts.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await posts.remove();

    res.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   put api/posts/like/:id
// @desc    get all posts
// @access  private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      posts.likes.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(404).json({ msg: "Post already liked" });
    }

    posts.likes.unshift({ user: req.user.id });

    await posts.save();

    res.json(posts.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   put api/posts/unlike/:id
// @desc    get all posts
// @access  private

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    //check if the post has already been liked
    if (
      posts.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(404).json({ msg: "Post has not yet been liked" });
    }

    //get remove index
    const removeIndex = posts.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    posts.likes.splice(removeIndex, 1);

    await posts.save();

    res.json(posts.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   delet api/posts/comment/:id/:comment_id
// @desc    delete comment
// @access  private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    //pull out comment
    const comment = posts.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }

    //check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "User not authorized" });
    }

    //get remove index
    const removeIndex = posts.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);

    posts.comments.splice(removeIndex, 1);

    await posts.save();

    res.json(posts.comments);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
