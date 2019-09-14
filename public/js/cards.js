var words;


function autoFontSize() {
  let height = document.documentElement.clientHeight;
  if(height > 770) {
    document.documentElement.style.fontSize = '100%';
  } else if(height < 770 && height > 700) {
    document.documentElement.style.fontSize = '90%';
  } else if(height < 700 && height > 625) {
    document.documentElement.style.fontSize = '80%';
  } else if(height < 625 && height > 530) {
    document.documentElement.style.fontSize = '70%';
  } else if(height < 530) {
    document.documentElement.style.fontSize = '60%';
  }
}
autoFontSize();
window.addEventListener('resize', autoFontSize);


function stub(event) { //вспомогательная фунция временно убирающая дефолтное поведение
	event.preventDefault();
}
document.querySelector('.choose-list').addEventListener('mousedown', stub); //не дает списку с названием баз открыться



function showWarning(text, color, time, busy) {
	if (showWarning.busy) return
	var elem = document.querySelector('.warning');
	elem.style.opacity = 1;
	elem.innerHTML = text;
	elem.style.color = color;
	if (time) {
		if (busy) {
			showWarning.busy = 1; //не дает появиться другому ворнингу пока не пропадет этот
		}
		setTimeout(() => {
			var timer = setInterval(() => {
				elem.style.opacity -= 0.1
				if (elem.style.opacity < 0.1) {
					showWarning.busy = 0;
					clearInterval(timer);
				}
			}, 50);
		}, time);
	}

}



function getBase() {
	$.ajax({ //получение базы при загрузке страницы
		url: "/getBase",
		contentType: "application/json",
		method: "GET",
		success: function (base) {
			if (base.err) return showWarning('Произошла непредвиденная ошибка', "rgb(238, 35, 20)", 3000, true);
			if (base.warn) return showWarning(base.warn, "rgb(238, 35, 20)", 3000, true);
			words = base.words;
			document.querySelector('.cards__button-next').addEventListener('click', showNextWord);
			darkenElems("rgba(0, 0, 0, 0.151)");
		}
	});
}
getBase();



function showTutorial() {
	$.ajax({ //получение базы при загрузке страницы
		url: "/tutorial",
		contentType: "application/json",
		method: "GET",
		success: function (success) {
			if (success.show) {
				modalWindow();
			}
		}
	});
}
showTutorial();




function getBasesNames() {
	$.ajax({ //получение списка баз который загрузится в селект
		url: "/getBasesNames",
		contentType: "application/json",
		method: "GET",
		success: function (basesNames) {
			if (basesNames.err) {
				showWarning("Произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);
				return
			}
			if (basesNames.warn) {
				showWarning(basesNames.warn, "rgb(238, 35, 20)", 3000, true);
				return
			}
			var list = document.querySelector('.choose-list');
			var basesNames = basesNames.names;
			if (basesNames.selectedBase && basesNames.selectedBase != "common") {
				var option = document.createElement('option');
				option.value = basesNames.selectedBase;
				option.innerHTML = basesNames.selectedBase;
				list.appendChild(option);
				option.selected = true;
			}
			for (let key in basesNames) {
				if (key == basesNames.selectedBase) continue;
				if (key == "selectedBase") continue;
				var option = document.createElement('option');
				option.value = key;
				option.innerHTML = key;
				list.appendChild(option);
			}
			document.querySelector('.choose-list').removeEventListener('mousedown', stub); //теперь список может открываться
			document.querySelector('.choose-list').style.backgroundColor = "rgba(0, 0, 0, 0.151)";//приобретает цвет назад
		}
	});
}
getBasesNames();



function wordsGenerator() {
	var length = Object.keys(words).length;
	if (!length) { //если объект words пуст
		showWarning("База не содержит слов.", "rgb(238, 35, 20)", 1000, true);
		return {
			eng: "",
			rus: ""
		}
	}
	var obj = {};
	function randomNumber(min, max) {
		var rand = min + Math.random() * (max + 1 - min);
		rand = Math.floor(rand);
		return rand;
	}
	var number = randomNumber(0, length - 1);
	var engWord = Object.keys(words)[number];
	var rusWord = Object.values(words)[number];
	if (lang == "eng") {
		return {
			eng: engWord,
			rus: rusWord
		};
	}
	if (lang == "rus") {
		return {
			eng: rusWord,
			rus: engWord
		};
	}
}

function wordsInsert() {
	let word = wordsGenerator();
	if (Object.keys(words).length > 3) { //если слов в базе больше 3
		if (!wordsInsert.state) { //при первом запуске функции state становится положительным, создается массив для отслеживания повторов
			wordsInsert.arr = [];
			wordsInsert.arr.push(word.eng);
			wordsInsert.state = 1;
		} else { //привтором последующих запусках функци слово сначала проверяется на повторы
			if (wordsInsert.arr.length == 4) wordsInsert.arr = wordsInsert.arr.slice(1);
			if (wordsInsert.arr.find(arrWord => arrWord === word.eng)) {
				while (wordsInsert.arr.find(arrWord => arrWord === word.eng)) { //до тех пор пока выпадаемое слово совпадает с одним из ключей объекта ролить другое слово
					word = wordsGenerator();
				}
			}
			wordsInsert.arr.push(word.eng);
		}
	}
	document.querySelector('.eng-word').innerHTML = word.eng;
	document.querySelector('.rus-word').innerHTML = word.rus;
}

var lang = "eng";
var infoLang = document.querySelector('.lang-info');


function showNextWord() {

	if (!showNextWord.state) {
		document.querySelector('.rus-word').style.display = "none";
		wordsInsert();
		showNextWord.state = 1;
		document.querySelector('.card').style.backgroundColor = "";
		return false
	}

	if (showNextWord.state) {
		document.querySelector('.rus-word').style.display = "flex";
		showNextWord.state = 0;
		document.querySelector('.card').style.backgroundColor = "";
		return false
	}
}



function changeLanguage(event) {
	var target = event.target;
	if (($('.rus-word').css('display') == 'none')) {
		colorOfState("rgba(0, 0, 0, 0.151)", "rgba(207, 57, 57, 0.774)", target);
		showWarning("Прежде отобразите перевод.", "rgb(238, 35, 20)", 1000, true);
		return
	}

	if (lang == "eng") {
		$('.eng-word').html('');
		$('.rus-word').html('');
		lang = "rus";
		infoLang.innerHTML = lang;
		colorOfState("rgba(0, 0, 0, 0.151)", "rgba(74, 226, 193, 0.699)", target);
		return false
	}

	if (lang == "rus") {
		$('.eng-word').html('');
		$('.rus-word').html('');
		lang = "eng";
		infoLang.innerHTML = lang;
		colorOfState("rgba(0, 0, 0, 0.151)", "rgba(74, 226, 193, 0.699)", target);
		return false
	}
}
document.querySelector('.cards__button-lang').addEventListener('click', changeLanguage);





function prevDefault(event) { //отмена выделения на конкретных элементах где это требуется
	if (event.target.classList.contains('cards__button') || event.target.closest('.menu__box-left') ||
		event.target.matches('.timer__button') || event.target.closest('.timer__timer') ||
		event.target.matches('.modal-message')) {
		event.preventDefault();
	}
}
document.addEventListener('mousedown', prevDefault);



function timerMain() {

	var top; //верхняя координата элемента timer__set


	function timerButtonHide(event) {
		event.target.style.opacity = 1;
		let elem = document.querySelector('.timer__set'); // элемент с часами
		let int = setInterval(() => {
			event.target.style.opacity -= 0.1;
			if (event.target.style.opacity == -1) {
				event.target.style.display = 'none';
				clearInterval(int);
				timerShow(elem);
			}
		}, 25);
	}
	document.querySelector('.timer__button').addEventListener('click', timerButtonHide);


	function timerButtonShow(elem) {
		let opacity = 0;
		elem.style.opacity = 0;
		elem.style.display = 'block';
		let int = setInterval(() => {
			opacity += 0.1;
			elem.style.opacity = opacity;
			if (elem.style.opacity == 1) {
				clearInterval(int);
			}
		}, 25);
	}

	function timerShow(elem) {
		elem.style.display = "block";
		top = parseInt(getComputedStyle(elem).top) + "px";  //т.к js не понимает координаты чере elem.style.top (нужно первое назначение вручную)
		elem.style.top = top;                  //получаю из объекта getComputedStyle и назначаю вручную
		let int = setInterval(() => {
			elem.style.top = parseInt(elem.style.top) + 1 + "px";
			if (parseInt(elem.style.top) == 0) {
				clearInterval(int);
			}
		}, 0);
	}

	function timerHideOrStart() {
		let timerSet = document.querySelector('.timer__set');
		let timerButton = document.querySelector('.timer__button');
		let timerTimer = document.querySelector('.timer__timer');
		let int = setInterval(() => {
			timerSet.style.top = parseInt(timerSet.style.top) - 1 + "px";
			if (parseInt(timerSet.style.top) == parseInt(top)) {
				clearInterval(int);
				timerSet.style.display = "none";
				if (!document.querySelectorAll('.timer__area')[0].value &&
					document.querySelectorAll('.timer__area')[1].value < 1) { //если поле с минутами пусто, а в поле с секундами величина меньше единицы, то скрыть часы
					timerButtonShow(timerButton);
				} else { //иначе запустить таймер
					timerStart(timerTimer);
				}
			}
		}, 0)
	}
	document.querySelector('.timer__space').addEventListener('mouseup', timerHideOrStart);

	function timerStart(elem) {
		let min = document.querySelectorAll('.timer__area')[0];
		let sec = document.querySelectorAll('.timer__area')[1];
		var timerMin = document.querySelector('.timer__min');
		var timerSec = document.querySelector('.timer__sec');

		if (min.value.length < 1) { //настройки длины минут
			timerMin.innerHTML = '00'
		} else if (min.value.length > 1) {
			if (min.value.length > 2) {
				timerMin.innerHTML = '99';
			} else {
				timerMin.innerHTML = min.value;
			}
		} else if (min.value.length == 1) {
			timerMin.innerHTML = 0 + min.value;
		}

		if (!sec.value) { //настройки длины секунд
			timerSec.innerHTML = '00';
		} else if (sec.value.length == 1) {
			timerSec.innerHTML = 0 + sec.value;
		} else if (sec.value.length > 1) {
			if (sec.value.length > 2) {
				timerSec.innerHTML = '59'
			} else {
				timerSec.innerHTML = sec.value;
			}
		}

		min.value = '';
		sec.value = '';

		let opacity = 0;
		elem.style.opacity = 0;
		elem.style.display = 'block';
		let int = setInterval(() => {
			opacity += 0.1;
			elem.style.opacity = opacity;
			if (elem.style.opacity == 1) {
				clearInterval(int);
				countSecons();
			}
		}, 25);
	}

	function checkString(event) { //по приколу функция позволяющая вводить только цифры в input. А можно было просто написать type = number
		let value = event.target.value;
		if (/[^0-9]/i.test(value) && value.length == 1) { //если длина строки 1 символ (первой ввели букву) то просто обнулить строку
			event.target.value = '';
		} else if (/[^0-9]/i.test(value)) { //если же букву вводят после цифры, то вычитать последний символ (букву) до тех пор пока строка не будет только из цифр или строка будет пуста
			while (/[^0-9]/i.test(value)) {
				value = value.slice(0, value.length - 1);
				if (!/[^0-9]/i.test(value)) {
					event.target.value = value;
				}
			}
		}
	}
	document.querySelectorAll('.timer__area')[0].addEventListener('input', checkString);
	document.querySelectorAll('.timer__area')[1].addEventListener('input', checkString);

	let timer;

	function countSecons() {
		let timerMin = document.querySelector('.timer__min');
		let timerSec = document.querySelector('.timer__sec');
		let pause = document.querySelector('.timer__pause');

		timer = setInterval(() => {
			if (timerSec.innerHTML == 0 && timerMin.innerHTML > 0) {
				timerMin.innerHTML = timerMin.innerHTML - 1;
				timerSec.innerHTML = '59';
				if (timerMin.innerHTML.length == 1) {
					timerMin.innerHTML = '0' + timerMin.innerHTML;
				}
				return
			}
			if (timerSec.innerHTML == 0 && timerMin.innerHTML == 0) {
				clearInterval(timer);
				winkRed(); //функция мигающие цифры при 0 ми и 0 сек
				pause.style.display = 'none';
				$.ajax({
					url: "/resetTimerInfo", //если время на циферблате подоло к нулю, то сообщить серверу и сбросить куки пользователя с таймером
					contentType: "application/json",
					method: "GET"
				});
				return
			}

			timerSec.innerHTML = timerSec.innerHTML - 1;

			if (timerSec.innerHTML.length == 1) {
				timerSec.innerHTML = '0' + timerSec.innerHTML;
			}
		}, 1000)
	}

	function pauseCount() {
		clearInterval(timer);
		let pause = document.querySelector('.timer__pause');
		let contin = document.querySelector('.timer__continue');
		pause.style.display = 'none';
		contin.style.display = 'block';
	}
	document.querySelector('.timer__pause').addEventListener('click', pauseCount);

	function continueCount() {
		let pause = document.querySelector('.timer__pause');
		let contin = document.querySelector('.timer__continue');
		pause.style.display = 'block';
		contin.style.display = 'none';

		let timerMin = document.querySelector('.timer__min');
		let timerSec = document.querySelector('.timer__sec');

		countSecons();

	}
	document.querySelector('.timer__continue').addEventListener('click', continueCount);

	function resetCount() {
		let timerButton = document.querySelector('.timer__button');
		let timerTimer = document.querySelector('.timer__timer');

		let pause = document.querySelector('.timer__pause');
		let contin = document.querySelector('.timer__continue');

		let min = document.querySelector('.timer__min');
		let colon = document.querySelector('.timer__colon');
		let sec = document.querySelector('.timer__sec');

		$.ajax({
			url: "/resetTimerInfo", //Сбрасывает таймер
			contentType: "application/json",
			method: "GET"
		});

		timerTimer.style.opacity = 1;
		let int = setInterval(() => {
			timerTimer.style.opacity -= 0.1;
			if (timerTimer.style.opacity == 0) {
				timerTimer.style.display = 'none';
				clearInterval(int);
				clearInterval(timer);
				clearInterval(winkInt);
				timerButtonShow(timerButton);
				pause.style.display = 'block';
				contin.style.display = 'none';

				min.style.color = 'white';
				colon.style.color = 'white';
				sec.style.color = 'white';
			}
		}, 25)

	}
	document.querySelector('.timer__reset').addEventListener('click', resetCount);


	let winkInt;
	function winkRed() {
		let min = document.querySelector('.timer__min');
		let colon = document.querySelector('.timer__colon');
		let sec = document.querySelector('.timer__sec');

		let color = 'white';
		winkInt = setInterval(() => {
			if (color == 'white') {
				color = 'rgba(255, 0, 0, 0.705)';
				min.style.color = 'rgba(255, 0, 0, 0.705)';
				colon.style.color = 'rgba(255, 0, 0, 0.705)';
				sec.style.color = 'rgba(255, 0, 0, 0.705)';
			} else {
				color = 'white';
				min.style.color = 'white';
				colon.style.color = 'white';
				sec.style.color = 'white';
			}
		}, 400)
	}


	function sendTimerInfo() { //если посетитель переходит на другую страницу или закрывает ее (мне нужен только переход, по этому ставлю setTimeut.
		setTimeout(() => {         //С ним запрос не отсылается если выйти с сайта, но отсылается если перейти на др. страницу)
			let timerTimer = document.querySelector('.timer__timer');
			let min = document.querySelector('.timer__min');
			let sec = document.querySelector('.timer__sec');
			if (timerTimer.style.display == 'block') { //если элемент с циферблатом отображается, то отправить его цифры на сервер
				$.ajax({ //отсылает цифры с таймера
					url: "/timerInfo",
					contentType: "application/json",
					method: "POST",
					data: JSON.stringify({
						min: min.innerHTML,
						sec: sec.innerHTML
					})
				});
			} else { //если элемент с циферблатом скрыт, то сообщить серверу и сбросить куки пользователя с таймером
				$.ajax({
					url: "/resetTimerInfo", //Сбрасывает таймер
					contentType: "application/json",
					method: "GET"
				});
			}
		})
	}

	window.addEventListener('beforeunload', sendTimerInfo); //beforeunload срабатывает при переходе на другую страницу и при выходе с сайта


	function resetTimerInfo() {  //срабатывает только если посетитель закрывает страницу. 
		$.ajax({
			url: "/resetTimerInfo", //Сбрасывает таймер
			contentType: "application/json",
			method: "GET"
		});
	}
	window.addEventListener('unload', resetTimerInfo); //срабатывает только при выходе



}
timerMain();





function queryAnotherBase(event) {
	var target = event.target;
	[].forEach.call(target.options, (option) => {
		if (option.selected) {
			target.style.backgroundColor = "rgba(85, 84, 84, 0.250)";
			target.addEventListener('mousedown', stub);
			document.querySelector('.cards__button-next').removeEventListener('click', showNextWord);
			darkenElems("rgba(85, 84, 84, 0.250)")

			showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
			$.ajax({
				url: "/queryAnotherBase",
				contentType: "application/json",
				method: "PUT",
				data: JSON.stringify({
					baseName: option.value,
				}),
				success: function (data) {
					if (data.err) {
						$('.eng-word').html('');
						$('.rus-word').html('');
						showWarning("Произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);
						return
					}
					if (data.warn) {
						$('.eng-word').html('');
						$('.rus-word').html('');
						showWarning(data.warn, "rgb(238, 35, 20)", 3000, true);
						target.removeEventListener('mousedown', stub);
						target.style.backgroundColor = "rgba(0, 0, 0, 0.151)";
						return
					}
					if (data.base) {
						$('.eng-word').html('');
						$('.rus-word').html('');
						showNextWord.state = 0;
						words = data.base;
						target.removeEventListener('mousedown', stub);
						target.style.backgroundColor = "rgba(0, 0, 0, 0.151)";
						document.querySelector('.cards__button-next').addEventListener('click', showNextWord);
						darkenElems("rgba(0, 0, 0, 0.151)");
						showWarning('', 'rgba(236, 201, 41, 1)');
					}
				}
			});
			return
		}
	})
}
document.querySelector('.choose-list').addEventListener('change', queryAnotherBase);





function learnedTransfer(event) {

	if ($('.lang-info').html() == "eng") {
		if (!$('.eng-word').html()) {
			showWarning("Необходимо отобразить слово.", "rgb(238, 35, 20)", 1000, true);
			return
		} else {
			var word = $('.eng-word').html();
		}
	} else if ($('.lang-info').html() == "rus") {
		if (!$('.rus-word').html()) {
			showWarning("Необходимо отобразить слово.", "rgb(238, 35, 20)", 1000, true);
			return
		} else {
			var word = $('.rus-word').html();
		}
	}

	let opacity = 0;                                 //код для зажатия кнопки в течении 1 сек
	let color = `rgba(74, 226, 193, ${opacity})`;
	let int = setInterval(() => {
		event.target.style.backgroundColor = color;
		opacity += 0.025;
		color = `rgba(74, 226, 193, ${opacity})`;
		if (opacity > 1) {                              //1 сек прошла, кнопка стала зеленой и отправился запрос
			clearInterval(int);
			event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.151)';
			event.target.removeEventListener('mouseout', reset);
			event.target.removeEventListener('mouseup', reset);

			var list = document.querySelector('.choose-list');
			var selected;
			[].forEach.call(list.options, (option) => {
				if (option.selected) {
					selected = option.value;
					return
				}
			});
			showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
			$.ajax({
				url: "/learnedTransfer",
				contentType: "application/json",
				method: "PUT",
				data: JSON.stringify({
					word: word,
					selected: selected,
				}),
				success: function (data) {
					if (data.err) {
						showWarning("На сервере произошла ошибка. Сообщите администратору!", "rgb(238, 35, 20)", 3000, true);
						return
					}
					if (data.warn) {
						showWarning(data.warn, "rgb(238, 35, 20)", 3000, true);
						return
					}
					if (data.status) {
						delete words[word];
						showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 1000, true);
					}
				}
			});
		}
	}, 25)
	function reset() {
		clearInterval(int);
		event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.151)';
		event.target.removeEventListener('mouseout', reset);
		event.target.removeEventListener('mouseup', reset);
	}
	event.target.addEventListener('mouseout', reset);
	event.target.addEventListener('mouseup', reset);
}
document.querySelector('.cards__button-learned').addEventListener('mousedown', learnedTransfer);






function repeatTransfer(event) {
	if ($('.lang-info').html() == "eng") {
		if (!$('.eng-word').html()) {
			showWarning("Необходимо отобразить слово.", "rgb(238, 35, 20)", 1000, true);
			return
		} else {
			var word = $('.eng-word').html();
		}
	} else if ($('.lang-info').html() == "rus") {
		if (!$('.rus-word').html()) {
			showWarning("Необходимо отобразить слово.", "rgb(238, 35, 20)", 1000, true);
			return
		} else {
			var word = $('.rus-word').html();
		}
	}

	let opacity = 0;                                    //код для зажатия кнопки в течении 1 сек
	let color = `rgba(74, 226, 193, ${opacity})`;
	let int = setInterval(() => {
		event.target.style.backgroundColor = color;
		opacity += 0.025;
		color = `rgba(74, 226, 193, ${opacity})`;
		if (opacity > 1) {                                //1 сек прошла, кнопка стала зеленой и отправился запрос
			clearInterval(int);
			event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.151)';
			event.target.removeEventListener('mouseout', reset);
			event.target.removeEventListener('mouseup', reset);

			var list = document.querySelector('.choose-list');
			var selected;
			[].forEach.call(list.options, (option) => {
				if (option.selected) {
					selected = option.value;
					return
				}
			});

			showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');

			$.ajax({
				url: "/repeatTransfer",
				contentType: "application/json",
				method: "PUT",
				data: JSON.stringify({
					word: word,
					selected: selected,
				}),
				success: function (data) {
					if (data.warn) {
						showWarning(data.warn, "rgb(238, 35, 20)", 3000, true);
						return
					}
					if (data.err) {
						showWarning("На сервере произошла ошибка. Сообщите администратору!", "rgb(238, 35, 20)", 3000, true);
						return
					}
					if (data.status) {
						showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 1000, true);
					}
				}
			});
		}
	}, 25)
	function reset() {
		clearInterval(int);
		event.target.style.backgroundColor = 'rgba(0, 0, 0, 0.151)';
		event.target.removeEventListener('mouseout', reset);
		event.target.removeEventListener('mouseup', reset);
	}
	event.target.addEventListener('mouseout', reset);
	event.target.addEventListener('mouseup', reset);
}
document.querySelector('.cards__button-repeat').addEventListener('mousedown', repeatTransfer);






function darkenElems(color) {    //вспомогательная функция для затемнения кнопок или снятие затемнения
	var elems = document.querySelectorAll('.darken');
	elems.forEach(function (elem) {
		elem.style.backgroundColor = color;
	});;
}



function colorOfState(initColor, stateColor, elem, long) { //вспомогательная функция - цвет кнопки отражающий состояние операции
	if (!long) {
		var long = 700;
	}
	elem.style.backgroundColor = stateColor;
	setTimeout(() => {
		elem.style.backgroundColor = initColor;
	}, long);
}





function modalWindow() {
	let modal = document.createElement('div');
	modal.classList.add('modal-window');
	modal.style.cssText = `position: absolute;
  top: 0;
  left: 0;
  z-index: 9000;
  width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.185);`
	document.body.appendChild(modal);

	let message_1 = document.createElement('div');
	message_1.classList.add('modal-message');
	message_1.innerHTML = `Привет. Ты тут в первый раз, так что вот небольшая инструкция.`;
	message_1.style.cssText = `top: -3rem;
  left: 1.5rem;
  width: 27rem;
	height: 2rem;
	font-size: 0.9rem;`;
	document.body.querySelector('.card').appendChild(message_1);
	document.querySelector('.modal-message').addEventListener('mousedown', vaporize);
	vaporize.count = 1;
	appearance(message_1);


	let message_2 = document.createElement('div');
	message_2.classList.add('modal-message');
	message_2.innerHTML = `Здесь выбирается база<br> 
	которую ты будешь учить.`;
	message_2.style.cssText = `top: 19rem;
  left: -11rem;
  width: 10rem;
  height: 3.3rem;
	font-size: 0.8rem;`;

	let message_3 = document.createElement('div');
	message_3.classList.add('modal-message');
	message_3.innerHTML = `Пока у тебя только одна<br> 
	база содержащая слова,<br> 
	а две другие являются<br>
	вспомогательными.`;
	message_3.style.cssText = `top: 18.5rem;
  left: -12rem;
  width: 10.5rem;
  height: 4.5rem;
	font-size: 0.8rem;`;

	let message_4 = document.createElement('div');
	message_4.classList.add('modal-message');
	message_4.innerHTML = `next переключает слово<br> 
	и отображает перевод.`;
	message_4.style.cssText = `top: 5.2rem;
  left: 35.5rem;
  width: 9.5rem;
  height: 3rem;
	font-size: 0.78rem;`;

	let message_5 = document.createElement('div');
	message_5.classList.add('modal-message');
	message_5.innerHTML = `Жми learned, если выучил<br> слово.`;
	message_5.style.cssText = `top: 7.1rem;
  left: 35.5rem;
  width: 9.8rem;
  height: 3rem;
	font-size: 0.78rem;`;

	let message_6 = document.createElement('div');
	message_6.classList.add('modal-message');
	message_6.innerHTML = `Оно перенесется из <br>текущей базы в базу <br> learned.`;
	message_6.style.cssText = `top: 6.9rem;
  left: 35.5rem;
  width: 9rem;
  height: 3.5rem;
	font-size: 0.78rem;;`;

	let message_7 = document.createElement('div');
	message_7.classList.add('modal-message');
	message_7.innerHTML = `Так ты сможешь <br>
	отслеживать все <br>
	выученные слова.`;
	message_7.style.cssText = `top: 7rem;
  left: 35.5rem;
  width: 8.5rem;
  height: 3.4rem;
	font-size: 0.78rem;`;

	let message_8 = document.createElement('div');
	message_8.classList.add('modal-message');
	message_8.innerHTML = `Жми repeat если <br>
	хочешь повторить<br>
	слово отдельно.`;
	message_8.style.cssText = `top: 8.8rem;
  left: 35.5rem;
  width: 8.5rem;
  height: 3.5rem;
  font-size: 0.78rem;`;

	let message_9 = document.createElement('div');
	message_9.classList.add('modal-message');
	message_9.innerHTML = `Оно скопируется в базу<br>
	repeat. Так ты можешь<br>
	повторять забытые<br>
	слова.`;
	message_9.style.cssText = `top: 8.4rem;
  left: 35.5rem;
  width: 9.7rem;
  height: 4.5rem;
	font-size: 0.78rem;`;
	
	let message_10 = document.createElement('div');
	message_10.classList.add('modal-message');
	message_10.innerHTML = `lang переключает язык <br>
	с которого идет перевод.`;
	message_10.style.cssText = `top: 14.3rem;
  left: 35.5rem;
  width: 9.7rem;
  height: 3rem;
	font-size: 0.78rem;`;
	
	let message_11 = document.createElement('div');
	message_11.classList.add('modal-message');
	message_11.innerHTML = `Ну а это просто таймер.`;
	message_11.style.cssText = `top: 4.3rem;
  left: -3rem;
  width: 9.7rem;
  height: 2rem;
  font-size: 0.78rem;`;






	function* nextModalMessage() { //возвращает сообщения по порядку
		yield message_2;
		yield message_3;
		yield message_4;
		yield message_5;
		yield message_6;
		yield message_7;
		yield message_8;
		yield message_9;
		yield message_10;
		yield message_11;
		return
	}

	let gen = nextModalMessage();

	function vaporize(event) {
		let opacity = 0;                                 //код для зажатия кнопки в течении какого-то времени
		let color = `rgba(255, 255, 255, ${opacity})`;
		let int = setInterval(() => {
			event.target.style.backgroundColor = color;
			opacity += 0.015;
			color = `rgba(255, 255, 255, ${opacity})`;
			if (opacity > 0.4) {                              //время прошло
				clearInterval(int);
				event.target.removeEventListener('mousedown', vaporize);
				event.target.remove();
				let message = gen.next();
				if (!message.done) {
					if(vaporize.count == 10) {
						vaporize.count += 1;
						document.body.querySelector('.timer').appendChild(message.value);
						document.querySelector('.modal-message').addEventListener('mousedown', vaporize);
						appearance(message.value);
						return
					}
					vaporize.count += 1;
					document.body.querySelector('.card').appendChild(message.value);
					document.querySelector('.modal-message').addEventListener('mousedown', vaporize);
					appearance(message.value);
				} else {
					let modalWindow = document.querySelector('.modal-window');
					modalWindow.style.opacity = 1;
					let int = setInterval(() => {
						modalWindow.style.opacity -= 0.01;
						if (modalWindow.style.opacity == 0) {
							clearInterval(int);
							document.body.querySelector('.modal-window').remove();
						}
					}, 15)
				}
			}
		}, 15)

		function reset() {
			clearInterval(int);
			event.target.style.backgroundColor = 'rgba(255, 255, 255, 0.103)';
			event.target.removeEventListener('mouseout', reset);
			event.target.removeEventListener('mouseup', reset);
		}

		event.target.addEventListener('mouseout', reset);
		event.target.addEventListener('mouseup', reset);
	}

	function appearance(message) {
		let opacity = 0;
		setTimeout(() => {
			let int = setInterval(() => {
				opacity += 0.01;
				message.style.opacity = opacity;
				if (opacity > 1) {
					clearInterval(int);
				}
			}, 15);
		}, 100);
	}
}




