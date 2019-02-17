var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var flash = require('express-flash');
var session = require('express-session');
var bcrypt = require('bcryptjs');
var validate = require('mongoose-validator')

// // To hash a password:
// bcrypt.genSalt(10, function(err, salt) {
//     bcrypt.hash("B4c0/\/", salt, function(err, hash) {
//         // Store hash in your password DB.
//     });
// });

// To check a password:
// // Load hash from your password DB.
// bcrypt.compare("B4c0/\/", hash, function(err, res) {
//     // res === true
// });
// bcrypt.compare("not_bacon", hash, function(err, res) {
//     // res === false
// });
 
// // As of bcryptjs 2.4.0, compare returns a promise if callback is omitted:
// bcrypt.compare("B4c0/\/", hash).then((res) => {
//     // res === true
// });

// // Auto-gen a salt and hash:
// bcrypt.hash('bacon', 8, function(err, hash) {
// });
// th
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, './static')));
app.use(session({
    secret: 'hasdflkjasfdpiuhwlkj',
    resave: false,
    saveUninitialized: true,
  }))
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/loginReg_DB');
mongoose.Promise = global.Promise;


var UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        unique: true, 
        trim: true,
        required: [true, 'Please fill in a valid email'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        
        
    },
    first_name: { 
        type: String, 
        minlength: [2, "First Name must be more than 2 chars"],
        required: [true, 'First Name is required'],
        
        
    },
    last_name: { 
        type: String, 
        minlength: [2, "First Name must be more than 2 chars"],
        required: [true, 'Last Name is required'], 
        
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        
    },
    birthday: { 
        type: String, 
        required: [true, 'Birthday is Required'],
        
    },
    
},{timestamps: true});

mongoose.model('User', UserSchema); 
var User = mongoose.model('User')


app.get('/', function(req, res){

    res.render('index')
})

app.get('/home', function(req, res){
    res.render('home')
})

app.post('/register', function(req,res){
	console.log("POST /registration")
    console.log("POST DATA: ", req.body);
    const userInstance = new User(req.body);
    console.log(userInstance);

    bcrypt.hash(userInstance.password, 10, function(err, hash) {
        userInstance.password = hash;
        userInstance.save(function(err) {
            if(err){
                console.log(err.errors);
            } else {
                res.redirect("/");
            }
        })
    });
	
})

app.post('/login', function(req,res){
    console.log(" req.body: ", req.body);
    User.findOne({email:req.body.email}, function(err, user) {
	    if(err) {
	            console.log("ERROR IN RETRIEVEING USER FOR LOGIN")
	        }
	        else if (user) {
	            console.log("USER FOUND FOR LOGIN");
	            bcrypt.compare(req.body.password, user.password, function(err, result) {
	                if (err){
	                    res.redirect("/");
	                }
	                else if (result){
	                    req.session.user_id = user._id;
	                    res.redirect('/home');
	                } else {
	                    res.redirect("/");
	                }
	            });

	        } 
	        else {
	            console.log("USER -NOT FOUND- FOR LOGIN")
	            response.redirect("/");
	        }
	        console.log("FOUND USER!", user);

        
    })
})
	
app.get('/logout', function(req, res){
	req.session.destroy();
	console.log("session should not be here",req.session )
	res.redirect('/')
})


app.listen(8000, function() {
    console.log("listening on port 8000");
});




