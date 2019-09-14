

function ajustName(name) {
  let loginButton = document.querySelector('.login__button');
  name = name.toUpperCase();
  let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  if(name.length <= 6) {
    loginButton.style.marginRight = 1.2 * windowFontSize + `px`;
  } else if (name.length == 7) {
    loginButton.style.marginRight = 2 * windowFontSize + `px`;
  } else if (name.length == 8) {
    loginButton.style.marginRight = 2.5 * windowFontSize + `px`;
  } else if (name.length == 9) {
    loginButton.style.marginRight = 3.5 * windowFontSize + `px`;
  } else if (name.length == 10) {
    loginButton.style.marginRight = 4.5 * windowFontSize + `px`;
  } else if (name.length == 11) {
    loginButton.style.marginRight = 5.5 * windowFontSize + `px`;
  } else if (name.length == 12) {
    loginButton.style.marginRight = 6.5 * windowFontSize + `px`;
  } else if (name.length == 13) {
    loginButton.style.marginRight = 7.5 * windowFontSize + `px`;
  } else if (name.length == 14) {
    loginButton.style.marginRight = 8.5 * windowFontSize + `px`;
  } else if (name.length == 15) {
    loginButton.style.marginRight = 9.5 * windowFontSize + `px`;
  }
  loginButton.innerHTML = name;
  loginButton.style.display = 'block'; //в css по умолчанию поставил display: none чтобы не было видно смещения ника при прогрузке страницы
}
ajustName(document.querySelector('.login__button').innerHTML);


function autoFontSizeHeight() {
  let height = document.documentElement.clientHeight;
  if (height > 770) {
    document.documentElement.style.fontSize = '100%';
  } else if (height < 770 && height > 700) {
    document.documentElement.style.fontSize = '90%';
  } else if (height < 700 && height > 625) {
    document.documentElement.style.fontSize = '80%';
  } else if (height < 625 && height > 530) {
    document.documentElement.style.fontSize = '70%';
  } else if (height < 530) {
    document.documentElement.style.fontSize = '60%';
  }
}
autoFontSizeHeight();
window.addEventListener('resize', autoFontSizeHeight);


function hideBottom() {
  let height = document.documentElement.clientHeight;
  let svg = document.querySelector('.svg');
  let inform = document.querySelector('.information');
  if (height < 500) {
    svg.style.display = 'none';
    inform.style.display = 'none';
  } else {
    svg.style.display = 'block';
    inform.style.display = 'block';
  }
}
hideBottom();
window.addEventListener('resize', hideBottom);



function showHideMenu() {
  let loginButton = document.querySelector('.login__button');
  let orButton = document.querySelector('.or-button');
  let regButton = document.querySelector('.register-button');

  function showLogOrReg() {
    if (showLogOrReg.working) return //если эта функция выполняется
    if (showLogOrReg.displayed) return //если кнопка login уже была нажата и появился выбор login или register
    if (showLogWindow.working) return //функция ниже выполняется
    if (showLogWindow.displayed) return //если окно login открыто
    if (showRegWindow.working) return //выполняется анимация окна регистрации
    if (showRegWindow.displayed) return //если открыто окно регистрации 
    if (showForgotPass.working) return //выполняется анимация окна с вводом почты для сброса пароля
    if (loginButton.innerHTML != 'LOGIN') return //если пользователь залогинен
    if (resetPassSendMail.working) return //если открыто окна ввода почты для отправки сброса пароля
    if (setNewPass.working) return //если открыто окно назначения нового пароля
    showLogOrReg.working = 1;
    orButton.style.opacity = 0;
    orButton.style.display = 'block';
    let opacity = 0;
    let int = setInterval(() => {
      opacity += 0.01;
      orButton.style.opacity = opacity;
      if (orButton.style.opacity >= 1) {
        clearInterval(int);
        regButton.style.opacity = 0;
        regButton.style.display = 'block';
        opacity = 0;
        int = setInterval(() => {
          opacity += 0.01;
          regButton.style.opacity = opacity;
          if (regButton.style.opacity >= 1) {
            clearInterval(int);
            showLogOrReg.displayed = 1;
            showLogOrReg.working = 0;
          }
        }, 5)
      }
    }, 5)
  }
  loginButton.addEventListener('click', showLogOrReg);



  function showLogWindow() {
    let logWindow = document.querySelector('.login__window');
    if (showLogOrReg.working) return //функция выше выполняется
    if (showLogWindow.working) return //эта функция выполняется
    if (!showLogOrReg.displayed) return //если еще не появилась кнопка register
    if (showLogWindow.displayed) return //если окно login открыто
    if (loginButton.innerHTML != 'LOGIN') return //если пользователь залогинен
    showLogWindow.working = 1;
    showLogOrReg.displayed = 0;
    regButton.style.opacity = 1;
    let int = setInterval(() => {
      regButton.style.opacity -= 0.01;
      if (regButton.style.opacity <= 0) {
        clearInterval(int);
        regButton.style.display = 'none';
        orButton.style.opacity = 1;
        int = setInterval(() => {
          orButton.style.opacity -= 0.01;
          if (orButton.style.opacity <= 0) {
            clearInterval(int);
            orButton.style.display = 'none';
            logWindow.style.opacity = 0;
            logWindow.style.display = 'block';
            let opacity = 0;
            int = setInterval(() => {
              opacity += 0.01;
              logWindow.style.opacity = opacity;
              if (logWindow.style.opacity >= 1) {
                clearInterval(int);
                showLogWindow.working = 0;
                showLogWindow.displayed = 1;
              }
            }, 5)
          }
        }, 5)
      }
    }, 5)
  }
  loginButton.addEventListener('click', showLogWindow);


  function hideWinIfLogClickAgain(e) { //скрыть окно (разные) при повторном нажатии на кнопку login
    if (hideWinIfLogClickAgain.working) return //если эта функция сейчас выполняется  
    if (showLogWindow.displayed) {  //если открыто окно логина
      hideWinIfLogClickAgain.working = 1;
      let logWindow = document.querySelector('.login__window');
      logWindow.style.opacity = 1;
      let int = setInterval(() => {
        logWindow.style.opacity -= 0.01;
        if (logWindow.style.opacity <= 0) {
          clearInterval(int);
          logWindow.style.display = 'none';
          showLogWindow.displayed = 0;
          hideWinIfLogClickAgain.working = 0;
        }
      }, 5);
    } else if (showForgotPass.displayed) { //если открыто окно с вводом почты для восстановления пароля
      hideWinIfLogClickAgain.working = 1;
      let resetPassWindow = document.querySelector('.reset-password__window');
      resetPassWindow.style.opacity = 1;
      let int = setInterval(() => {
        resetPassWindow.style.opacity -= 0.01;
        if (resetPassWindow.style.opacity <= 0) {
          clearInterval(int);
          resetPassWindow.style.display = 'none';
          showForgotPass.displayed = 0;
          hideWinIfLogClickAgain.working = 0;
        }
      }, 5);
    } else if (showRegWindow.displayed) { //если открыто окно регистрации
      hideWinIfLogClickAgain.working = 1;
      let regWindow = document.querySelector('.register__window');
      regWindow.style.opacity = 1;
      let int = setInterval(() => {
        regWindow.style.opacity -= 0.01;
        if (regWindow.style.opacity <= 0) {
          clearInterval(int);
          let name = document.querySelector('.register__name');
          let pass = document.querySelector('.register__password1');
          let pass2 = document.querySelector('.register__password2');
          let email = document.querySelector('.register__email');    
          name.value = '';
          pass.value = '';
          pass2.value = '';
          email.value = '';
          regWindow.style.display = 'none';
          showRegWindow.displayed = 0;
          hideWinIfLogClickAgain.working = 0;
        }
      }, 5);
    } else if (showExit.displayed) { //если отображается кнопка exit
      hideWinIfLogClickAgain.working = 1;
      let exitButton = document.querySelector('.exit-button');
      exitButton.style.opacity = 1;
      let int = setInterval(() => {
        exitButton.style.opacity -= 0.01;
        if (exitButton.style.opacity <= 0) {
          clearInterval(int);
          window.removeEventListener('resize', exitNewCoords);
          exitButton.removeEventListener('myClick', hideWinIfLogClickAgain);
          exitButton.remove();
          if(e.target.matches('.exit-button')) {
            ajustName('login');
          }
          showExit.displayed = 0;
          hideWinIfLogClickAgain.working = 0;
        }
      }, 5);
    } 
    try {
      if (document.querySelector('.new-password__window').style.display == 'block') { // если открыто окно установки нового пароля и пользователь кликает на кнопку LOGIN, то редирект на главную стр.
        window.location.href = '/';
      }
    } catch (e) {   
    }
  }
  loginButton.addEventListener('click', hideWinIfLogClickAgain);
  document.querySelector('.reset-password__cancel-button').addEventListener('click', hideWinIfLogClickAgain);
  document.querySelector('.register__cancel-button').addEventListener('click', hideWinIfLogClickAgain);
  document.querySelector('.register__ok-button').addEventListener('myClick', hideWinIfLogClickAgain);
  document.querySelector('.reset-password__ok-button').addEventListener('myClick', hideWinIfLogClickAgain);
  try {
    document.querySelector('.new-password__cancel-button').addEventListener('click', hideWinIfLogClickAgain);
  } catch (e) {
  }



  function showForgotPass() {
    if (showForgotPass.working) return //если функция выполняется в данный момент
    if (showForgotPass.displayed) return //если открыто окно с вводом почты для восстановления пароля
    showLogWindow.displayed = 0; //окно регистрации закрылось
    showForgotPass.working = 1;
    let resetPassWindow = document.querySelector('.reset-password__window');
    let logWindow = document.querySelector('.login__window');
    let int = setInterval(() => {
      logWindow.style.opacity -= 0.01;
      if (logWindow.style.opacity <= 0) {
        clearInterval(int);
        logWindow.style.display = 'none';
        opacity = 0;
        resetPassWindow.style.opacity = 0;
        resetPassWindow.style.display = 'block';
        int = setInterval(() => {
          opacity += 0.01;
          resetPassWindow.style.opacity = opacity;
          if (resetPassWindow.style.opacity >= 1) {
            clearInterval(int);
            showForgotPass.working = 0;
            showForgotPass.displayed = 1;
          }
        }, 5);
      }
    }, 5);
  }
  document.querySelector('.forgot-password').addEventListener('click', showForgotPass);

  function showRegWindow() {
    if (showLogOrReg.working) return //если еще выполняется анимация появление слов login register
    if (showRegWindow.working) return //если эта функция выполняется
    if (showRegWindow.displayed) return //если окно регистрации уже открыто
    showRegWindow.working = 1;
    showLogOrReg.displayed = 0;
    let regWindow = document.querySelector('.register__window');
    regButton.style.opacity = 1;
    let int = setInterval(() => {
      regButton.style.opacity -= 0.01;
      if (regButton.style.opacity <= 0) {
        clearInterval(int);
        regButton.style.display = 'none';
        orButton.style.opacity = 1;
        int = setInterval(() => {
          orButton.style.opacity -= 0.01;
          if (orButton.style.opacity <= 0) {
            clearInterval(int);
            orButton.style.display = 'none';
            regWindow.style.opacity = 0;
            regWindow.style.display = 'block';
            let opacity = 0;
            int = setInterval(() => {
              opacity += 0.01;
              regWindow.style.opacity = opacity;
              if (regWindow.style.opacity >= 1) {
                clearInterval(int);
                showRegWindow.working = 0;
                showRegWindow.displayed = 1;
              }
            }, 5)
          }
        }, 5)
      }
    }, 5)
  }
  regButton.addEventListener('click', showRegWindow);


  function hideWinIfLogSuccess() {
    let logWindow = document.querySelector('.login__window');
    logWindow.style.opacity = 1;
    let int = setInterval(() => {
      logWindow.style.opacity -= 0.01;
      if (logWindow.style.opacity <= 0) {
        clearInterval(int);
        logWindow.style.display = 'none';
        showLogWindow.displayed = 0;
      }
    }, 5);
  }
  document.querySelector('.login__ok-button').addEventListener('myClick', hideWinIfLogSuccess); //срабатываем при моем событии myClick (при успешном логине)


  function showExit() {
    if (loginButton.innerHTML == `LOGIN`) return //если пользователь не залогинен, то return 
    if (showExit.displayed) return
    showExit.displayed = 1;
    let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let logBwidth = parseFloat(getComputedStyle(loginButton).width);
    let logBleft = loginButton.getBoundingClientRect().left;
    let divExit = document.createElement('div');
    divExit.classList.add('exit-button');
    divExit.innerHTML = 'EXIT';
    divExit.style.left = `${logBleft + (logBwidth / 2) - (1.25 * windowFontSize)}px`;
    divExit.style.opacity = 0;
    divExit.style.display = 'block';
    document.body.insertBefore(divExit, document.body.querySelector('script'));
    let opacity = 0;
    int = setInterval(() => {
      opacity += 0.01;
      divExit.style.opacity = opacity;
      if (divExit.style.opacity >= 1) {
        clearInterval(int);
        document.querySelector('.exit-button').addEventListener('myClick', hideWinIfLogClickAgain); //сработает при клике по exit (функция скрытия окон). Объявил обработчик события тут, потому что именно тут создается кнопка Exit. Если объявить раньше, то ошибка
        document.querySelector('.exit-button').addEventListener('click', logout);
        window.addEventListener('resize', exitNewCoords); //обновление координат
      }
    }, 5)
  }
  loginButton.addEventListener('click', showExit);

  function exitNewCoords() { //обновляет координаты кнопки exit при изменении размеров окна
    let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let logBwidth = parseFloat(getComputedStyle(loginButton).width);
    let logBleft = loginButton.getBoundingClientRect().left;
    let exitButton = document.querySelector('.exit-button');
    exitButton.style.left = `${logBleft + (logBwidth / 2) - (1.25 * windowFontSize)}px`;
  }




}
showHideMenu();


function login() {
  if (login.working) return //если уже выполняется
  login.working = 1;
  let info = document.querySelector('.login__window__info');
  let name = document.querySelector('.login__name');
  let pass = document.querySelector('.login__password');
  let check = checkString('Используйте латинские буквы', true, 15, 'eng', info);
  name.addEventListener('input', check);
  if (/[^a-z0-9]/i.test(name.value) || name.value.length > 15 || name.value.length < 1) {
    showWarning('Имя не соответствует требованиям', "rgb(238, 35, 20)", info, 1000, true);
    login.working = 0;
    return
  }
  if (pass.value.length > 50) {
    showWarning('Пароль слишком длинный', "rgb(238, 35, 20)", info, 1000, true);
    login.working = 0;
    return
  }
  if (pass.value.length < 8) {
    showWarning('Пароль слишком короткий', "rgb(238, 35, 20)", info, 1000, true);
    login.working = 0;
    return
  }
  showWarning('Выполняется...', 'rgba(236, 201, 41, 1)', info);
  $.ajax({
    url: "/login",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({
      name: name.value,
      pass: pass.value
    }),
    success: function (user) {
      setTimeout(()=>{ //чтобы не моргала надпись "Выполняется..." можно потом убрать
        if (user.err) return showWarning('Непредвиденная ошибка', "rgb(238, 35, 20)", info, 3000, true); login.working = 0;
        if (user.warn) return showWarning(user.warn, "rgb(238, 35, 20)", info, 3000, true); login.working = 0;
  
        showWarning('', 'white', info);
        name.value = ``;
        pass.value = ``;
        ajustName(user.name);
        let okButton = document.querySelector('.login__ok-button');
        let event = new Event("myClick", { bubbles: true });
        okButton.dispatchEvent(event);
        login.working = 0;
      }, 500);
    }
  });
}
document.querySelector('.login__ok-button').addEventListener('click', login);
function checkLogin() {
  let info = document.querySelector('.login__window__info');
  let login = document.querySelector('.login__name');
  let check = checkString('Используйте латинские буквы', true, 15, 'eng', info);
  login.addEventListener('input', check);
}
checkLogin();




function logout(e) { 
  $.ajax({
    url: "/logout",
    contentType: "application/json",
    method: "GET",
    success: function (user) {
      if (user.warn) return alert(user.warn); login.working = 0;
      if (user.success) {
        let event = new Event("myClick", { bubbles: true });
        e.target.dispatchEvent(event);
        // ajustName('login');
      }
    }
  });
}


function registration(e) {
  if (registration.working) return
  let name = document.querySelector('.register__name').value;
  let pass = document.querySelector('.register__password1').value;
  let pass2 = document.querySelector('.register__password2').value;
  let email = document.querySelector('.register__email').value;
  let info = document.querySelector('.register__info');
  name = deleteSpace(name);
  email = deleteSpace(email);
  
  if(!name || !pass|| !pass2 || !email) {
    showWarning('Заполните все поля', "rgb(238, 35, 20)", info, 1000, true);
    return
	} if (/[^a-z0-9]/i.test(name)) {
    showWarning('Для имени используйте латиницу', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (name.length > 15) {
    showWarning('Имя слишком длинное', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (name.length < 1) {
    showWarning('Имя слишком короткое', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (/[ ]/i.test(pass)) {
    showWarning('Пароль содержит пробел', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (pass.length > 50) {
    showWarning('Пароль слишком длинный', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (pass.length < 8) {
    showWarning('Пароль слишком короткий', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if (pass !== pass2) {
    showWarning('Пароли должны совпадать', "rgb(238, 35, 20)", info, 1000, true);
    return
  } if(!validateEmail(email)) {
    showWarning('Email имеет неверный формат', "rgb(238, 35, 20)", info, 1000, true);
    return
  }
  registration.working = 1;
  showWarning('Выполняется...', 'rgba(236, 201, 41, 1)', info);
  $.ajax({
    url: "/registration",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({
      name,
      pass,
      email
    }),
    success: function (user) {
      if (user.err) return showWarning('Непредвиденная ошибка', "rgb(238, 35, 20)", info, 3000, true); registration.working = 0;
      if (user.warn) return showWarning(user.warn, "rgb(238, 35, 20)", info, 3000, true); registration.working = 0;
      if (user.success) {
        showWarning('На почту отправдено письмо...', "rgba(74, 226, 193, 1)", info);
        setTimeout(()=>{showWarning('обязательно проверь его!', "rgba(74, 226, 193, 1)", info, 1500);}, 1500);
        setTimeout(()=>{        
          ajustName(name);   
          let event = new Event("myClick", { bubbles: true });
          e.target.dispatchEvent(event);
          setTimeout(()=>{registration.working = 0;}, 5000); //через 5 сек после запуска анимации скрытия окна
        }, 2500);
      }
    }
  });
}
document.querySelector('.register__ok-button').addEventListener('click', registration);
function checkRegistration(){
  let info = document.querySelector('.register__info');
  let name = document.querySelector('.register__name');
  let check = checkString('Используйте латинские буквы', true, 15, 'eng', info);
  name.addEventListener('input', check);
}
checkRegistration();




function resetPassSendMail(e) {
  if(resetPassSendMail.working) return
  resetPassSendMail.working = 1;
  let email = document.querySelector('.reset-password__email');
  let info = document.querySelector('.reset-password__info');
  if(!validateEmail(email.value)) {
    showWarning('Email имеет неверный формат', "rgb(238, 35, 20)", info, 1000, true);
    resetPassSendMail.working = 0;
    return
  }
  $.ajax({
    url: "/resetPassSendMail",
    contentType: "application/json",
    method: "PUT",
    data: JSON.stringify({
      email: email.value
    }),
    success: function (result) {
      if (result.err) return showWarning('Непредвиденная ошибка', "rgb(238, 35, 20)", info, 3000, true); resetPassSendMail.working = 0;
      if (result.warn) return showWarning(result.warn, "rgb(238, 35, 20)", info, 3000, true); resetPassSendMail.working = 0;
      if (result.success) {
        showWarning('На почту отправдено письмо', "rgba(74, 226, 193, 1)", info, 2000, true); 
        setTimeout(()=>{
          let event = new Event("myClick", { bubbles: true });
          e.target.dispatchEvent(event);
          setTimeout(()=>{
            email.value = '';
            resetPassSendMail.working = 0;
          }, 3000);   
        }, 2000);               
      }
    }
  });
}
document.querySelector('.reset-password__ok-button').addEventListener('click', resetPassSendMail);




function setNewPass() {
  if(setNewPass.working) return
  let pass = document.querySelector('.new-password__password1').value;
  let pass2 = document.querySelector('.new-password__password2').value;
  let id = window.location.search.slice(4);
  let info = document.querySelector('.new-password__info');
  setNewPass.working = 1;
  if (/[ ]/i.test(pass)) {
    showWarning('Пароль содержит пробел', "rgb(238, 35, 20)", info, 1000, true);
    setNewPass.working = 0;
    return
  } if (pass.length > 50) {
    showWarning('Пароль слишком длинный', "rgb(238, 35, 20)", info, 1000, true);
    setNewPass.working = 0;
    return
  } if (pass.length < 8) {
    showWarning('Пароль слишком короткий', "rgb(238, 35, 20)", info, 1000, true);
    setNewPass.working = 0;
    return
  } if (pass !== pass2) {
    showWarning('Пароли должны совпадать', "rgb(238, 35, 20)", info, 1000, true);
    setNewPass.working = 0;
    return
  } 
  $.ajax({
    url: "/setNewPass",
    contentType: "application/json",
    method: "PUT",
    data: JSON.stringify({
      password: pass,
      resetId: id
    }),
    success: function (result) {
      if (result.err) return showWarning('Непредвиденная ошибка', "rgb(238, 35, 20)", info, 3000, true); setNewPass.working = 0;
      if (result.warn) return showWarning(result.warn, "rgb(238, 35, 20)", info, 3000, true); setNewPass.working = 0;
      if (result.success) {
        showWarning('Пароль успешно изменен', "rgba(74, 226, 193, 1)", info, 2000, true); 
        setTimeout(()=>{
          setNewPass.working = 0;
          window.location.href = "/";
        }, 2000);
      }
    }
  });  
}
try {
  document.querySelector('.new-password__ok-button').addEventListener('click', setNewPass);
} catch (e) {
}







function preventDef(event) {
  if (event.target.matches('.login__button') || event.target.matches('.or-button') || event.target.matches('.register-button')) {
    event.preventDefault();
  }
}
document.addEventListener('mousedown', preventDef);



function checkString(warn, num, length, lang, elem) { //выводит предупреждение и следит за длиной вводимой строки (если нужно)
  var state = 0;                          //warn - пред, num - поддержка цифр, length - проверка длины, lang - язык, spec - спец символы
  return function foo(event) {
    var target = event.target;
    if (length) {
      if (target.value.length > length) {
        target.value = target.value.slice(0, length);
      }
    }
    if (lang === "eng") {
      if (!num) {
        if (!state && /[^a-z]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)", elem);
        } else if (state && !/[^a-z]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)", elem);
        }
      } else {
        if (!state && /[^a-z0-9]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)", elem);
        } else if (state && !/[^a-z0-9]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)", elem);
        }
      }
      return
    }
    if (lang == "rus") {
      if (!num) {
        if (!state && /[^а-я]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)", elem);
        } else if (state && !/[^а-я]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)", elem);
        }
      } else {
        if (!state && /[^а-я0-9]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)", elem);
        } else if (state && !/[^а-я0-9]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)", elem);
        }
      }
    }
  }
}




try {
  function timeRemain () { // функция для страницы сообщений
    let timer = document.querySelector('.time-remain');
    setTimeout(function repeat() {
      try{
        timer.innerHTML -= 1;
        if(timer.innerHTML > 0) {
          setTimeout(repeat, 1000);
        } else {
          window.location.href = "/"
        }
      } catch(e) {
      }
    }, 1000); 
  }
  timeRemain ();
} catch(e) { 
}






function showWarning(text, color, elem, time, busy) {
  if (showWarning.busy) return
  var elem = elem;
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

function validateEmail(email) {
  //если true значит формат верный
  var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return pattern.test(String(email).toLowerCase());
}