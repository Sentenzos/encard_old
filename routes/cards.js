const e = require('../libs/err');
const mongoClient = require('../libs/mongoDB');
const User = require('../models/user').User;
const winston = require('../libs/winston');
function randomNumber(min, max) {
	var rand = min + Math.random() * (max + 1 - min);
	rand = Math.floor(rand);
	return rand;
}

module.exports.get = function (req, res) {
	res.locals.svgNum = randomNumber(1, 14); //выбор svg картинки
	res.locals.timerMin = 0; // переменная для таймера. Если тут не указать 0, то шаблон откажется отображаться, так как похоже не находит переменную.
	res.locals.timerSec = 0;
	if(req.session.timerMin || req.session.timerSec) { //если в куках есть цифры таймера, то передает их в locals шаблону
		res.locals.timerMin = req.session.timerMin;
		res.locals.timerSec = req.session.timerSec;
	}
	res.render('cards');
}

module.exports.getBase = function (req, res) {

	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			return winston.error(err);
		}
		if (!req.session.wordsBase || req.session.wordsBase == "common") { //если в куках нет ранее выбранной базы (или это база common) то загружать common          
			var db = client.db("ENRUwordsBases");
			var collection = db.collection("admin");
			collection.findOne({ baseName: "common" }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if(data) {
					if(data.words) {
						res.send({
							words: data.words
						});
					} else {
						res.send({
							warn: "База common не найдена! Обратитесь к администратору!"
						})
					}
				} else {
					res.send({
						warn: "Коллекция не найдена! Обратитесь к администратору!"
					})
				}
			});
		} else {
			var baseName = req.session.wordsBase;
			var db = client.db("ENRUwordsBases");
			var collection = db.collection("bases");
			collection.findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) {
					if (data[baseName]) {
						res.send({
							words:data[baseName]
						});
					} else {
						var collection = db.collection("admin");
						collection.findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								return winston.error(err);
							}
							if(data) {
								if(data.words) {
									res.send({
										words: data.words
									});
								} else {
									res.send({
										warn: "База common не найдена! Обратитесь к администратору!"
									})
								}
							} else {
								res.send({
									warn: "Коллекция не найдена! Обратитесь к администратору!"
								})
							}
						});
					}
				} else {
					res.send({
						warn: 'Пользователь не найден.'
					})
				}
			});
		}
	});
}

module.exports.getBasesNames = function (req, res) {
	var username = req.session.username;


	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			return winston.error(err);
		}
		const db = client.db("ENRUwordsBases");
		const collection = db.collection("bases");

		collection.findOne({ username: username }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				return winston.error(err);
			}
			if (!data) {
				res.send({
					warn: 'Базы пользователя не найдены.'
				});
			} else {
				var obj = {};
				for (let key in data) {
					if (key != "_id" && key != "username") {
						obj[key] = data[key];
					}
				}
				if (req.session.wordsBase) { //дополнительно отправляется название выбранной ранее базы, если оно есть и если оно присутствует у пользователя в коллекции (на случай старой куки)
					if(data[req.session.wordsBase]) {
						obj.selectedBase = req.session.wordsBase;
					}			
				}
				res.send({
					names: obj
				});
			}
		});
	});
}

module.exports.queryAnotherBase = function (req, res) {
	var name = req.body.baseName;
	req.session.wordsBase = name;

	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			return winston.error(err);
		}
		if (name === "common") {
			const db = client.db("ENRUwordsBases");
			db.collection('admin').findOne({ baseName: 'common' }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) {
					res.send({
						base: data.words
					});
				} else {
					res.send({
						warn: 'База common не найдена. Обратитесь  к администратору.'
					});
				};
			});
		} else {
			const db = client.db("ENRUwordsBases");
			db.collection("bases").findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) { //если пользователь есть
					if (data[name]) {
						res.send({
							base: data[name]
						});
					} else {
						res.send({
							warn: 'База не найдена.'
						});
					}
				}
				else { //если каким-то образом пользователя нет
					res.send({
						warn: `Пользователь ${name} не найден`
					});
				}
			});
		}
	});
}

module.exports.learnedTransfer = function (req, res) {
	var word = req.body.word;
	var selected = req.body.selected;

	if (selected === "common" && req.session.username === "admin") { //если юзер админ и db common
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				return winston.error(err);
			}
			if(data) {
				if (data.username === "admin") { //если после проверки id подтвердилось что это admin
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							return winston.error(err);
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) { // проверка есть ли такое слово
							if (data) { //база common найдена
								if (data.words[word]) { //слово найдено
									var eng = word;
									var rus = data.words[word];
									var stringSumm = "words" + "." + eng;
									db.collection("admin").findOneAndUpdate({ baseName: "common" }, //удаление слова из common
										{ $unset: { [stringSumm]: "..." } },
										{
											returnOriginal: false
										}, function (err, data) {
											if (err) {
												res.send({ err: 1 });
												return winston.error(err);
											}
											var stringSumm = "learned" + "." + eng;
											db.collection("bases").findOneAndUpdate({ username: "admin" }, //добавление слова в learned
												{ $set: { [stringSumm]: rus } }, {
													returnOriginal: false
												}, function (err, data) {
													if (err) {
														res.send({ err: 1 });
														return winston.error(err);
													}
													res.send({ status: 1 });
													return winston.error(err);
												})
										});
								} else { //слово не найдено
									res.send({
										warn: `Cлова ${word} в базе ${selected} нет`
									});
									return
								}
							} else { //что-то случилось и база common не найдена
								res.send({
									warn: `Не удалось найти базу ${selected}`
								});
								return
							}
						});
					});
				} else { //если каким-то образом у юзера кука с именем админ, но id неверный
					res.send({
						warn: "Вы не являетесь администратором"
					})
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
			}
		});
	} else if (selected === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору."
		});
		return
	} else if (selected === "learned") { //если из learned в learned
		res.send({
			warn: "Перенос из learned в learned невозможен"
		});
		return
	} else if (selected != "common" && selected != "learned") { //обычный пользователь и базы

		mongoClient.connect(function (err, client) {
			const db = client.db("ENRUwordsBases");
			if (err) {
				res.send({ err: 1 });
				return winston.error(err);
			}
			db.collection("bases").findOne({ username: req.session.username }, function (err, data) { // поиск по пользователю
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) { //пользователь найден
					if(!data[selected]) { //если нет ключа, то нельзя искать его значение - иначе краш сервера
						res.send({warn: "Такой базы не существует"});
						return
					}
					if (data[selected][word]) { // слово есть в первичной базе (откуда переносят)
						var eng = word;
						var rus = data[selected][word];
						var stringSumm = selected + "." + eng;
						db.collection("bases").findOneAndUpdate( //удаление слова из первичной базы
							{ username: req.session.username },
							{ $unset: { [stringSumm]: "..." } },
							{ returnOriginal: false },
							function (err, data) {
								if (err) {
									res.send({ err: 1 });
									return winston.error(err);
								}
								var stringSumm = "learned" + "." + eng;
								db.collection("bases").findOneAndUpdate( //добавление слова в базу learned
									{ username: req.session.username },
									{ $set: { [stringSumm]: rus } },
									{ returnOriginal: false },
									function (err, data) {
										if (err) {
											res.send({ err: 1 });
											return winston.error(err);
										}
										res.send({ status: 1 });    //если все прошло успешно
									}
								)
							}
						);
					} else { //слова нет в первичной базе
						res.send({
							warn: "Cлова в базе нет"
						});
					}
				} else { //пользователь не найден
					res.send({
						warn: "Пользователь не найден"
					});
				}
			});
		});
	}
}

module.exports.repeatTransfer = function (req, res) {
	var word = req.body.word;
	var selected = req.body.selected;
	if (selected === "repeat") {
		res.send({
			warn: "Перенос из repeat в repeat невозможен"
		});
	} else if(selected === "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				return winston.error(err);
			}
			const db = client.db("ENRUwordsBases");
			db.collection("admin").findOne({ baseName: 'common' }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) { //пользователь найден
					if(!data.words) { //если нет ключа, то нельзя искать его значение - иначе краш сервера
						res.send({warn: 'База common не найдена. Сообщите администратору!'}); 
						return
					}
					if (data.words[word]) { //слово найдено
						var eng = word;
						var rus = data.words[word];
						var stringSumm = "repeat" + "." + eng;
						db.collection("bases").findOneAndUpdate(
							{ username: req.session.username },
							{ $set: { [stringSumm]: rus } },
							{ returnOriginal: false },
							function (err, data) {
								if (err) {
									res.send({ err: 1 });
									return winston.error(err);
								}
								res.send({ status: 1 });    //если все прошло успешно
							});
					} else { //слово не найдено
						res.send({
							warn: `Cлова ${word} в базе ${selected} нет.`
						});
					}
				} else { //пользователь не найден
					res.send({
						warn: "Коллекция не найдена. Сообщите администратору!"
					});
				}
			});
		});
	} else if(selected != "repeat" && selected != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				return winston.error(err);
			}
			const db = client.db("ENRUwordsBases");
			db.collection("bases").findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					return winston.error(err);
				}
				if (data) { //пользователь найден
					if(!data[selected]) { //если нет ключа, то нельзя искать его значение - иначе краш сервера
						res.send({warn: "Такой базы не существует"}); 
						return
					}
					if (data[selected][word]) { //слово найдено
						var eng = word;
						var rus = data[selected][word];
						var stringSumm = "repeat" + "." + eng;
						db.collection("bases").findOneAndUpdate(
							{ username: req.session.username },
							{ $set: { [stringSumm]: rus } },
							{ returnOriginal: false },
							function (err, data) {
								if (err) {
									res.send({ err: 1 });
									return winston.error(err);
								}
								res.send({ status: 1 });    //если все прошло успешно
							});
					} else { //слово не найдено
						res.send({
							warn: "Cлова в базе нет"
						});
					}
				} else { //пользователь не найден
					res.send({
						warn: "Пользователь не найден"
					});
				}
			});
		});
	}
}

module.exports.timerInfo = function (req, res) { //получает цифры таймера и настраивает их, если не подходят под формат
	let min = req.body.min + '';
	let sec = req.body.sec + '';
	
	if(min > 0 || sec > 0) {
		if(min > 0) {
			if(min.length == 1) {
				min = 0 + min;
			}
		} else {
			min = "00";
		}	
		if(sec > 0) {
			if(sec.length == 1) {
				sec = 0 + sec;
			}
		} else {
			sec = '00';
		}
		
		req.session.timerMin = min; //записывает цифры таймера в куки
		req.session.timerSec = sec;

	}
	res.send({
		success: 1
	})
}

module.exports.resetTimerInfo = function(req, res) { //если пользователь закрывает сайт, то таймер полностью сбрасывается
	req.session.timerMin = 0;
	req.session.timerSec = 0;
	res.send({
		success: 1
	})
}

module.exports.tutorial = function(req, res) {
	if(!req.session.tutorial) {
		res.send({
			show: 0
		})
	} else {
		req.session.tutorial = 0;
		res.send({
			show: 1
		})
	}
}