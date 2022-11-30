var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var PostTweetHandler = require('./posttweethandler');

var postTwtHdler = new PostTweetHandler();

var oAuthRequestToken;
var oAuthAccessToken;

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});*/

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.get('/request_authorize', async (req, res) => {
  //res.render('auth', {authURL: 'test' });
  console.log("server received authorize request");

  try {
    // Get request token
    oAuthRequestToken = await postTwtHdler.requestToken();
    // Get authorization
    postTwtHdler.authorizeURL.searchParams.append('oauth_token', oAuthRequestToken.oauth_token);

    const url = postTwtHdler.authorizeURL.href;
    console.log('Please go here and authorize:', url);
    res.render('auth', {authURL: url});
    //const pin = await input('Paste the PIN here: ');

  } catch (e) {
    console.log(e);
  }
});

app.post('/submit_pin', async(req, res) => {
  console.log(req.url);
  console.log("server received PIN");
  const PIN = req.body["pin"];
  console.log(req.body);
  console.log(PIN);
  
  // Get access token
  oAuthAccessToken = await postTwtHdler.accessToken(oAuthRequestToken, PIN.trim());
  res.render('post');
});

app.post('/post_tweet', async (req, res) => {
  console.log(req.url);
  console.log("server received note data");
  console.log(req.body);
  const note = req.body["note"]
  console.log(note);
  
  //Make the request
  //postTwtHdler.data = 
  const response = await postTwtHdler.getRequest(oAuthAccessToken);
  console.dir(response, {
    depth: null
  }); 
  res.render('post');
});



module.exports = app;
