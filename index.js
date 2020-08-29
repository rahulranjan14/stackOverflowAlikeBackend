const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser");
const passport = require("passport")

//bring all routes
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const questions = require("./routes/api/questions");



const app = express();


// middleware for body parser 
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


//mongoDB configuration
const db = require("./setup/myurl").mongoURL



// attempt to connect to database
mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.log(err));


//passport middleware
app.use(passport.initialize());

//config for jwt strategy
require("./strategies/jsonwtStrategy")(passport);


// routes(testing)
app.get("/", (req, res) => {
    res.send("welcome to big stack project")
});


//actual routes
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/questions", questions);


const port = process.env.PORT || 4000

app.listen(port, () => console.log(`App is running at port${port}`))