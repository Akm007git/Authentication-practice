const express = require("express");
const app = express();
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("./models/user");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index");
});

// create a new user
app.post("/create", (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);

    // adding salt in password

    bcrypt.genSalt(10, function (err, salt) {
        console.log(salt);
        bcrypt.hash(password, salt, async (err, hash) => {
            ////console.log(hash);
            const createdUser = await userModel.create({
                name,
                email,
                password: hash,
            });

            // send a token to frontend
            let token = jwt.sign({ email: email }, "shhhhhhhhh");
            res.cookie("Token", token);

            res.send(createdUser);
        });
    });
});

// Login user
app.get("/login", (req, res) => {
    res.render("login");
})

// Login user and generating token

app.post("/login", async (req, res) => {

    const { email, password } = req.body;
    //console.log(email, password); 

    const user = await userModel.findOne({ email });

    console.log(user)

    if (!user) {
        res.send("Some thing went wrong");
    }

    console.log(user.password, password);
    // checking that stored password and coming password are same or not
    const isMatch = await bcrypt.compare(password, user.password);

    // token generating
    // sending to the frontend
    if (isMatch) {
        let token = jwt.sign({ email: user.email }, "shhhhhhhhh");
        res.cookie("Token", token);
        res.send("Logged in successfully");
    }
    else {
        res.send("Some thing went wrong");
    }



});

app.get("/logout", (req, res) => {
    // res.clearCookie("Token");

    res.cookie("Token", "");
    res.redirect("/");
})

app.listen(3000, (req, res) => {
    console.log("server is running 3000");
});
