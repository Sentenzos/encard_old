let User = require('../models/user').User;

module.exports = function (req, res, next) {
    if (!req.session._id) {
        res.send({
            warn: 'Отсутствует авторизация.'
        });
        return
    } else {
        User.findOne({ _id: req.session._id }, function (err, data) { //проверка по id
            if (err) { //если id выдуманный и не подходит под стандарт, то тут возвращать не ошибку, а шаблон страницы с ошибкой, в противном случае пользователь будет видеть объект с ошибкой
                res.send({
                    warn: 'Отсутствует авторизация.'
                });
                return
            }
            if (data) { //если пользователь есть
                next();
            } else { //если пользователя с таким id нет
                res.send({
                    warn: 'Отсутствует авторизация.'
                });
            }
        });
    }
}