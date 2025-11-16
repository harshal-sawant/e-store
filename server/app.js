const express = require("express");
const app = express();
const productsRouter = require("./routes/products");
const loginRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const commentsRouter = require("./routes/comments");
const categoriesRouter = require("./routes/categories");
const errorHandlerMiddleware = require("./middleware/error-handler");

const port = process.env.PORT || 5000;
const cors = require("cors");
const connectDB = require("./db/connect");
// const connectDB = require("./db/connect");
require("dotenv").config();
app.use(express.json());
// Define CORS options
const corsOptions = {
  origin: "*", // Replace with your front-end URL
  // origin: 'http://localhost:4200',
  methods: ["GET", "HEAD", "POST", "PATCH", "PUT", "DELETE"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
// cors
app.use(cors(corsOptions));

app.options("/api/v1/products", cors(corsOptions)); // Enable pre-flight for all routes
app.options("/api/v1/orders", cors(corsOptions)); // Enable pre-flight for all routes
app.options("/api/v1/auth", cors(corsOptions)); // Enable pre-flight for all routes
app.options("/api/v1/comments", cors(corsOptions)); // Enable pre-flight for all routes

// routes
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/auth", loginRouter);
app.use("/api/v1/comments", commentsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/uploads", express.static("uploads"));
app.use(errorHandlerMiddleware);
const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI env variable not set");
    }
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB");
    const attemptListen = (p, tried = 0) => {
      const server = app.listen(p, () => console.log(`Listening on port ${p}`));
      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && tried < 3) {
          console.error(`Port ${p} in use, retrying on ${p + 1}`);
          attemptListen(p + 1, tried + 1);
        } else {
          console.error("Server listen error:", err.message);
          process.exit(1);
        }
      });
    };
    attemptListen(port);
  } catch (error) {
    console.error("Startup failure:", error.message);
    process.exit(1);
  }
};

start();
