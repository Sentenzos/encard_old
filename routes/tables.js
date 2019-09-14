var mongoClient = require('../libs/mongoDB');
var User = require('../models/user').User;
function deleteSpace(str) {
	while(str.startsWith(` `)){
		str = str.slice(1);
	}
	while(str.endsWith(` `)){
		let length = str.length;
		str = str.slice(0, length - 1);
	}
	return str
}

module.exports.get = function (req, res) {
	res.render('tables');
}

module.exports.getInitBaseForTable = function (req, res) {
	mongoClient.connect(function (err, client) {
		console.log(client);
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		if (!req.session.tableWordsBase || req.session.tableWordsBase == "common") { //если в куках нет ранее выбранной базы (или это база common) то загружать common          
			const db = client.db("ENRUwordsBases");
			db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data.words) {
						res.send({
							words: data.words,
							baseName: "common"
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
			var baseName = req.session.tableWordsBase
			console.log(req.session.tableWordsBase);
			const db = client.db("ENRUwordsBases");
			db.collection("bases").findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data[baseName]) { //база есть
						res.send({
							words: data[baseName],
							baseName: baseName
						});
					} else { //базы нет, значит пользователь сменил аккаунт и в куках осталась старая инфа, так что отправлю ему общую базу
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) {
								if (data.words) {
									res.send({
										words: data.words,
										baseName: "common"
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
						warn: 'Пользователь для предзагрузки не найден'
					});
					console.log('Пользователь для предзагрузки не найден');
				}
			});
		}
	});
}

module.exports.getAllBasesNames = function (req, res) {
	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		const db = client.db("ENRUwordsBases");
		db.collection("bases").findOne({ username: req.session.username }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				var names = [];
				for (let key in data) {
					if (key == 'username' || key == '_id' || key == 'learned' || key == "repeat") {
						continue
					}
					names.push(key);
				}
				res.send({
					names: names
				});
			} else {
				res.send({ warn: "Не удалось загрузить базы. Не найден пользователь" });
				console.log('Не удалось загрузить базы. Не найден пользователь');
				return
			}
		});
	});
}

module.exports.getDirectBase = function (req, res) {
	var baseName = req.body.baseName;
	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		if (baseName === "common") {
			const db = client.db("ENRUwordsBases");
			db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				req.session.tableWordsBase = 'common';
				res.send({
					words: data.words,
					baseName: baseName
				});
			});
		} else {
			const db = client.db("ENRUwordsBases");
			db.collection("bases").findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) { //юзер найден
					if (data[baseName]) { //база есть
						req.session.tableWordsBase = baseName;
						res.send({
							words: data[baseName],
							baseName: baseName
						});
					} else { //базы нет
						res.send({
							warn: "Запрашиваемая база не найдена"
						});
					}
				} else { //юзер не найден
					res.send({
						warn: "Пользователь не найден. Загрузка базы не выполнена."
					});
				}
			});
		}
	});
}

module.exports.newBaseName = function (req, res) {
	var newBaseName = req.body.baseName;
	newBaseName = deleteSpace(newBaseName);
	if (!/[^a-z0-9]/i.test(newBaseName) && newBaseName.length < 11 && newBaseName.length > 0) { //проверка на язык и длину
		if (newBaseName === 'common') {
			res.send({
				warn: "База с таким именем уже есть."
			});
			return
		}
		if (newBaseName === 'username') {
			res.send({
				warn: "Данное слово запрещено для использования."
			});
			return
		}
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			const db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (Object.keys(data).length == 9) {
						res.send({
							warn: "Неудача. Достигнуто максимальное количество пользовательских баз."
						});
						return
					}
					for (let key in data) {
						if (key === newBaseName) {
							res.send({
								warn: "База с таким именем уже есть."
							});
							return
						}
					}

					db.collection('bases').updateOne({ username: req.session.username },
						{ $set: { [newBaseName]: {} } },
						function (err, result) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							res.send({
								success: true
							});
							// console.log(result);
							console.log('успех');
						});
				} else {
					res.send({
						warn: "Пользователь не найден"
					});
				}
			});
		});
	} else {
		res.send({
			warn: 'Имя базы не соответствует требованиям.'
		});
	}
}

module.exports.deleteBase = function (req, res) {
	var baseName = req.body.baseName;

	if (baseName === 'common' || baseName === 'repeat' || baseName === 'learned' || baseName === 'username' || baseName === '_id') {
		res.send({
			warn: "Эта база недоступна для удаления."
		})
		return
	}
	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		const db = client.db("ENRUwordsBases");
		db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data[baseName]) {
					db.collection('bases').updateOne({ username: req.session.username },
						{ $unset: { [baseName]: "..." } },
						function (err, result) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							res.send({
								success: 1
							});
						});
				} else {
					res.send({
						warn: 'База с таким именем отсутствует.'
					})
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
				return
			}
		});
	});
}

module.exports.renameBase = function (req, res) {
	var oldBaseName = req.body.oldBaseName;
	var newBaseName = req.body.newBaseName;
	
	newBaseName = deleteSpace(newBaseName);

	if (oldBaseName === 'common' || oldBaseName === 'repeat' || oldBaseName === 'learned' || oldBaseName === 'username' || oldBaseName === '_id') {
		res.send({
			warn: "Эта база недоступна для переименования."
		})
		return
	}
	if (newBaseName === 'common' || newBaseName === 'repeat' || newBaseName === 'learned' || newBaseName === 'username' || newBaseName === '_id') {
		res.send({
			warn: "База с таким именем уже есть."
		})
		return
	}
	if (/[^a-z0-9]/i.test(newBaseName) || newBaseName.length > 10 || newBaseName.length < 1) {
		res.send({
			warn: "Имя базы не соответствует требованиям."
		})
		return
	}
	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		const db = client.db('ENRUwordsBases');
		db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				for (let key in data) {
					if (key === newBaseName) {
						res.send({
							warn: 'База с таким именем уже есть.'
						});
						return
					}
				}
				if (data[oldBaseName]) {
					db.collection('bases').updateOne(
						{ username: req.session.username },
						{ $rename: { [oldBaseName]: newBaseName } },
						function (err, result) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							res.send({
								success: 1
							})
						}
					);
				} else {
					res.send({
						warn: 'База с таким именем отсутствует.'
					})
				}
			} else {
				res.send({
					warn: 'Пользователь не найден.'
				})
			}
		});
	})
}

module.exports.addNewWord = function (req, res) {
	var engWord = req.body.engWord.toLowerCase();
	var rusWord = req.body.rusWord.toLowerCase();
	var baseName = req.body.baseName;
	engWord = deleteSpace(engWord);
	rusWord = deleteSpace(rusWord);
	baseName = deleteSpace(baseName);

	if (/[^a-z,.()\|/ ]/i.test(engWord) || engWord.length > 30 || engWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}
	if (/[^а-яё,.()\|/ ]/i.test(rusWord) || rusWord.length > 40 || rusWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}
	
	if (baseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") { //если после проверки id подтвердилось что это admin
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) { //база common найдена
								if (data.words[engWord]) { //если слово уже есть, то запрашивает подтверждение (генерируется другой запрос)
									res.send({
										accept: 1
									});
									return
								} else { //слово не найдено, значит можно добавлять
									var stringSumm = "words" + "." + engWord;
									db.collection("admin").updateOne({ baseName: "common" },
										{ $set: { [stringSumm]: rusWord } }, function (err, result) {
											if (err) {
												res.send({ err: 1 });
												console.log(err);
												return
											}
											res.send({
												success: 1             //слово добавлено
											});
											return
										})
								}
							} else { //что-то случилось и база common не найдена
								res.send({
									warn: "Такой базы нет"
								});
								console.log('Такой базы нет');
								return
							}
						});
					});
				} else { //если каким-то образом у юзера кука с именем админ, но id неверный
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
			}
		});
	} else if (baseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (baseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) { //пользователь есть
					if (data[baseName]) { //база есть
						if (data[baseName][engWord]) { //слово есть
							res.send({
								accept: 1
							});
							return
						} else { //слова нет
							var stringSumm = baseName + "." + engWord;
							db.collection('bases').updateOne({ username: req.session.username },
								{ $set: { [stringSumm]: rusWord } }, function (err, result) {
									if (err) {
										res.send({ err: 1 });
										console.log(err);
										return
									}
									res.send({
										success: 1             //слово добавлено
									});
									return
								})
						}
					} else { //базы нет
						res.send({
							warn: 'База с таким именем отсутствует.'
						})
					}
				} else { //пользователя нет
					res.send({
						warn: 'Пользователь не найден.'
					})
				}
			})
		});
	}
}

module.exports.addNewWordAccept = function (req, res) {
	var engWord = req.body.engWord.toLowerCase();
	var rusWord = req.body.rusWord.toLowerCase();
	var baseName = req.body.baseName;
	engWord = deleteSpace(engWord);
	rusWord = deleteSpace(rusWord);
	baseName = deleteSpace(baseName);
	if (/[^a-z,.()\|/ ]/i.test(engWord) || engWord.length > 30 || engWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}
	if (/[^а-яё,.()\|/ ]/i.test(rusWord) || rusWord.length > 30 || rusWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}

	if (baseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") { //если после проверки id подтвердилось что это admin
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) { // проверка есть ли такое слово
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) { //база common найдена
								if (data.words[engWord]) {
									var stringSumm = "words" + "." + engWord;
									db.collection("admin").updateOne({ baseName: "common" },
										{ $set: { [stringSumm]: rusWord } }, function (err, result) {
											if (err) {
												res.send({ err: 1 });
												console.log(err);
												return
											}
											res.send({
												success: 1             //слово добавлено
											});
											return
										})
									return
								} else {
									res.send({
										warn: "Вы пытаетесь изменить отсутствующее слово."
									})
									return
								}
							} else { //что-то случилось и база common не найдена
								res.send({
									warn: "Такой базы нет"
								});
								console.log('Такой базы нет');
								return
							}
						});
					});
				} else { //если каким-то образом у юзера кука с именем админ, но id неверный
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
			}
		});
	} else if (baseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (baseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) { //пользователь есть
					if (data[baseName]) { //база есть
						if (data[baseName][engWord]) { //слово есть
							var stringSumm = baseName + "." + engWord;
							db.collection('bases').updateOne({ username: req.session.username },
								{ $set: { [stringSumm]: rusWord } }, function (err, result) {
									if (err) {
										res.send({ err: 1 });
										console.log(err);
										return
									}
									res.send({
										success: 1             //слово добавлено
									});
								})
						} else { //слова нет
							res.send({
								warn: "Вы пытаетесь изменить отсутствующее слово."
							})
						}
					} else { //базы нет
						res.send({
							warn: 'База с таким именем отсутствует.'
						})
					}
				} else { //пользователя нет
					res.send({
						warn: 'Пользователь не найден.'
					})
				}
			})
		});
	}
}

module.exports.changeEngWord = function (req, res) {
	var baseName = req.body.baseName;
	var oldEngWord = req.body.oldEngWord.toLowerCase();
	var newEngWord = req.body.newEngWord.toLowerCase();
	newEngWord = deleteSpace(newEngWord);


	if (/[^a-z,.()\|/ ]/i.test(newEngWord) || newEngWord.length > 30 || newEngWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}


	if (baseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") { //если после проверки id подтвердилось что это admin
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) { //база common найдена
								if (data.words[oldEngWord]) { //если слово есть
									if (data.words[newEngWord]) { //если новое слово уже есть в базе
										if (oldEngWord === newEngWord) { //если старое и новое слово совпадают, то просто отсылаю пробел
											res.send({
												warn: ' '
											});
											return
										}
										res.send({
											warn: 'Такое слово уже есть в данной базе.'
										});
										return
									} else { //если новое слово уникально
										var stringSummOld = 'words' + '.' + oldEngWord;
										var stringSummNew = 'words' + '.' + newEngWord;
										db.collection("admin").updateOne({ baseName: "common" },
											{ $rename: { [stringSummOld]: stringSummNew } },
											function (err, result) {
												if (err) {
													res.send({ err: 1 });
													console.log(err);
													return
												}
												res.send({
													success: 1
												});
											})
									}
								} else { //слово не найдено, значит можно добавлять
									res.send({
										warn: 'Вы пытаетесь изменить отсутствующее слово.'
									});
								}
							} else { //что-то случилось и база common не найдена
								res.send({
									warn: "Такой базы нет"
								});
								console.log('Такой базы нет');
								return
							}
						});
					});
				} else { //если каким-то образом у юзера кука с именем админ, но id неверный
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
			}
		});
	} else if (baseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (baseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) { //пользователь есть
					if (data[baseName]) { //если база есть
						if (data[baseName][oldEngWord]) { //если изначальное слово есть
							if (data[baseName][newEngWord]) { //если новое слово есть в базе
								if (oldEngWord === newEngWord) { //если изначальное и новое слово совпадают, то просто отсылаю пробел
									res.send({
										warn: ' '
									});
									return
								}
								res.send({
									warn: 'Такое слово уже есть в данной базе.'
								});
								return
							}
							var stringSummOld = baseName + "." + oldEngWord;
							var stringSummNew = baseName + "." + newEngWord;
							db.collection('bases').updateOne({ username: req.session.username },
								{ $rename: { [stringSummOld]: stringSummNew } },
								function (err, result) {
									if (err) {
										res.send({ err: 1 });
										console.log(err);
										return
									}
									res.send({
										success: 1             //слово добавлено
									});
								})
						} else { //слова нет
							res.send({
								warn: "Вы пытаетесь изменить отсутствующее слово."
							})
						}
					} else { //базы нет
						res.send({
							warn: 'База с таким именем отсутствует.'
						})
					}
				} else { //пользователя нет
					res.send({
						warn: 'Пользователь не найден.'
					})
				}
			})
		});
	}
}

module.exports.changeRusWord = function (req, res) {
	var baseName = req.body.baseName;
	var engWord = req.body.engWord.toLowerCase();
	var newRusWord = req.body.newRusWord.toLowerCase();
	newRusWord = deleteSpace(newRusWord);

	if (/[^а-яё,.()\|/ ]/i.test(newRusWord) || newRusWord.length > 40 || newRusWord.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}

	if (baseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") { //если после проверки id подтвердилось что это admin
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) { //база common найдена
								if (data.words[engWord]) { //если английское слово есть
									if (data.words[engWord] === newRusWord) { //если новое значение русского слова равно старому, то отсылаю пробел
										res.send({
											warn: ' '
										});
										return
									} else { //если значение русского слова не равно старому
										var stringSumm = 'words' + '.' + engWord;
										db.collection("admin").updateOne({ baseName: "common" },
											{ $set: { [stringSumm]: newRusWord } },
											function (err, result) {
												if (err) {
													res.send({ err: 1 });
													console.log(err);
													return
												}
												res.send({
													success: 1
												});
											})
									}
								} else { //слово не найдено, значит можно добавлять
									res.send({
										warn: 'Вы пытаетесь изменить отсутствующее слово.'
									});
								}
							} else { //что-то случилось и база common не найдена
								res.send({
									warn: "Такой базы нет"
								});
								console.log('Такой базы нет');
								return
							}
						});
					});
				} else { //если каким-то образом у юзера кука с именем админ, но id неверный
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				})
			}
		});
	} else if (baseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (baseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) { //пользователь есть
					if (data[baseName]) { //если база есть
						if (data[baseName][engWord]) { //если английское слово есть
							if (data[baseName][engWord] === newRusWord) { //если новое значение русского слова равно старому, то отсылаю пробел
								res.send({
									warn: ' '
								});
							} else {
								var stringSumm = baseName + "." + engWord;
								db.collection('bases').updateOne({ username: req.session.username },
									{ $set: { [stringSumm]: newRusWord } },
									function (err, result) {
										if (err) {
											res.send({ err: 1 });
											console.log(err);
											return
										}
										res.send({
											success: 1             //слово добавлено
										});
									})
							}
						} else { //слова нет
							res.send({
								warn: "Вы пытаетесь изменить отсутствующее слово."
							})
						}
					} else { //базы нет
						res.send({
							warn: 'База с таким именем отсутствует.'
						})
					}
				} else { //пользователя нет
					res.send({
						warn: 'Пользователь не найден.'
					})
				}
			})
		});
	}
}

module.exports.deleteWordsFromBase = function (req, res) {
	var baseName = req.body.baseName;
	var words = req.body.words;

	if (baseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") {
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db("ENRUwordsBases");
						db.collection("admin").findOne({ baseName: "common" }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) {
								if (data.words) {
									var obj = {};
									for (let i = 0; i < words.length; i++) {
										let strSumm = "words." + [words[i]];
										obj[strSumm] = "";
										if (!data.words[words[i]]) {
											res.send({
												warn: "Одно или несколько слов не найдены. Операция отменена."
											});
											return
										}
									}
									db.collection("admin").updateOne({ baseName: "common" },
										{ $unset: obj },
										function (err, result) {
											if (err) {
												res.send({ err: 1 });
												return
											}
											res.send({
												success: 1
											});
											return
										});
								} else {
									res.send({
										warn: "База common не найдена! Обратитесь к администратору!"
									})
									return
								}
							} else {
								res.send({
									warn: "Коллекция не найдена! Обратитесь к администратору!"
								})
								return
							}
						});
					})
				} else {
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				});
				return
			}
		});
	} else if (baseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (baseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data[baseName]) {
						var obj = {};
						for (let i = 0; i < words.length; i++) {
							let strSumm = [baseName] + '.' + words[i];
							obj[strSumm] = "";
							if (!data[baseName][words[i]]) {
								res.send({
									warn: 'Одно или несколько слов не найдены. Операция отменена.'
								});
								return
							}
						}
						db.collection('bases').updateOne({ username: req.session.username },
							{ $unset: obj },
							function (err, result) {
								if (err) {
									res.send({ err: 1 });
									console.log(err);
									return
								}
								res.send({
									success: 1
								});
								return
							})
					} else {
						res.send({
							warn: "База с таким именем отсутствует."
						});
						return
					}
				} else {
					res.send({
						warn: "Пользователь не найден."
					});
					return
				}
			})
		});
	}
}

module.exports.transferWordsFromBase = function (req, res) {
	var words = req.body.words;
	var fromBaseName = req.body.fromBaseName;
	var toBaseName = req.body.toBaseName;
	if (fromBaseName === toBaseName) {
		res.send({
			warn: `Нельзя переносить слова из ${fromBaseName} в ${toBaseName}.`
		});
		return
	}
	if (fromBaseName === "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('admin').findOne({ baseName: 'common' }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data.words) {
						var objForToBase = {};
						for (let i = 0; i < words.length; i++) {
							if (!data.words[words[i]]) {
								res.send({
									warn: "Одно или несколько слов не найдены. Операция отменена."
								});
								return
							}
							let strSummForToBase = [toBaseName] + '.' + [words[i]]; //для добавления свойства в базу куда переносят
							objForToBase[strSummForToBase] = data.words[words[i]];
						}
						db.collection('bases').updateOne({ username: req.session.username },
							{ $set: objForToBase },
							function (err, result) {
								if (err) {
									res.send({ err: 1 });
									return
								}
								res.send({
									success: 1
								});
								return
							});
					} else {
						res.send({
							warn: "База common не найдена! Обратитесь к администратору!"
						})
						return
					}
				} else {
					res.send({
						warn: "Коллекция не найдена! Обратитесь к администратору!"
					})
					return
				}
			})
		})
	} else if (toBaseName === "common" && req.session.username === "admin") {
		User.findOne({ _id: req.session._id }, function (err, data) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			if (data) {
				if (data.username === "admin") {
					mongoClient.connect(function (err, client) {
						if (err) {
							res.send({ err: 1 });
							console.log(err);
							return
						}
						var db = client.db('ENRUwordsBases');
						db.collection('bases').findOne({ username: 'admin' }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								console.log(err);
								return
							}
							if (data) {
								if (data[fromBaseName]) {
									var objForFromBase = {};
									var objForToBase = {};
									for (let i = 0; i < words.length; i++) {
										if (!data[fromBaseName][words[i]]) {
											res.send({
												warn: "Одно или несколько слов не найдены. Операция отменена."
											});
											return
										}
										let strSummForFromBase = [fromBaseName] + '.' + [words[i]]; //для удаления свойства из базы откуда переносят
										let strSummForToBase = 'words' + '.' + [words[i]]; //для добавления свойства в базу куда переносят
										objForFromBase[strSummForFromBase] = "";
										objForToBase[strSummForToBase] = data[fromBaseName][words[i]];
									}
									db.collection('bases').updateOne({ username: 'admin' },
										{ $unset: objForFromBase }, function (err, result) {
											if (err) {
												res.send({ err: 1 });
												return
											}
											db.collection('admin').updateOne({ baseName: 'common' },
												{ $set: objForToBase },
												function (err, result) {
													if (err) {
														res.send({ err: 1 });
														return
													}
													res.send({
														success: 1
													});
													return
												});
										})
								} else {
									res.send({
										warn: `База ${fromBaseName} не найдена.`
									})
									return
								}
							} else {
								res.send({
									warn: "Пользователь не найден."
								})
								return
							}
						})
					})
				} else {
					res.send({
						warn: "Вы не являетесь администратором"
					});
					return
				}
			} else {
				res.send({
					warn: "Пользователь не найден."
				});
				return
			}
		});
	} else if (toBaseName === "common" && req.session.username != "admin") {
		res.send({
			warn: "Редактирование common доступно только администратору"
		});
		return
	} else if (toBaseName != "common") {
		mongoClient.connect(function (err, client) {
			if (err) {
				res.send({ err: 1 });
				console.log(err);
				return
			}
			var db = client.db('ENRUwordsBases');
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data[fromBaseName]) {
						var objForFromBase = {};
						var objForToBase = {};
						for (let i = 0; i < words.length; i++) {
							if (!data[fromBaseName][words[i]]) {
								res.send({
									warn: "Одно или несколько слов не найдены. Операция отменена."
								});
								return
							}
							let strSummForFromBase = [fromBaseName] + '.' + [words[i]]; //для удаления свойства из базы откуда переносят
							let strSummForToBase = [toBaseName] + '.' + [words[i]]; //для добавления свойства в базу куда переносят
							objForFromBase[strSummForFromBase] = "";
							objForToBase[strSummForToBase] = data[fromBaseName][words[i]];
						}
						db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
							if (err) {
								res.send({ err: 1 });
								return
							}
							if (data) {
								if (data[toBaseName]) {
									db.collection('bases').updateOne({ username: req.session.username },
										{ $unset: objForFromBase }, function (err, result) {
											if (err) {
												res.send({ err: 1 });
												return
											}
											db.collection('bases').updateOne({ username: req.session.username },
												{ $set: objForToBase },
												function (err, result) {
													if (err) {
														res.send({ err: 1 });
														return
													}
													res.send({
														success: 1
													});
													return
												});
										})
								} else {
									res.send({
										warn: `База ${toBaseName} не найдена.`
									})
									return
								}
							} else {
								res.send({
									warn: `Пользователь не найден.`
								})
								return
							}
						})
					} else {
						res.send({
							warn: `База ${fromBaseName} не найдена.`
						})
						return
					}
				} else {
					res.send({
						warn: "Пользователь не найден."
					})
					return
				}
			})
		})
	}
}

module.exports.getEngWord = function (req, res) {
	let baseName = req.params['base'];
	let word = req.params['word'];
	word = deleteSpace(word.toLowerCase());
	
	if (/[^a-z,.()\|/ ]/i.test(word) || word.length > 30 || word.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}
	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		let db = client.db('ENRUwordsBases');
		if (baseName === 'common') {
			db.collection('admin').findOne({ baseName: 'common' }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data.words) {
						let foundWords = [];
						for (let key in data.words) {
							if (key.indexOf(word) > -1) {
								foundWords.push({ [key]: data.words[key] });
							}
						}
						res.send({
							words: foundWords
						});
					} else {
						res.send({
							warn: "Произошла критическая ошибка! Обратитесь к администратору!"
						})
					}
				} else {
					res.send({
						warn: "Коллекция не найдена! Обратитесь к администратору!"
					})
				}
			})
		} else {
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data[baseName]) {
						let foundWords = [];
						for (let key in data[baseName]) {
							if (key.indexOf(word) > -1) {
								foundWords.push({ [key]: data[baseName][key] });
							}
						}
						res.send({
							words: foundWords
						});
					} else {
						res.send({
							warn: `База ${baseName} не найдена.`
						});
					}
				} else {
					res.send({
						warn: 'Пользователь не найден.'
					});
				}
			})
		}
	});
}

module.exports.getRusWord = function (req, res) {
	let baseName = req.params['base'];
	let word = req.params['word'];
	word = deleteSpace(word.toLowerCase());

	if (/[^а-яё,.()\|/ ]/i.test(word) || word.length > 40 || word.length < 1) {
		res.send({
			warn: "Слово не соответствует требованиям."
		});
		return
	}

	mongoClient.connect(function (err, client) {
		if (err) {
			res.send({ err: 1 });
			console.log(err);
			return
		}
		let db = client.db('ENRUwordsBases');
		if (baseName === 'common') {
			db.collection('admin').findOne({ baseName: 'common' }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data.words) {
						let foundWords = [];
						for (let key in data.words) {
							if (data.words[key].indexOf(word) > -1) {
								foundWords.push({ [key]: data.words[key] })
							}
						}
						res.send({
							words: foundWords
						});
					} else {
						res.send({
							warn: "Произошла критическая ошибка! Обратитесь к администратору!"
						})
					}
				} else {
					res.send({
						warn: "Коллекция не найдена! Обратитесь к администратору!"
					})
				}
			})
		} else {
			db.collection('bases').findOne({ username: req.session.username }, function (err, data) {
				if (err) {
					res.send({ err: 1 });
					console.log(err);
					return
				}
				if (data) {
					if (data[baseName]) {
						let foundWords = [];
						for (let key in data[baseName]) {
							if (data[baseName][key].indexOf(word) > -1) {
								foundWords.push({ [key]: data[baseName][key] });
							}
						}
						res.send({
							words: foundWords
						});
					} else {
						res.send({
							warn: `База ${baseName} не найдена.`
						});
					}
				} else {
					res.send({
						warn: 'Пользователь не найден.'
					});
				}
			})
		}
	});
}
