const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectionDb = require("./config/db");
const dotenv = require("dotenv");
const path = require("path");
const app = express();
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");
const cors = require("cors"); // Import CORS package
const session = require("express-session");
const MongoStore = require("connect-mongo"); // Correct import
dotenv.config();

connectionDb();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://first-full-stack-virenkumar.vercel.app", // Allow requests from this origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use environment variable for secret key
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), // Correct usage
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.use("/api/users", userRoutes);
app.use("/api/todos", todoRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "frontend/build")));

// Catch-all route to serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
