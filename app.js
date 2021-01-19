// Core modules
// const path = require('path');

// 3rd party modules
// let's import our packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const compression = require('compression');
const methodOverride = require('method-override');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);// to save our session data
const csrf = require('csurf');
const flash = require('connect-flash');

// Custom modules
const shopRoutes = require('./routes/shop.routes');
const adminRoutes = require('./routes/admin.routes');
const authRoutes = require('./routes/auth.routes');// login, signup end-points
const errorRoutes = require('./routes/error.routes');
const User = require('./models/User');

//=======================================================
// Create our express app instance
const app = express();
const MONGODB_URI = 'mongodb+srv://elbotanist:elbotanist@cluster0.kz93r.mongodb.net/shop?retryWrites=true&w=majority';

// consutructor function for our mongodb session store
// Place where we save our session data
const store = new MongoDBStore({
    uri: MONGODB_URI, // uri of our mongodb db
    collection: 'sessions', // db collection name 
});
//======================================
// Connect to database
const PORT = process.env.PORT || 5000;
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})// this returns a promise
    .then(() => app.listen(PORT) && console.log(`Server is running on port ${PORT}...`))
    .catch(err => err.message);

//=======================================================
// Our middlewares

// (1) parsing our request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// (2) For compressing static files before sending it, so the browser can fetch them faster
// On large scales, it's better to have another server to server these static files as ngnix
// Just for not loading on our node.js server(let it just for business logic)
app.use(compression());

// (3) Serving files statically like images, css and js files
const options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now())
    }
}

app.use('/static', express.static('public', options));

// (4) Register our view engine (ejs)
app.set('view engine', 'ejs');

// (5) Sometimes, we need to override the client method (get,post)
// to send a delete or put method to my server, we need to use an external library to do it
app.use(methodOverride( '_method' ));

// (6) Initialize our session middleware
app.use(session({
    secret: 'some secret',// string used for hashing the session id, so it's hard to be predicted
    resave: false,//It means session won't be saved on every request, but change on the behaviour
    saveUninitialized: false,//It means no session needs to be saved for a req that doesn't need one
    store: store,
    name: 'SessionID',
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // expires in 1 day
    }
    // note, cookies can be configured to expire either when the browser is closed
    // (session cookie, we use it with sessions) or when a certain age/ expiry date is reached (permenant cookie) 
}));

// (7) iniate our csrf protection
const csrfProtection = csrf();
// it has to be after session middleware(depends on it)// we configure it to depend on
// cookies instead (cookie-parser middleware), it doesn't matter.
app.use(csrfProtection);
// Every request that make changes in our user status (as POST, PUT, DELETE requests) pass through this middleware 
// (csurf pacakge), and it checks if it has a csrf token or not

// (8)
// We add this middleware, so express add what it does to every request to our endpoints.
// We'll assign authentication status and csrf token in it, instead of doing that for every enpoint
// we just to put our csrfToken in our views forms (that's it)
// So, ou sessions will not stolen
app.use((req, res, next) => {
    // locals, means variable that are only accessable form our views
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next() // go to next middleware
});

// (9)
// Add the user to every request so, we use it once and don't that for every controller
// we need the user in it
app.use((req, res, next) =>{
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

// (10)
// Intialize flash messages middleware
app.use(flash()); 
// Now we can use it from any place in our application
// just by passing the message (sucess or error)in our views

//=======================================================
// My routes
app.use(shopRoutes);
app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(errorRoutes);


