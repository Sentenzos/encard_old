const mongoClient = require('../libs/mongoDB');
const User = require('../models/user').User;
const nodemailer = require('nodemailer');
const winston = require('../libs/winston');

function validateEmail(email) {
	//если true значит формат верный
	let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return pattern.test(String(email).toLowerCase());
}
function deleteSpace(str) {
	while (str.startsWith(` `)) {
		str = str.slice(1);
	}
	while (str.endsWith(` `)) {
		let length = str.length;
		str = str.slice(0, length - 1);
	}
	return str
}
function randomNumber(min, max) {
	var rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
}




module.exports.get = function (req, res) {	
	res.locals.resetIdSuccess = false; //отвечает за отправку окна для изменения пароля. если false то окна не будет в html
	res.locals.svgNum = randomNumber(1, 14);
	if (!req.session._id) {
		res.locals.username = false;
		res.render('home');
	} else {
		User.findOne({ _id: req.session._id }, function (err, data) { //проверка по id
			if (err) { //если id выдуманный и не подходит под стандарт, то тут возвращать не ошибку, а имя. в противном случае пользователь будет видеть объект с ошибкой
				res.locals.username = false;
				res.render('home');
				return
			}
			if (data) { //если пользователь есть
				if (req.session.username) { //если в куках пользователя есть ник, а он должен быть
					if (data.username === req.session.username) {
						res.locals.username = req.session.username;
					}
				} else { //если в куках есть id, но нет username
					res.locals.username = false;
				}
			} else { //если пользователя с таким id нет
				res.locals.username = false;
			}
			res.render('home');
		});
	}
}

module.exports.login = function (req, res) {
	let name = req.body.name.toLowerCase();
	let pass = req.body.pass;

	if (/[^a-z0-9]/i.test(name) || name.length > 15 || name.length < 1) {
		res.send({ warn: 'Неверный формат имени' });
		return
	}
	if (pass.length > 50) {
		res.send({ warn: 'Пароль слишком длинный' });
		return
	}
	User.findOne({ username: name }, function (err, user) {
		if (err) {
			res.send({ err: 1 });
			winston.error(err);
			return
		}
		if (user) {  //юзер есть
			if (user.checkPassword(pass)) { //пароль верный
				req.session._id = user._id;
				req.session.username = user.username;
				res.send({ name });
			} else {   //пароль неверный
				res.send({ warn: 'Неверный пароль' });
			}
		} else {
			res.send({ warn: 'Неверный пароль' });
		};
	});
}

module.exports.logout = function (req, res) {
	if (!req.session._id) {
		res.send({
			warn: 'Вы не залогинены'
		});
		return
	}
	req.session.destroy();
	res.send({
		success: 1
	});
}

module.exports.registration = function (req, res) {
	let username = req.body.name.toLowerCase();
	let password = req.body.pass;
	let email = req.body.email;
	username = deleteSpace(username);
	email = deleteSpace(email);
	if (!username || !password || !email) {
		res.send({ warn: 'Заполните все поля' });
		return
	} if (/[^a-z0-9]/i.test(username)) {
		res.send({ warn: 'Для имени используйте латиницу' });
		return
	} if (username.length > 15) {
		res.send({ warn: 'Имя слишком длинное' });
		return
	} if (username.length < 1) {
		res.send({ warn: 'Имя слишком короткое' });
		return
	} if (/[ ]/i.test(password)) {
		res.send({ warn: 'Пароль содержит пробел' });
		return
	} if (password.length > 50) {
		res.send({ warn: 'Пароль слишком длинный' });
		return
	} if (password.length < 8) {
		res.send({ warn: 'Пароль слишком короткий' });
		return
	} if (!validateEmail(email)) {
		res.send({ warn: 'Email имеет неверный формат' });
		return
	}

	let user = new User({ username: username, password: password, email: email });
	user.save(function (err, doc) {
		if (err) {
			if (err.name === 'MongoError') {
				res.send({ warn: 'Имя или почта уже используется' });
				winston.error(err);
				return
			} else {
				res.send({ err: 1 });
				winston.error(err);
				return
			}
		}
		mongoClient.connect(function (err, client) {
			if (err) {
				User.deleteOne({ username: username }, function (err) {
					if (err) {
						winston.log('error', `Не удалось удалить юзера после прерывания - 1  (username: ${username})`);
					}
					res.send({ err: 1 });
				})
				winston.error(err);
				return
			}

			const db = client.db("ENRUwordsBases");
			const collection = db.collection("bases");
			let wordsCollections = [{ username: username, learned: {}, repeat: {} }];

			collection.insertMany(wordsCollections, function (err) {
				if (err) {
					User.deleteOne({ username: username }, function (err) {
						if (err) {
							winston.log('error', `Не удалось удалить юзера после прерывания - 2  (username: ${username})`);
						}
						res.send({ err: 1 });
					})
					winston.error(err);
					return
				}
				let transporter;
				try {
					transporter = nodemailer.createTransport({
						host: 'smtp-mail.outlook.com',
						port: 587,
						secure: false, // true for 465, false for other ports 587
						auth: {
							user: "rslnnek@hotmail.com",
							pass: "151834qSq#"
						}
					});
				} catch (err) {
					User.deleteOne({ username: username }, function (err) { //удаляем пользователя
						if (err) {
							winston.log('error', `Не удалось удалить юзера после прерывания - 3  (username: ${username})`);
							res.send({ err: 1 });
							return
						}
						collection.deleteOne({ username: username }, function (err) { //удаляем базы слов
							if (err) {
								winston.log('error', `Не удалось удалить юзера после прерывания - 4  (username: ${username})`);
								res.send({ err: 1 });
								return
							}
							res.send({ err: 1 });
						})
					})
					winston.log('Error: ' + err.name + ":" + err.message);
					return
				}
				let link = `${req.protocol}://${req.get('host')}/verify?id=${doc.eHash}`
				let mailOptions = {
					from: 'rslnnek@hotmail.com', // sender address
					to: `${email}`, // list of receivers
					subject: 'Подтвердите вашу почту.', // Subject line
					text: 'Подтверждение почты.', // plain text body
					html: `<b>Привет ${username[0].toUpperCase() + username.slice(1)}! Для того чтобы завершить регистрацию на сайте ${req.get('host')} - подтверди почту перейдя по <a href="${link}">ссылке</a>.</b><br>
					<b>В противном случае, при утере пароля, ты не сможешь восстановить аккаунт.</b>` // html body
				};

				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						User.deleteOne({ username: username }, function (err) { //удаляем пользователя
							if (err) {
								winston.log('error', `Не удалось удалить юзера после прерывания - 5  (username: ${username})`);
								res.send({ err: 1 });
								return
							}
							collection.deleteOne({ username: username }, function (err) { //удаляем базы слов
								if (err) {
									winston.log('error', `Не удалось удалить юзера после прерывания - 6  (username: ${username})`);
									res.send({ err: 1 });
									return
								}
								res.send({ err: 1 });
							})
						})
						winston.log('error', `${err.name} : ${err.message}`);
					} else {
						// console.log('Message sent: %s', info.messageId);
						// console.log('Message sent: %s', info.response);
						// console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
						// console.log(results);
						req.session._id = user._id;
						req.session.username = user.username;
						req.session.tutorial = 1;
						res.send({ success: 1 }); //создание пользователя окончено
					}
				})
			});
		});
	});
}

module.exports.verify = function (req, res) {
	let eHash = req.query.id;
	User.findOne({ eHash }, (err, data) => {
		if (err) {
			res.render('message', {message: 'На сервере произошла  ошибка.'});	
			winston.error(err);
			return
		}
		res.locals.resetIdSuccess = false; 
		res.locals.username =  req.session.username ? req.session.username : false;
		if (data) { //если пользователь с таким eHash есть			
			if (!data.verified) { //если почта еще не подтверждена
				User.updateOne({ eHash },
					{ $set: { verified: true } }, (err) => {
						if (err) {
							res.render('message', {message: 'На сервере произошла  ошибка.'});		
							winston.error(err);
							return
						}
						res.render('message', {message: 'Ваша почта успешно подтверждена.'});						
					})
			} else { //если почта уже подтверждена
				res.render('message', {message: 'Ваша почта уже была подтверждена.'});
			}
		} else {
			res.render('message', {message: 'Данный id активации не найден.'});
		}
	})
}

module.exports.resetPassSendMail = function (req, res) {
	let email = req.body.email;
	if (!validateEmail(email)) {
		res.send({ warn: `Email имеет неверный формат` });
		return
	}
	User.findOne({ email }, (err, data) => {
		if (err) {
			res.send({ err: 1 });
			return winston.error(err);
		}
		if (data) { //если такая почта есть
			if (data.verified) { //если пользователь подтверждал почту
				if (!data.resetId) { //если у пользователя нет активного id для сброса почты
					User.findOneAndUpdate({ email }, { $set: { resetId: data.getResetId(), resetIdDate: Date.now() } }, { new: true }, (err, data) => {
						if (err) {
							res.send({ err: 1 });
							return winston.error(err);
						}
						let transporter;
						try {
							transporter = nodemailer.createTransport({
								host: 'smtp-mail.outlook.com',
								port: 587,
								secure: false, // true for 465, false for other ports 587
								auth: {
									user: "rslnnek@hotmail.com",
									pass: "151834qSq#"
								}
							});
						} catch (err) {
							res.send({ err: 1 });
							winston.log('error', `${err.name} : ${err.message}`);
							return
						}
						let link = `${req.protocol}://${req.get('host')}/newpass?id=${data.resetId}`

						let mailOptions = {
							from: 'rslnnek@hotmail.com', // sender address
							to: `${email}`, // list of receivers
							subject: `Восстановление пароля ${req.get('host')}`, // Subject line
							text: 'Восстановление пароля', // plain text body
							html: `<b>Привет ${data.username[0].toUpperCase() + data.username.slice(1)}! Для того чтобы восстановить пароль на сайте ${req.get('host')} - перейди по ссылке <a href="${link}">ссылке</a>.</b>` // html body
						};

						transporter.sendMail(mailOptions, (err, info) => {
							if (err) {
								res.send({ err: 1 });
								winston.log('error', `${err.name} : ${err.message}`);
							} else {
								res.send({ success: 1 });
							}
						})
					})
				} else { //у пользователя есть активный id для сброса почты
					let dateNow = Date.now();
					let dateThen = Date.parse(data.resetIdDate);
					if ((dateThen + 9e5) > dateNow) { //если время отправки прошлого письма + 15 минут больше чем время сейчас
						res.send({ warn: `Прошло меньше 15 минут` });
					} else { //если прошло больше 15 мин с отправки прошлого письма
						User.findOneAndUpdate({ email }, { $set: { resetId: data.getResetId(), resetIdDate: Date.now() } }, { new: true }, (err, data) => {
							if (err) {
								res.send({ err: 1 });
								return winston.error(err);
							}
							let transporter;
							try {
								transporter = nodemailer.createTransport({
									host: 'smtp-mail.outlook.com',
									port: 587,
									secure: false, // true for 465, false for other ports 587
									auth: {
										user: "rslnnek@hotmail.com",
										pass: "151834qSq#"
									}
								});
							} catch (err) {
								res.send({ err: 1 });
								winston.log('error', `${err.name} : ${err.message}`);
								return
							}
							let link = `${req.protocol}://${req.get('host')}/newpass?id=${data.resetId}`
							let mailOptions = {
								from: 'rslnnek@hotmail.com', // sender address
								to: `${email}`, // list of receivers
								subject: `Восстановление пароля ${req.get('host')}`, // Subject line
								text: 'Восстановление пароля', // plain text body
								html: `<b>Привет ${data.username[0].toUpperCase() + data.username.slice(1)}! Для того чтобы восстановить пароль на сайте ${req.get('host')} - перейди по ссылке <a href="${link}">ссылке</a>.</b>` // html body
							};

							transporter.sendMail(mailOptions, (err, info) => {
								if (err) {
									res.send({ err: 1 });
									winston.log('error', `${err.name} : ${err.message}`);
								} else {
									res.send({ success: 1 });
								}
							})
						})
					}
				}
			} else { //если пользователь не подтверждал почту
				res.send({ warn: `Email не был подтвержден` });
			}
		} else {//если такой почты нет
			res.send({ warn: `Данный Email не найден` });
		}
	})
}

module.exports.reqNewPass = function (req, res) {
	let resetId = req.query.id;
	res.locals.resetIdSuccess = false; 
	res.locals.username = false;
	res.locals.svgNum = randomNumber(1, 14);
	if (!resetId || resetId === 'deleted') {
		res.render('message', {message: 'Id сброса не найден.'});
		return
	}
	User.findOne({ resetId }, (err, data) => {
		if (err) {
			res.render('message', {message: 'На сервере произошла  ошибка.'});
			winston.error(err);
			return
		}
		if (data) { //если пользователь с таким resetId есть
				res.locals.username = false;
				res.locals.resetIdSuccess = true;
				res.render('home');
		} else {
			res.render('message', {message: 'Данный id сброса не найден.'});
		}
	})
}

module.exports.setNewPass = function (req, res) {
	let password = req.body.password;
	let resetId = req.body.resetId;

	if (/[ ]/i.test(password)) {
		res.send({ warn: 'Пароль содержит пробел' });
		return
	} if (password.length > 50) {
		res.send({ warn: 'Пароль слишком длинный' });
		return
	} if (password.length < 8) {
		res.send({ warn: 'Пароль слишком короткий' });
		return
	} if (!resetId || resetId === 'deleted') {
		res.send({ warn: 'Id сброса не найден' });
		return
	}

	User.findOne({ resetId }, function (err, data) {
		if (err) {
			res.send({ err: 1 });
			winston.error(err);
			return
		}
		if (data) {
				let arr = User.setNewPass(password);
				User.updateOne({ resetId }, { $set: { salt: arr[0], iteration: arr[1], hash: arr[2], resetId: 'deleted' } }, (err) => {
					if (err) {
						res.send({ err: 1 });
						return winston.error(err);
					}
					req.session._id = data._id;
					req.session.username = data.username;
					req.session
					res.send({
						success: 1
					});
				})
		} else {
			res.send({
				warn: 'Данный id сброса не найден'
			});
		}
	})
}











module.exports.post = function (req, res) {

	var username = req.body.username;
	var password = req.body.password;


	User.findOne({ username: username }, function (err, user) {

		if (err) return winston.error(err);

		if (user) {  //юзер есть
			if (user.checkPassword(password)) { //пароль верный
				req.session._id = user._id;
				req.session.username = user.username;
				res.send({ username: req.body.username });
			} else {   //пароль неверный
				res.send({ warning: 'Неверный пароль' })
			}
		} else {  //юзера нет
			var user = new User({ username: username, password: password, email: 'email@mail.com' });
			user.save(function (err) {
				if (err) return winston.error(err);
				req.session._id = user._id;
				req.session.username = user.username;
				req.session.tutorial = 1;
				mongoClient.connect(function (err, client) {

					const db = client.db("ENRUwordsBases");
					const collection = db.collection("bases");
					let wordsCollections = [{ username: username, learned: {}, repeat: {} }];

					collection.insertMany(wordsCollections, function (err, results) {
						if (err) {
							res.send({ err: 1 });
							winston.error(err);
							return
						}
						res.send({ username: "Новый пользователь: " + user.username }); //создание пользователя окончено
					});
				});
			});
		};

	});
}
