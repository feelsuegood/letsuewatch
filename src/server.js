import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouters";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

// console.log(process.cwd());

const app = express();
const logger = morgan("dev"); // 종류: common, dev, short, combined, tiny

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger); // global middleware
app.use(express.urlencoded({ extended: true })); // read source code recommended
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
