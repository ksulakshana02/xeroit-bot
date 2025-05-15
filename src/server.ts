// src/server.ts
import express, { Request, Response } from "express";
import path from "path";
import indexRouter from "./routes/index";
import "dotenv/config";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "express-flash";
import cookieParser from "cookie-parser";

import { chatResponseTrigger } from "./controllers/botTrigger";

const app = express();
app.use(cookieParser());
// Set up view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

declare module "express-session" {
  interface SessionData {
    user: any; // Adjust this type according to your User model
  }
}
// public folder
app.use(express.static("public"));
app.use(
  session({
    secret: "dfcc",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());


// Routes
app.use("/", indexRouter);
app.use("/bot", indexRouter);

app.post("/chat", chatResponseTrigger);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
