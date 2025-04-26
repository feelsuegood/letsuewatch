import Video from "../models/Video.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { faviconUrl } from "../middlewares.js";

/* 
- Callback option
Video.find({}, (error, videos) => {});
  if(error){
  return res.render("server-error")}
  }
  return res.render("home", { siteName, pageTitle: "Home", videos });
*/

export const siteName = "Let'sue Watch";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  const favicon = faviconUrl();
  return res.render("home", {
    siteName,
    pageTitle: "Home",
    siteName,
    videos,
    favicon,
  });
  // Prevent mistakes! -> put return would be better to finish this function
};

export const watch = async (req, res) => {
  const { id } = req.params;
  // const id = req.params.id; same with above one
  const video = await Video.findById(id).populate("owner").populate("comments");
  // * get User data using populate
  if (!video) {
    return res
      .status(404)
      .render("404", { siteName, pageTitle: "Video not found.", siteName });
    // return neccessary!!!
  }
  return res.render("watch", {
    siteName,
    pageTitle: video.title,
    video,
    siteName,
  });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  // const id = req.params.id; same with above one
  const {
    user: { _id },
  } = req.session;
  // ^ const _id= req.session.user._id
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { siteName, pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    // To check type you can do console.log(typeof video.owner)
    return res.status(403).redirect("/");
    // 403: forbidden
  }
  return res.render("edit", {
    siteName,
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};
export const postEdit = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { siteName, pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { siteName, pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  // ^es6, common js-> const file = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title: title,
      description,
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.status(400).render("upload", {
      siteName,
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
  // ** same with 'await Video.create'!
  // const video = new Video({
  //   title: title,
  //   description,
  //   createdAt: Date.now(),
  //   hashtags: hashtags.split(",").map((word) => `#${word}`),
  //   meta: {
  //     views: 0,
  //     rationg: 0,
  //   },
  // });
  // const dbVideo = await video.save();
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { siteName, pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  // checke below to access videos inside of if!!
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        // regular expression!!
        $regex: new RegExp(`${keyword}`, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { siteName, pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    body: { commentId },
    params: { id: videoId },
  } = req;
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.sendStatus(404);
  }
  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(403);
  }
  await Comment.findByIdAndDelete({ _id: commentId });
  await Video.findByIdAndUpdate(
    { _id: videoId },
    {
      $pull: { comments: commentId },
    },
  );
  return res.sendStatus(200);
};
