const createError = require('http-errors');
const express = require('express');
const path = require('path');
const Ddos = require('ddos');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const winston = require('./libs/winston');
const session = require('express-session'); 
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const app = require('./libs/application');

// view engine setup
app.engine('ejs', require('ejs-locals')); // ejs-locals это сторонний модуль. Поддерживает layout и т.д
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let ddos = new Ddos({burst:15, limit:25, maxexpiry: 60, errormessage: 'Превышено количество запросов. Подождите 60 секунд.'});
app.use(ddos.express);

// app.use(morgan('dev'));
app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

var sessionStore = require('./libs/sessionStore'); //идет после куки парсера
app.set('trust proxy', 1);
app.use(session({
  secret: 'Kawajango',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));


app.use(express.static(path.join(__dirname, 'public'))); // статик для того чтобы не вводить полный путь к файлам в папке public. Его видят и шаблоны
app.use('/jquery', express.static(path.join(__dirname, '/node_modules/jquery/dist/')));


require('./routes')(app);


// catch 404 and forward to error handler
app.use(function(req, res, next) {       //когда приходит запрос, сервер проверяет имя запроса. Если оно не подходит не под один из обработчиков запросов, то они игнорируются и запрос идет ниже к этому мидлверу
  next(createError(404));               // тут создается ошибка 404
});

// error handler
app.use(function(err, req, res, next) { //ошибка приходит сюда, так как принимает еще и err
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function() {
  console.log('Express server listening port: ' + 3000)
});