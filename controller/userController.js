const user = require("../services/userService");
module.exports = {
  Login: async (req, res, next) => {
    user
      .login(req.body)
      .then((userStatus) => {
        res.json(userStatus);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },
  PasswordUpdate: async (req, res, next) => {
    user
      .PasswordUpdate(req.body)
      .then((userStatus) => {
        res.json(userStatus);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },
  sendEmail: (req, res, next) => {
    user.sendEmail(req.headers.email).then((response) => {
      res.json(response);
    });
  },
  Signup: async (req, res, next) => {
     user.signup(req.body).then((response) => {
      res.json({ response });
    });
  },
  googleSignUp: async (req, res, next) => {
     user.googleSignUp(req.user).then((response) => {
      console.log("this is response",response);
      res.json( response );
    });
  },
  Search: async (req, res, next) => {
    let name = req.headers.name;

    await user.Search(name.trim(), req.user).then((response) => {
      res.json(response);
    });
  },
  Post: async (req, res, next) => {
    user.Post(req.body).then((response) => {
      res.json(response);
    });
  },
  getPosts: async (req, res, next) => {
    user
      .getPosts(req.user)
      .then((posts) => {
        res.json(posts);
      })
      .catch((err) => {
        next(err);
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
  notFollowed: (req, res, next) => {
    user.notFollowed(req.user).then((response) => {
      res.json(response);
    });
  },

  getChat: (req, res, next) => {
    let toUser = req.headers.touser;

    user.getChat(req.user, toUser).then((response) => {
      res.json(response);
    });
  },
  chatCreate: (req, res, next) => {
    let toUser = req.headers.touser;

    user
      .chatCreate(req.user, toUser, req.body.messages, req.body.to)
      .then((response) => {
        res.json(response);
      });
  },
  getUserChat: (req, res, next) => {
    user.getUserChat(req.user).then((response) => {
      res.json(response);
    });
  },
  setOnline: (req, res, next) => {
    let status = req.headers.status;
    user.setOnline(req.user, status).then((response) => {
      res.json(response);
    });
  },
  statusUpdate: (req, res, next) => {
    user.statusUpdate(req.body).then((response) => {
      res.json(response);
    });
  },
  getStory: (req, res, next) => {
    user.getStory(req.user).then((response) => {
      res.json(response);
    });
  },
  seenStory: (req, res, next) => {
    user.seenStory(req.body).then((response) => {
      res.json(response);
    });
  },
  Profile: (req, res, next) => {
    user.Profile(req.body).then((response) => {
      res.json(response);
    });
  },
  ProfilePicGet: (req, res, next) => {
    user.ProfilePicGet(req.user).then((response) => {
      res.json(response);
    });
  },
  Cover: (req, res, next) => {
    user.Cover(req.body).then((response) => {
      res.json(response);
    });
  },
  addBio: (req, res, next) => {
    user.addBio(req.body).then((response) => {
      res.json(response);
    });
  },
  editBio: (req, res, next) => {
    user.editBio(req.body).then((response) => {
      res.json(response);
    });
  },
  deleteBio: (req, res, next) => {
    user.deleteBio(req.body).then((response) => {
      res.json(response);
    });
  },
  modalProfile: (req, res, next) => {
    user.modalProfile(req.headers.id, req.user.user_id).then((response) => {
      res.json(response);
    });
  },
  save: (req, res, next) => {
    console.log(req.body);
    user.save(req.user, req.body.post).then((response) => {
      res.json(response);
    });
  },
  getsaved: (req, res, next) => {
    user
      .getsaved(req.user.user_id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  },
  removeFromSave: (req, res, next) => {
    user
      .removeFromSave(req.user, req.body.post)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  },
  mypost: (req, res, next) => {
    user
      .mypost(req.user.user_id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {});
  },
  profileModalPost: (req, res, next) => {
    user
      .profileModalPost(req.user.user_id, req.headers.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {});
  },
  removePost: (req, res, next) => {
    user
      .removePost(req.user, req.body.post)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        next(err);
      });
  },
};
