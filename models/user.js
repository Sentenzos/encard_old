var crypto = require('crypto');
var mongoose = require('../libs/mongoose');
var async= require('async');


var shemaUser = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    hash: { 
        type: String,
        required: true
    },
    eHash: { //подтверждение почты
        type: String
    },
    salt: {
        type: String,
        required: true
    },
    iteration: {
        type: Number,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    verified: { //подтверждена ли почта
        type: Boolean,
        default: false
    },
    resetId: { //генерируемый id для сброса пароля, который отправляется на почту пользователя
        type: String
    },
    resetIdDate: { //отслеживать время последней отправки сброса пароля
        type: Date
    }
}, { versionKey: false });



//свойства ниже передадутся в конструктор пользователей
shemaUser.virtual('password') //если передать свойство password, то назначатся this ниже
    .set(function (password) {
        this.salt = String(Math.random());
        this.iteration = parseInt(Math.random() * 10 + 1); // +1 т.к. иногда выпадает 0
        this.hash = this.getHash(password);
        this.eHash = this.getEhash();
    })
    .get(function () {
        return this.hash;
    });

shemaUser.methods.getHash = function (password) {
    var c = crypto.createHmac('sha1', this.salt); //шифровка соли

    for (var i = 0; i < this.iteration; i++) {
        c = c.update(password); //с помощью "c" засолить password и так по кругу 5 раз
    }
    return c.digest('hex'); //из байтов переводит шестнадцатеричную систему  
};

shemaUser.methods.getEhash = function () { //генерирует строку отсылаемую для подтверждения почты
    let s = (1e7 + Math.random() * (1e15 - 1e7)) + ''; //генерация случайного числа вместо пароля
    let c = crypto.createHmac('sha1', this.salt);
    for (var i = 0; i < this.iteration; i++) {
        c = c.update(s);
    }
    return c.digest('hex');
};

shemaUser.methods.getResetId = function () { //генерирует строку для сброса пароля
    let s = (1e7 + Math.random() * (1e15 - 1e7)) + ''; 
    let c = crypto.createHmac('sha1', this.salt);
    for (var i = 0; i < this.iteration; i++) {
        c = c.update(s);
    }
    return c.digest('hex');
};

shemaUser.methods.checkPassword = function (password) {
    return this.getHash(password) === this.hash;
};

shemaUser.statics.setNewPass = function (password) {  //отсылает массив с новыми солью, итерацией и хешем
    let salt = String(Math.random());
    let iteration = parseInt(Math.random() * 10 + 1);

    var c = crypto.createHmac('sha1', salt + ''); 
    for (var i = 0; i < iteration; i++) {
        c = c.update(password + ''); 
    }

    let hash = c.digest('hex');    
    let arr = [salt, iteration, hash];
    return arr;
};


exports.User = mongoose.model('User', shemaUser);