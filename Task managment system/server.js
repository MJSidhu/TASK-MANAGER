import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session";
import mongoose from "./config.js";
import User from "./models/user.js";
import Task from "./models/tasks.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true })); // Parse form data

// Session Setup
app.use(session({
    secret: process.env.SECRET_KEY ,
    resave: false,
    saveUninitialized: false,
    store: new (await import("connect-mongo")).default({
        mongoUrl: process.env.MONGO_URI
        
    })
}));

// Routes
app.get("/", (req, res) => {
    res.render("login", {isAuthenticated: false , username:"ROCK"});
});

app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/index", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    try {
        const tasks = await Task.find({ userId: req.session.userId });
        res.render("index", { 
            username: req.session.username, 
            isAuthenticated: true, 
            tasks: tasks 
        });
    } catch (error) {
        console.error(error);
        res.send("Error fetching tasks.");
    }
});

app.post("/tasks-submit", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const { description, category } = req.body;

    try {
        const newTask = new Task({
            userId: req.session.userId,
            description,
            category,
            status: "pending"
        });

        await newTask.save();
        res.redirect("/index"); // Redirect to refresh the page and show the new task
    } catch (error) {
        console.error(error);
        res.send("Error adding task.");
    }
});
app.post("/delete-task", async (req, res) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }

    const { taskId } = req.body;

    try {
        await Task.findByIdAndDelete(taskId);
        res.redirect("/index");
    } catch (error) {
        console.error(error);
        res.send("Error deleting task.");
    }
});

// Handle User Registration
app.post("/register", async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.send("Passwords do not match.");
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.send("Username already exists. Choose a different one.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.send("Error registering user.");
    }
});

// Handle User Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.send("User not found.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send("Incorrect password.");
        }

        req.session.userId = user._id;
        req.session.username = user.username;
        res.redirect("/index");
    } catch (error) {
        console.error(error);
        res.send("Error logging in.");
    }
});

// Handle Logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
