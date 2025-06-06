import "dotenv/config";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouters.js";
import videoRouter from "./routers/videoRouter.js";
import userRouter from "./routers/userRouter.js";
import apiRouter from "./routers/apiRouter.js";
import { localsMiddleware } from "./middlewares.js";

// console.log(process.cwd());

const app = express();
const logger = morgan("dev"); // kinds: common, dev, short, combined, tiny

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger); // global middleware
app.use(express.urlencoded({ extended: true })); // read source code recommended
app.use(express.json()); // read json
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  }),
);
app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets")); // "/static": URL, "assets": name of the folder
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;
