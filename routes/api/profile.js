const express = require("express")
const router = express.Router();
const mongoose = require("mongoose")
const passport = require("passport");



//for testing
// router.get("/", (req, res) => res.json({test: "profile is successfull"}))



//load person model
const Person = require("../../models/Person")

//load profile model
const Profile = require("../../models/Profile");
const { json } = require("body-parser");

//@type get
//@route /api/profile
//@desc for personal profile of users
//@access private

router.get(
    "/",
     passport.authenticate("jwt", {session: false}),
      (req, res) => {
        Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile){
                return res.status(404).json({profilenotfound: "no profile found"})
            }
            res.json(profile)
        })
        .catch(err => console.log("got some error in profile " + err))
})


//@type post
//@route /api/profile/
//@desc for updating personal profile of users
//@access private

router.post(
    "/",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        const profileValues = {};
        profileValues.user = req.user.id;
        if(req.body.username) profileValues.username = req.body.username;
        if(req.body.website) profileValues.website = req.body.website;
        if(req.body.country) profileValues.country = req.body.country;
        if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
        if(req.body.languages !== undefined){
            profileValues.languages = req.body.languages.split(",");
        }
        //get social links
        profileValues.social = {};

        if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
        if(req.body.facebook) profileValues.social.facebook = req.body.facebook;
        if(req.body.instagram) profileValues.social.instagram = req.body.instagram;


        //do databse operations
        Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileValues},
                    {new: true}
                )
                .then(profile => res.json(profile))
                .catch(err => console.log("problem in update" + err))
            } else{
                Profile.findOne({username: profileValues.username})
                .then(profile => {
                    //username already exists case
                    if(profile){
                        res.status(400).json({username: "username already exists"})
                    }
                    //save user
                    new Profile(profileValues)
                    .save()
                    .then(profile => res.json(profile))
                    .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
            }
        })
        .catch(err => console.log("problem in fetching profile" + err))
    }
)


//@type get
//@route /api/profile/:username
//@desc for getting user profile based on username
//@access public

router.get("/:username", (req, res) => {
    Profile.findOne({ username: req.params.username})
    .populate("user", ["name","profilepic"])//for fetching fields from profile.js
    .then(profile => {
        if(!profile){
            res.status(404).json({usernotfound: "user not found"})
        }
        res.json(profile)
    })
    .catch(err => console.log("error in fetching username "+ err))
})



//@type get
//@route /api/profile/find/everyone
//@desc for getting user profile of everyone
//@access public

router.get("/find/everyone", (req, res) => {
    Profile.find()
    .populate("user", ["name","profilepic"])//for fetching fields from profile.js
    .then(profiles => {
        if(!profiles){
            res.status(404).json({usernotfound: "no profile was found"})
        }
        res.json(profiles)
    })
    .catch(err => console.log("error in fetching username "+ err))
})



//@type delete
//@route /api/profile/
//@desc for deleting user based on id 
//@access private

router.delete("/", passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    Profile.findOneAndRemove({user: req.user.id})
    .then( () => {
        Person.findOneAndRemove({ _id: req.user.id})
        .then( () => res.json({success : "deletion was successful"}))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})


//@type post
//@route /api/profile/mywork
//@desc for adding work profile of a person 
//@access private

router.post(
    "/workrole",
     passport.authenticate("jwt", {session: false}),
     (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        
        if(!profile){
            res.status(404).json({usernotfound: "user not found"})
        }

        const newWork = {
            role: req.body.role,
            company: req.body.company,
            country: req.body.country,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            details: req.body.details

        }
        profile.workrole.unshift(newWork);
        profile.save()
        .then(profile => res.json(profile))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
})


//@type delete
//@route /api/profile/workrole/:w_id
//@desc for deleting specific workrole 
//@access private

router.delete(
    "/workrole/:w_id",
    passport.authenticate("jwt", { session: false}), (req, res) => {
        Profile.findOne({user: req.user.id})
        .then( profile => {
            //assignment to check if profile was found
            const  removethis = profile.workrole
            .map(item => item.id)
            .indexOf(req.params.w_id)

            profile.workrole.splice(removethis, 1);

            profile
                .save()
                .then(profile => res.json(profile))
                .catch(err => cosole.log(err))
        })
        .catch(err => cosnsole.log(err))
    })




module.exports = router;