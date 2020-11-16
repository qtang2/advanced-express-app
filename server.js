let express = require('express')
let app = express()
let pug = require('pug')
let session = require('express-session')
let passport = require('passport')
let ObjectId = require('mongodb').ObjectID
let mongo = require('mongodb').MongoClient
let LocalStrategy = require('passport-local');
let bodyParser = require('body-parser')
// when you wanna use env , u need to install dot env and configure it in your app
require('dotenv').config()
// console.log(process.env.VARIABLE_ONE)


app.use(session({
    secret:'qian', //this is a key used to hash out cookies
    saveUninitialized:true,
    resave:true
}))
app.use(passport.initialize())
app.use(passport.session())


app.set('view engine','pug')
app.set('views','./views')


let uri = 'mongodb+srv://user1:'+process.env.PW+'@fcc-mongodb-project.ayioa.mongodb.net/localdb?retryWrites=true&w=majority'
// console.log(uri)
mongo.connect(uri,(err,client)=>{
    if(err){
        console.log(err)
    }else{

        let db = client.db('localdb')
        // if connect to db successfully
        app.listen(3000)

        app.get('/',(req,res)=>{
            // req.session.count++
            // console.log(req.session)
            res.render("index",{message: "Please register or login"})
        })

        /* Save User Id to a cookie*/
        //user object is a document that returned from mongodb.
        //say when we click login, then we fetch a document and give it to user 
        passport.serializeUser((user,done)=>{
            done(null,user._id) // the user id later will written into the cookie
        })

        /* Retrieve User detail from cookie*/
        //the userId is retrieved from the cookie,then go to db to fetch the user and then give the user to done function
        passport.deserializeUser((userId,done)=>{
            db.collection('users').findOne(
                {_id:new ObjectId(userId)},
                (err,doc)=>{
                    done(null,doc)
                }
            )
        })

        let findUserDocument = new LocalStrategy(
            (username, password, done) =>{
                db.collection('users',findOne(
                    {username: username},
                    (err,user)=>{
                        if(err){return done(err)}
                        else if(!user){done(null,false)}
                        else if(user.password !== password){
                            done(null,false)
                        }else{
                            done(null,user)
                        }
                    }
                ))
            }
        )

        passport.use(findUserDocument)

        app.post('/login',
            bodyParser.urlencoded({extended:false})),
            passport.authenticate('local',{failureRedirect:'/'}),
            (req,res)=>{
                console.log(req.user)
                res.render('signed_in',req.user.name)
            }




    }
})