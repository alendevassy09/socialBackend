const user = require("../services/userService");
module.exports = {
  Login: async (req, res, next) => {
    let userStatus = await user.login(req.body);

    res.json(userStatus);
  },
  Signup: async (req, res, next) => {
    await user.signup(req.body).then((response) => {
      res.json({ response });
    });
  },
  Search: async (req, res, next) => {
    let name = req.headers.name;

    await user.Search(name, req.user).then((response) => {
      res.json(response);
    });
  },
  Post: async (req, res, next) => {
    user.Post(req.body).then((response) => {
      res.json(response);
    });
  },
  getPosts: async (req, res, next) => {
    user.getPosts(req.user).then((posts) => {
      res.json(posts);
    });
  },
  GiveLike: (req, res, next) => {
    user.GiveLike(req.body).then((response) => {
      res.json(response);
    });
  },
  Comment: (req, res, next) => {
    user.GiveComment(req.body).then(() => {
      res.json({ status: true });
    });
  },
  Follow: (req, res, next) => {
    user.Follow(req.body).then((response) => {
      res.json(response);
    });
  },
  getFriends: (req, res, next) => {
    user.getFriends(req.user).then((response) => {
      res.json(response);
    });
  },
};
