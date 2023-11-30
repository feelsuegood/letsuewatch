import Video from "../models/Video.js";
import User from "../models/User.js";

/* 
- Callback option
Video.find({}, (error, videos) => {});
  if(error){
  return res.render("server-error")}
  }
  return res.render("home", { siteName, pageTitle: "Home", videos });
*/

export const siteName = "Wetube";
export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { siteName, pageTitle: "Home", siteName, videos });
  // Prevent mistakes! -> put return would be better to finish this function
};

export const watch = async (req, res) => {
  const { id } = req.params;
  // const id = req.params.id; same with above one
  const video = await Video.findById(id).populate("owner");
  // * populate로 User 데이터를 가져올 수 있음
  if (!video) {
    return res
      .status(404)
      .render("404", { siteName, pageTitle: "Video not found.", siteName });
    // return 꼭 넣어줘야함 !!! neccessary!!!
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
  // ^ 얘랑 같음 -> const _id= req.session.user._id
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(404)
      .render("404", { siteName, pageTitle: "Video not found." });
  }
  if (String(video.owner) !== String(_id)) {
    // ! 자바스크립트는 shape, type 둘 다 확인함, 주의하자
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
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { siteName, pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { path: fileUrl } = req.file;
  // ^es6, common js-> const file = req.file;
  const { title, description, hashtags } = req.body;
  try {
    const newVideo = await Video.create({
      title: title,
      description,
      fileUrl,
      // ^es6, common js-> fileUrl: file.path,
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
