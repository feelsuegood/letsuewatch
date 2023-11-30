import User from "../models/User.js";
import Video from "../models/Video.js";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const siteName = "Wetube";
export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "Join", siteName });
export const postJoin = async (req, res) => {
  const { name, email, username, password, password2, location } = req.body;
  const pageTitle = "Join";
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      siteName,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  // try to connect social login and site login
  // const socialTrue = await User.exists({
  //   $and: [{ email }, { socialOnly: true }],
  // });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      siteName,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      siteName,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      siteName,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      siteName,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userData);
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name ? userData.name : "No Name",
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  console.log(file);
  // ^ ES6 문법임
  // const id = req.session.user.id;
  // const { name, email, username } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  // await User.findByIdAndDelete(_id, {
  //   name,
  //   email,
  //   username,
  // });
  // await User.findByIdAndDelete(_id, {
  //   name: name,
  //   email: email,
  //   username: username,
  // });
  req.session.user = updatedUser;
  // req.session.user = {
  //   ...req.session.user,
  //   name,
  //   email,
  //   username,
  // };
  return res.redirect("/users/edit");
};

// 다른 사람 코드 https://github.com/kmnkit/wetube/blob/main/src/controllers/userController.js#L149
// export const postEdit = async (req, res) => {
//   const {
//       session: {
//           user: { _id, avatarUrl, email: sessionEmail, username: sessionUsername },
//       },
//       body: { name, email, username, location },
//       file
//   } = req;
//   let searchParam = [];
//   if (sessionEmail !== email) {
//       searchParam.push({ email });
//   }
//   if (sessionUsername !== username) {
//       searchParam.push({ username });
//   }
//   if (searchParam.length > 0) {
//       const foundUser = await User.findOne({ $or: searchParam });
//       if (foundUser && foundUser._id.toString() !== _id) {
//           return res.status(HTTP_BAD_REQUEST).render("edit-profile", {
//               pageTitle: "Edit Profile",
//               errorMessage: "This username/email is already taken.",
//           });
//       }
//   }
//   const isHeroku = process.env.NODE_ENV === "production";
//   const updatedUser = await User.findByIdAndUpdate(_id, {
//       avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
//       name,
//       email,
//       username,
//       location
//   },
//       {
//           new: true
//       }
//   );
//   req.session.user = updatedUser;
//   return res.redirect("/users/edit");
// }

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return redirect("/");
  }
  return res.render("users/change-password", {
    pageTitle: "Change Password",
  });
};

// ! Don forget to do put async and await
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation.",
    });
  }
  console.log("old pw:", user.password);
  user.password = newPassword;
  console.log("new unhashed pw:", user.password);
  await user.save();
  console.log("new hashed pw:", user.password);
  return res.redirect("/");
};
export const see = async (req, res) => {
  const { id } = req.params;
  // * double populate
  const user = await User.findById(id).populate({
    path: "videos",
    populate: { path: "owner", model: "User" },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
