const express = require("express")
const router = express.Router();
const bcrypt = require("bcryptjs")
const jsonwt = require("jsonwebtoken")
const passport = require("passport")
const key = require("../../setup/myurl")


//@type get
//@route /api/auth
//@desc just for testing
//@access public
router.get("/", (req, res) => res.json({test: "auth is successfull"}))


//import schema for person to register
const Person = require("../../models/Person")

//@type post
//@route /api/auth/register
//@desc for registration of users
//@access public

router.post("/register", (req, res) => {
    Person.findOne({email: req.body.email})
    .then( person => {
        if(person){
            return res.status(400).json({emailerror: "email is already registered"})
        }else{
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender
            })
            //encrypt password using bcrypt
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newPerson.password, salt, (err, hash) => {
                    if(err) throw err;
                    newPerson.password = hash;
                    newPerson
                        .save()
                        .then(person => res.json(person))
                        .catch(err => console.log(err))
                })
            })


        }
    })
    .catch(err => console.log(err));
})


//@type post
//@route /api/auth/login
//@desc for login of users
//@access public

router.post("/login", (req, res) => {
    const email = req.body.email
    const password = req.body.password

    Person.findOne({email})
        .then(person => {
            if(!person){
                return res.status(404).json({emailerror: "user with this email not found"})
            }
            bcrypt.compare(password, person.password)
            .then(isCorrect => {
                if(isCorrect){
                    //res.json({success: "user login successfull"})
                    //use payload and create token for user
                    const payload = {
                        id: person.id,
                        name: person.name,
                        email: person.email
                      };
                      jsonwt.sign(
                        payload,
                        key.secret,
                        { expiresIn: 3600 },
                        (err, token) => {
                          res.json({
                            success: true,
                            token: "Bearer " + token
                          });
                        }
                      );
                }
                else{
                    res.status(400).json({passworderror: "incorrect password"})
                }
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
})



//@type get
//@route /api/auth/profile
//@desc for profile of users
//@access private


router.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      // console.log(req);
      res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        gender: req.user.gender,
        profilepic: req.user.profilepic
      });
    }
  );

module.exports = router;