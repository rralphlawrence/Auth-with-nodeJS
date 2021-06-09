const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const app = express();
const nodemailer = require('nodemailer');
const session = require('express-session')
const flash = require('express-flash');
const LocalStrategy   = require('passport-local').Strategy;
require('./controller/auth');
const passport = require('passport')
const path = require('path');
const { render } = require('ejs');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { request, response } = require('express');
const { traceDeprecation } = require('process');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; 

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// parser for forms undefined problem when submit form
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views','views');


app.use(cookieParser());
//email connection

var transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: 'gmail',
    auth:{
        user:'justinecusap1998@gmail.com',
        pass:'Justinecusappogi15'
    }
});



// database connection for storing data
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'emailverify'
});

connection.connect();   

app.get('/',(req,res)=>{
    res.render('index');
});

app.post('/',(req,res)=> {

    //verification
    
  function Store(pass) {
        var verify = Math.floor((Math.random() * 10000000) + 1);
        
        var mailOption = {
            from :'<justinecusap1998@gmail.com>', // sender this is your email here
            to : `${req.body.Email}`, // receiver email2
            subject: "Account Verification",
            html: `<h1>Hello Friend Please Click on this link<h1><br><hr><p>Welcome user</p>
        <br><a href="http://localhost:4000/verification/?verify=${verify}">CLICK ME TO ACTIVATE YOUR ACCOUNT</a>`
        }
        // store data 
        
        var userData = { email: req.body.Email, password: pass, verification: verify };
        connection.query("INSERT INTO verify SET ?", userData, (err, result) => {
            if (err) {
                console.log(err)
            } else {
                transporter.sendMail(mailOption,(error,info)=>{
                    if(error){
                        console.log(error)
                    }else{

                        let userData = {
                            email : `${req.body.Email}`,
                        }

                        res.cookie("UserInfo",userData);
                        res.send("Your Mail Send Successfully")
                    }
                })
                console.log('Data Successfully insert')
            }
        })

    }
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.Password, salt, function (err, hash) {
            if (err) {
                console.log(err);
            } else {
                Store(hash);
            }
        });
    });
})
app.get('/verification/',(req,res)=>{
    function activateAccount(verification) {
        if(verification == req.query.verify){
            connection.query("UPDATE verify SET active = ?","true",(err,result)=>{
                if(err){
                    console.log(err);
                }
                else{
                    let userData = {
                        email : `${req.body.Email}`,
                        verify: "TRUE"
                    }

                    res.cookie("UserInfo",userData);
                    res.send('<h1>Account Verification Successfully</h1>');
                }
            })
        }else{
            res.send("<h1>verification failed</h1>")
        }
    };

    connection.query("SELECT verify.verification FROM verify WHERE email = ?",req.cookies.UserInfo.email,(err,result) => {
        if(err){
            console.log(err);
        }else{
            activateAccount(result[0].verification);
            /* var verify1 = req.query.verify;
            var verify2 = result[0].verification; 
            if(verify1 == verify2) {
                activateAccount(result[0].verification);
            }else{
                res.send("<h1>verification fail</h1>")
            } */
        }
    })
});


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get('/controller/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/controller/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/dashboard',
    failureRedirect: '/controller/auth/google/failure'
  })
);
app.get('/controller/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});


app.get('/logins', (req,res)=>{
    res.render('logins');
})
app.get('/dashboard',isLoggedIn,(req,res)=>{
    res.render('dashboard');
});

app.get('/dashboards',(req,res) => {
    res.render('dashboards')
})
app.get('/logins',(req,res)=>{
    res.render('logins');
});

app.get('/login',(req,res)=>{
    res.render('login');
});
app.post('/login',(req,res)=>{
    var email = req.body.Email;
    var pass = req.body.Password;
    function LoginSuccess() {
        let userData = {
            email : `${req.body.Email}`,
            verify: "true"
        }
        res.cookie("UserInfo",userData);
        res.json({verify: "true"});
    }
    connection.query('SELECT * FROM verify WHERE email = ?',email,(err,result)=>{
        if(err){
            res.send("wrong password or email")
        }else{
            var hash = result[0].password;
            bcrypt.compare(pass, hash, function(err, res) {
                if(err){
                    res.json({msg:"ERROR"})
                }else{
                    LoginSuccess();
                }
            });
        }
    })
})


app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.render('login');
});


app.listen(4000);
