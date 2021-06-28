require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const Mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

Mongoose.connect("mongodb://localhost:27017/password-manager", { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to Database successfully.');
}).catch((err) => {
    console.log(err);
});

const reqstring = {
    type: String,
    require: true
};

const appDataSchema = new Mongoose.Schema({
    user_id: reqstring,
    username: reqstring,
    email: reqstring,
    appname: reqstring,
    url: reqstring,
    password: reqstring,
    date: reqstring 
});

const UserSchema = new Mongoose.Schema({
    email: reqstring,
    username: reqstring,
    password: reqstring,
});

const secret_2 = process.env.secret_2;
appDataSchema.plugin(encrypt, { secret: secret_2, encryptedFields: ['password'] })

const secret_1 = process.env.secret_1;
UserSchema.plugin(encrypt, { secret: secret_1, encryptedFields: ['password'] })



const User = Mongoose.model("users", UserSchema);
const AppData = Mongoose.model("appdata", appDataSchema);

let name = "";
let login = false;

// ========================== index page section routing =====================

app.get('/', function(req, res) { 
    if(login) {


        User.findOne({username: name}, (err, obj) => {
            AppData.find({user_id: obj._id}, function(err, objArray) {
                // passing the resulted array to the appsinfo page.
                res.render('main', {navUsername: name, appsDataArray: objArray}); 
            });
        });
 
        
    } else {
        res.render('index');
    }
    
});

app.post('/', function(req, res) {
    // taking the user input from login form and
    // find the match user data in database through username
    User.findOne({username: req.body.username}, function(err, result) {
        // checking the user in the database if err comes log the err
        // else fetch the user data form the database.
        if(err) {
            console.log(err);
        } else {
            if(result == null) {
                console.log("create the new account.");
            } else {
                // checking the user inputed password with database password.
                if(req.body.password === result.password) {
                    // rending the main page after finding the correct user
                    // form the database.
                    name = result.username;
                    login = true;
                    

                    AppData.find({user_id: result._id}, function(err, objArray) {
                        // passing the resulted array to the appsinfo page.
                        res.render('main', {navUsername: result.username, appsDataArray: objArray});
                    });

                    
                    
                } else {
                    console.log("check your password!")
                }
            }
        }
    })
});

// =================== signUp section =============================================

app.get('/signup', function(req, res) {
    res.render('signup');
});

app.post('/signup', function(req, res) {
    // storing the user input data
    //  through signup form in to the object
    // by checking the user input is not empty string.
    if(req.body.username != "" && req.body.email != "" && req.body.password != "") {
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });
        // saving the user inputed created Object
        // in to the database
        newUser.save((err) => {
            if(err) {
                console.log(err);
            } else {
                console.log("user successfully saved!");
            }
        });

    } else {
        console.log('enter the details properly.')
    }
    
    // redirecting the page to the login
    // index page for login
    res.redirect('/');
});

// =========================== addApp section routing ==============================

app.get('/addApp', function(req, res) {
    res.render('addApp', {navUsername: name});
});

app.post('/addApp', function(req, res) {
    // storing the date of the app data created.
    const date = new Date().toDateString();
    // 1. finding the user data by comparing name variable.
    // 2. creating the newapp obj through user input values.
    // 3. saving the newapp obj in the database through the reference of
    //    the user_id value is user._id.
    // checking the password and conform password.
    if(req.body.password === req.body.conformPassword) {
        // finding the user data by comparing name variable.
        User.findOne({username: name}, function(err, obj) {
            // creating the newapp obj through user input values.
            const new_app = new AppData({
                user_id: obj._id,
                username: req.body.username,
                email: req.body.email,
                appname: req.body.appname,
                url: req.body.url,
                password: req.body.password,
                date: date
            });
            // saving the new_app obj to the database and returning the success msg
            new_app.save((err) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log("saved!..");
                }
            });
            
            // And redirecting to the index page.
            res.redirect('/');
        })
    } else {
        console.log("check your password once again.")
    }
    
    
});

// =========================== temparary appinfo routing section ===============

app.get('/appInfo', function(req, res) {
    // To get app info 
    // 1. find the user in users collection through name variable.
    // 2. Through the user found obj id find all the related apps data in the array.
    // 3. then render appsinfo page passing that resulted array.
    User.findOne({username: name}, function(err, obj) {
        // checking for the all the apps related to the user_id.
        AppData.find({user_id: obj._id}, function(err, objArray) {
            // passing the resulted array to the appsinfo page.
            res.render('appsInfo', {
                navUsername: name,
                appsDataArray: objArray
            });
        });
    });

});

// ================================== logout routing section=====================

app.get('/logout', function(req, res) {
    login = false;
    res.redirect('/');
});

app.listen(3000, function() {
    console.log("server started at the port 3000.");
})