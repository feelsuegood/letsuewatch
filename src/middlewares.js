import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const s3AvatarStorage = new multerS3({
  s3: s3Client,
  bucket: process.env.BUCKET_NAME,
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `avatars/${req.session.user._id}/${Date.now().toString()}`);
  },
});

const s3VideoStorage = new multerS3({
  s3: s3Client,
  bucket: process.env.BUCKET_NAME,
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `videos/${req.session.user._id}/${Date.now().toString()}`);
  },
});

export const faviconUrl = () => {
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/favicon.ico`;
};

export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Let'Sue Watch";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.faviconUrl = faviconUrl();
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Please log in first.");
    return res.render("login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorised");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  limits: { fileSize: 3000000 },
  storage: s3AvatarStorage,
});
export const videoUpload = multer({
  limits: { fileSize: 10000000 },
  storage: s3VideoStorage,
});

export const coreJsUrl = () => {
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ffmpeg-core.js`;
};

export const coreWasmUrl = () => {
  return `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/ffmpeg-core.wasm`;
};
