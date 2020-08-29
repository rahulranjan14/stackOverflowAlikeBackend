const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const passport = require("passport")


//load person model
const Person = require("../../models/Person")

//load profile model
const Profile = require("../../models/Profile");

//load question model
const Question = require("../../models/Question")


//@type get
//@route /api/questions/
//@desc route for showing all questions
//@access public
router.get("/", (req, res) => {
    Question
    .find()
    .sort({date: "desc"})
    .then(questions => res.json(questions))
    .catch(err => res.json({noquestion: "no questions to display"}))
})


//@type post
//@route /api/questions/
//@desc route for submitting questions
//@access private

router.post("/",
    passport.authenticate("jwt", {session: false}),
     (req, res) => {
        const newQusetion = new Question({
            textone: req.body.textone,
            texttwo: req.body.texttwo,
            user: req.user.id,
            name: req.body.name
        })
        newQusetion
        .save()
        .then(question => res.json(question))
        .catch(err => console.log("Unable to push question to database "+ err))
    }
)


//@type Post
//@route /api/answers/:id
//@desc route for submitting answers
//@access private


router.post("/answers/:id",
     passport.authenticate("jwt", {session: false}),
    (req, res) => {
        Question.findById(req.params.id)
        .then( question => {
            const newAnswer = {
                user: req.user.id,
                name: req.body.name,
                text: req.body.text
            };
            question.answers.unshift(newAnswer);

            question
            .save()
            .then(question => res.json(question))
            .catch(err => console.log(err))

        })
        .catch(err => console.log(err))
    }     
)


//@type Post
//@route /api/questions/upvote/:id
//@desc route for upvoting
//@access private

router.post(
    "/upvote/:id",
     passport.authenticate("jwt", {session: false}),
        (req, res) => {
    Profile.findOne({ user: req.user.id})
    .then(profile => {
        Question.findById(req.params.id)
        .then(question => {
            if(question.upvotes.filter(upvote => upvote.user.toString() === req.user.id.toString()).length > 0)
            {
                return res.status(400).json({noupvote: "user already upvoted"});
            }
        question.upvotes.unshift({user: req.user.id})
        question
        .save()
        .then(question => res.json(question))
        .catch(err => console.log(err))

    })
    .catch(err => console.log(err))
})
.catch(err => console.log(err))
})

//TODO:
//1. remove upvoting
//delete questions
//delete all questions

//sepratate route for linux questions

module.exports = router;