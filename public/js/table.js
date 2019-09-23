let sortType; //язык сортировки таблицы

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


$.ajax({ //получение базы при загрузке страницы
  url: "/getInitBaseForTable",
  contentType: "application/json",
  method: "GET",
  success: function (base) {
    if (base.warn) return showWarning(base.warn, "rgb(238, 35, 20)", 3000, true);
    if (base.err) return showWarning("Произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);

    words = base.words;
    let baseName = base.baseName;
    getDirectBase.presentBase = baseName;

    var options = document.querySelector('.add-word__choose-list').options;
    [].forEach.call(options, (option) => {
      if (option.innerHTML === baseName) {
        option.selected = true;
        return
      }
    });
    addWordsInTrList(words);
    delRows(); //когда из базы загрузились слова, то можно удалять старые строки
    autoSortAZ(sortType);
    deleteButtons();
    createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
    showFirstPage(sortTrInTbody.tbodyList);
    setTimeout(function () {
      autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
    }, 10);
  }
});


function delRows() {
  document.querySelector('tbody').remove();
}




function addWordsInTrList(words) {
  addWordsInTrList.trList = [];
  for (var key in words) {
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    td1.innerHTML = key;
    td2.innerHTML = words[key];
    tr.appendChild(td1);
    tr.appendChild(td2);
    addWordsInTrList.trList.push(tr);
  }
}
// addWordsInTrList(words);


function fakeTbody() { //нужна для создания массива с пустыми строками, на случай если переменная words пуста
  let tbody = document.createElement('tbody');
  for (let i = 0; i < 18; i++) {
    let tr = document.createElement('tr');
    tr.innerHTML = `<td></td><td></td>`
    tbody.appendChild(tr);
  }
  return tbody
}



function sortTrInTbody(trList) {
  sortTrInTbody.tbodyList = [];
  var wordsCount = 0;
  var pagesCount = 1;
  var buttonState = 1;
  var tbody = document.createElement('tbody');
  for (var i = 0; i < trList.length; i++) {
    if (wordsCount < 18) {
      tbody.appendChild(trList[i]);
      wordsCount++
      if (wordsCount == 18 || i == (trList.length - 1)) {
        pagesCount++
        wordsCount = 0;
        buttonState = 0;
        sortTrInTbody.tbodyList.push(tbody);
        var tbody = document.createElement('tbody');
      }

    }
  }
}



function createButtons(tbodyList) {
  var pagesCount = 0;
  if (tbodyList.length < 1) {
    tbodyList[0] = fakeTbody();
  }
  for (var i = 0; i < (tbodyList.length); i++) {
    pagesCount++
    if (pagesCount < 7) {
      var pageButton = document.createElement('div');
      var lastButton = document.querySelector('.table__page-buttons').lastElementChild;
      pageButton.classList.add('table__page-button');
      pageButton.innerHTML = pagesCount;

      if (pagesCount == 1) {
        pageButton.style.left = +lastButton.style.left + lastButton.offsetWidth + 1 + "px";  //Так как pageButton.style.left сначала равен 0 ( так как определяется только после установки значения вручную) и parseInt дает NaN.
        pageButton.classList.add('table__page-button--colored');
      }
      if (pagesCount > 1) {
        pageButton.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
      }
      document.querySelector('.table__page-buttons').appendChild(pageButton);

      if (pagesCount === tbodyList.length) {
        var rightArrow = document.createElement('div');
        lastButton = document.querySelector('.table__page-buttons').lastElementChild;
        rightArrow.classList.add('table__page-button');
        rightArrow.innerHTML = '>';
        rightArrow.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
        document.querySelector('.table__page-buttons').appendChild(rightArrow);
      }

    } else {
      if (tbodyList.length > 10) {
        var dots = document.createElement('div');
        lastButton = document.querySelector('.table__page-buttons').lastElementChild;
        dots.classList.add('table__page-button');
        dots.innerHTML = '...';
        dots.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
        document.querySelector('.table__page-buttons').appendChild(dots);
        pageButton = document.createElement('div');
        lastButton = document.querySelector('.table__page-buttons').lastElementChild;
        pageButton.classList.add('table__page-button');
        pageButton.innerHTML = tbodyList.length;
        pageButton.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
        document.querySelector('.table__page-buttons').appendChild(pageButton);

        var rightArrow = document.createElement('div');
        lastButton = document.querySelector('.table__page-buttons').lastElementChild;
        rightArrow.classList.add('table__page-button');
        rightArrow.innerHTML = '>';
        rightArrow.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
        document.querySelector('.table__page-buttons').appendChild(rightArrow);
        break
      } else {
        pageButton = document.createElement('div');
        lastButton = document.querySelector('.table__page-buttons').lastElementChild;
        pageButton.classList.add('table__page-button');
        pageButton.innerHTML = pagesCount;
        pageButton.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
        document.querySelector('.table__page-buttons').appendChild(pageButton);
        if (pagesCount === tbodyList.length) {
          var rightArrow = document.createElement('div');
          lastButton = document.querySelector('.table__page-buttons').lastElementChild;
          rightArrow.classList.add('table__page-button');
          rightArrow.innerHTML = '>';
          rightArrow.style.left = parseInt(lastButton.style.left) + +lastButton.offsetWidth + 1 + "px";
          document.querySelector('.table__page-buttons').appendChild(rightArrow);
        }
      }
    }
  }
}
// createButtons(sortTrInTbody.tbodyList);




function deleteButtons() {
  var buttons = document.querySelectorAll('.table__page-button');
  for (let i = 1; i < buttons.length; i++) {
    buttons[i].remove();
  }
}




function showFirstPage(tbodyList) {
  document.querySelector('table').appendChild(tbodyList[0]);
  addEmptyRows(tbodyList[0].children);
  document.querySelectorAll('.table__page-button')[1].classList.add('table__page-button--colored');
}
// showFirstPage(sortTrInTbody.tbodyList);


function showFirstIfLongPress(event) {
  if (!event.target.matches('.table__page-button') ||
   !event.target.innerHTML === '&lt;' ||
   document.querySelector('.table__page-button--colored').innerHTML == 1) return


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
      if(searchWords.searching) {
        foundWordsInTrList(searchWords.words);
        delRows(); //когда из базы загрузились слова, то можно удалять старые строки
        autoSortAZ(sortType);
        deleteButtons();
        createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
        showFirstPage(sortTrInTbody.tbodyList);
        setTimeout(function () {
          autoBaseName(getDirectBase.presentBase, `matches: ${searchWords.words.length}`); //через 10мс после загрузки страница размещает название базы
        }, 10);
      } else {
        addWordsInTrList(words);
        delRows(); //когда из базы загрузились слова, то можно удалять старые строки
        autoSortAZ(sortType);
        deleteButtons();
        createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
        showFirstPage(sortTrInTbody.tbodyList);
        setTimeout(function () {
          autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
        }, 10);
      }
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
document.querySelector('.table__page-button').addEventListener('mousedown', showFirstIfLongPress);


function addEmptyRows(row) { // после того как страница загрузилась добавляет в tbody пустые строки
  if (row.length < 18) {
    let tbody = document.querySelector('tbody');
    let i = 18 - row.length;
    while (i) {
      let tr = document.createElement('tr');
      tr.innerHTML = `<td></td><td></td>`;
      tbody.appendChild(tr);
      i--
    }
  }
}



function pageChanger(event) {
  var target = event.target;
  if (target.innerHTML === "...") return

  if (document.querySelector('.alt__input')) { //убирает input с редактированием слова, если тот был
    document.querySelector('.alt__input').remove();
    operationsWithTable.editing = 0;
  }

  if (target.matches('.table__page-button--colored')) return
  var pages = document.querySelectorAll('.table__page-button');
  var totalPages = pages[pages.length - 2].innerHTML;
  if (totalPages < 11) { //если страниц меньше 11
    var presentPage = document.querySelector('.table__page-button--colored');
    if (target.innerHTML === '&gt;' && presentPage.nextElementSibling && presentPage.nextElementSibling.innerHTML != '&gt;') { //если нажать стрелку вперед
      var nextPage = presentPage.nextElementSibling;
      presentPage.classList.remove('table__page-button--colored');
      nextPage.classList.add('table__page-button--colored');
      document.querySelector('tbody').remove();
      if (!sortTrInTbody.tbodyList[nextPage.innerHTML - 1]) {
        sortTrInTbody.tbodyList[nextPage.innerHTML - 1] = fakeTbody();
      }
      document.querySelector('table').appendChild(sortTrInTbody.tbodyList[nextPage.innerHTML - 1]);
      addEmptyRows(sortTrInTbody.tbodyList[nextPage.innerHTML - 1].children);
    } else if (target.innerHTML === '&lt;' && presentPage.previousElementSibling && presentPage.previousElementSibling.innerHTML != '&lt;') { //если нажать стрелку назад
      var previousPage = presentPage.previousElementSibling;
      presentPage.classList.remove('table__page-button--colored');
      previousPage.classList.add('table__page-button--colored');
      document.querySelector('tbody').remove();
      if (!sortTrInTbody.tbodyList[previousPage.innerHTML - 1]) {
        sortTrInTbody.tbodyList[previousPage.innerHTML - 1] = fakeTbody();
      }
      document.querySelector('table').appendChild(sortTrInTbody.tbodyList[previousPage.innerHTML - 1]);
      addEmptyRows(sortTrInTbody.tbodyList[previousPage.innerHTML - 1].children);
    } else if (target.innerHTML != '&gt;' && target.innerHTML != '&lt;') {  //если нажать на цифру
      presentPage.classList.remove('table__page-button--colored');
      target.classList.add('table__page-button--colored');
      document.querySelector('tbody').remove();
      if (!sortTrInTbody.tbodyList[target.innerHTML - 1]) {
        sortTrInTbody.tbodyList[target.innerHTML - 1] = fakeTbody();
      }
      document.querySelector('table').appendChild(sortTrInTbody.tbodyList[target.innerHTML - 1]);
      addEmptyRows(sortTrInTbody.tbodyList[target.innerHTML - 1].children);
    }
  } else { //если страниц больше 11
    var presentPage = document.querySelector('.table__page-button--colored');
    if (target.innerHTML === '&gt;' && presentPage.nextElementSibling && presentPage.nextElementSibling.innerHTML != '&gt;') { //если нажать стрелку вперед
      if (presentPage.nextElementSibling && presentPage.nextElementSibling.innerHTML != '...') { //если следующая страница это не "..."
        var nextPage = presentPage.nextElementSibling;
        presentPage.classList.remove('table__page-button--colored');
        nextPage.classList.add('table__page-button--colored');
        document.querySelector('tbody').remove();
        if (!sortTrInTbody.tbodyList[nextPage.innerHTML - 1]) {
          sortTrInTbody.tbodyList[nextPage.innerHTML - 1] = fakeTbody();
        }
        document.querySelector('table').appendChild(sortTrInTbody.tbodyList[nextPage.innerHTML - 1]);
        addEmptyRows(sortTrInTbody.tbodyList[nextPage.innerHTML - 1].children);
      } else { //если следующая страница ...
        var pages = document.querySelectorAll('.table__page-button');
        var totalPages = pages[pages.length - 2].innerHTML;
        if ((+presentPage.innerHTML + 6) < totalPages) { //если до конца таблицы больше 6 страниц
          for (let i = 1; i < 7; i++) {
            pages[i].innerHTML = +presentPage.innerHTML + i;
          }
          presentPage.classList.remove('table__page-button--colored');
          pages[1].classList.add('table__page-button--colored');
          document.querySelector('tbody').remove();
          if (!sortTrInTbody.tbodyList[pages[1].innerHTML - 1]) {
            sortTrInTbody.tbodyList[pages[1].innerHTML - 1] = fakeTbody();
          }
          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pages[1].innerHTML - 1]);
          addEmptyRows(sortTrInTbody.tbodyList[pages[1].innerHTML - 1].children);
        } else { //если до конца таблицы меньше 6 страниц
          if ((+presentPage.innerHTML + 3) < totalPages) { //если до конца таблицы больше 3 страниц
            for (let i = 1; i < 7; i++) {
              pages[i].innerHTML = +pages[i].innerHTML + 1;
            }
            document.querySelector('tbody').remove();
            if (!sortTrInTbody.tbodyList[presentPage.innerHTML - 1]) {
              sortTrInTbody.tbodyList[presentPage.innerHTML - 1] = fakeTbody();
            }
            document.querySelector('table').appendChild(sortTrInTbody.tbodyList[presentPage.innerHTML - 1]);
            addEmptyRows(sortTrInTbody.tbodyList[presentPage.innerHTML - 1].children);
          } else { //если до конца таблицы 3 страницы
            for (let i = 1; i < 7; i++) {
              pages[i].innerHTML = +pages[i].innerHTML + 1;
            }
            pages[7].innerHTML = totalPages - 1;
          }
        }
      }
    } else if (target.innerHTML === '&lt;' && presentPage.previousElementSibling) { //если нажать стрелку назад
      if (presentPage.innerHTML === '1') return
      if (presentPage.previousElementSibling.innerHTML != '&lt;') { //если страница в ряду не крайняя левая
        var previousPage = presentPage.previousElementSibling; //то просто отнимаю по единице у каждой кнопки, а активной становится та что левее
        presentPage.classList.remove('table__page-button--colored');
        previousPage.classList.add('table__page-button--colored');
        document.querySelector('tbody').remove();
        if (!sortTrInTbody.tbodyList[previousPage.innerHTML - 1]) {
          sortTrInTbody.tbodyList[previousPage.innerHTML - 1] = fakeTbody();
        }
        document.querySelector('table').appendChild(sortTrInTbody.tbodyList[previousPage.innerHTML - 1]);
        addEmptyRows(sortTrInTbody.tbodyList[previousPage.innerHTML - 1].children);
      } else { //если страницы является крайней левой
        if (presentPage.innerHTML > 6) { //если до начала еще больше 6 страниц
          for (let i = 6; i > 0; i--) { //то перестоить кнопки и сделать активной самую правую
            pages[i].innerHTML = +pages[i].innerHTML - 6;  //и добавить многоточия если вдруг их не было
          }
          presentPage.classList.remove('table__page-button--colored');
          pages[6].classList.add('table__page-button--colored');
          pages[7].innerHTML = '...';
          document.querySelector('tbody').remove();
          if (!sortTrInTbody.tbodyList[pages[6].innerHTML - 1]) {
            sortTrInTbody.tbodyList[pages[6].innerHTML - 1] = fakeTbody();
          }
          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pages[6].innerHTML - 1]);
          addEmptyRows(sortTrInTbody.tbodyList[pages[6].innerHTML - 1].children);
        } else if (presentPage.innerHTML > 1) { //если  до начала меньше 6 страниц, но больше 1
          for (let i = 6; i > 0; i--) { //позиция активной кнопки не меняется, а номера кнопок вычитаются на 1
            pages[i].innerHTML = +pages[i].innerHTML - 1;
          }
          pages[7].innerHTML = '...';
          document.querySelector('tbody').remove();
          if (!sortTrInTbody.tbodyList[presentPage.innerHTML - 1]) {
            sortTrInTbody.tbodyList[presentPage.innerHTML - 1] = fakeTbody();
          }
          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[presentPage.innerHTML - 1]);
          addEmptyRows(sortTrInTbody.tbodyList[presentPage.innerHTML - 1].children);
        }
      }
    } else if (target.innerHTML != '&gt;' && target.innerHTML != '&lt;') {  //если нажать на цифру
      if (target.innerHTML === totalPages) { //если нажать на последнюю страницу
        let j = 7;
        for (let i = 1; i < 8; i++) {
          pages[i].innerHTML = totalPages - j;
          j--
        }
        presentPage.classList.remove('table__page-button--colored');
        target.classList.add('table__page-button--colored');
        document.querySelector('tbody').remove();
        if (!sortTrInTbody.tbodyList[target.innerHTML - 1]) {
          sortTrInTbody.tbodyList[target.innerHTML - 1] = fakeTbody();
        }
        document.querySelector('table').appendChild(sortTrInTbody.tbodyList[target.innerHTML - 1]);
        addEmptyRows(sortTrInTbody.tbodyList[target.innerHTML - 1].children);
      } else { //если нажать на любую страницу кроме последней правой
        presentPage.classList.remove('table__page-button--colored');
        target.classList.add('table__page-button--colored');
        document.querySelector('tbody').remove();
        if (!sortTrInTbody.tbodyList[target.innerHTML - 1]) {
          sortTrInTbody.tbodyList[target.innerHTML - 1] = fakeTbody();
        }
        document.querySelector('table').appendChild(sortTrInTbody.tbodyList[target.innerHTML - 1]);
        addEmptyRows(sortTrInTbody.tbodyList[target.innerHTML - 1].children);
      }
    }
  }
}
document.querySelector('.table__page-buttons').addEventListener('mouseup', pageChanger);




function autoSortAZ(sortType) {

  switch (sortType) {
    case undefined:
      addWordsInTrList.trList.sort(compareAZ);
      sortTrInTbody(addWordsInTrList.trList);
      break;
    case 'z-a':
      addWordsInTrList.trList.sort(compareZA);
      sortTrInTbody(addWordsInTrList.trList);
      break;
    case 'a-r':
      addWordsInTrList.trList.sort(compareAR);
      sortTrInTbody(addWordsInTrList.trList);
      break;
    case 'r-a':
      addWordsInTrList.trList.sort(compareRA);
      sortTrInTbody(addWordsInTrList.trList);
      break;
    case 'a-z':
      addWordsInTrList.trList.sort(compareAZ);
      sortTrInTbody(addWordsInTrList.trList);
      break;
  }



  function compareAZ(a, b) {
    if (a.firstElementChild.innerHTML > b.firstElementChild.innerHTML) return 1;
    if (a.firstElementChild.innerHTML < b.firstElementChild.innerHTML) return -1;
  }
  function compareZA(a, b) {
    if (a.firstElementChild.innerHTML > b.firstElementChild.innerHTML) return -1;
    if (a.firstElementChild.innerHTML < b.firstElementChild.innerHTML) return 1;
  }
  function compareAR(a, b) {
    if (a.lastElementChild.innerHTML > b.lastElementChild.innerHTML) return 1;
    if (a.lastElementChild.innerHTML < b.lastElementChild.innerHTML) return -1;
  }
  function compareRA(a, b) {
    if (a.lastElementChild.innerHTML > b.lastElementChild.innerHTML) return -1;
    if (a.lastElementChild.innerHTML < b.lastElementChild.innerHTML) return 1;
  }
}


function sortTable(event) {
  if (event.target.closest('.table-sort__window')) {

    var target = event.target
    clearAuxiliaryWindows();
    function sorter(target) {
      if (document.querySelector('.colored')) {
        document.querySelector('.colored').classList.remove('colored');
      }
      target.classList.add('colored');

      if (searchWords.searching) {
        addWordsInTrList.trList.sort(compare);
        delRows();
        sortTrInTbody(addWordsInTrList.trList);
        deleteButtons();
        createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
        showFirstPage(sortTrInTbody.tbodyList);
        setTimeout(function () {
          autoBaseName(getDirectBase.presentBase, `matches: ${searchWords.words.length}`);
        }, 10);
      } else {
        addWordsInTrList.trList.sort(compare);
        delRows(); //когда из базы загрузились слова, то можно удалять старые строки
        sortTrInTbody(addWordsInTrList.trList);
        deleteButtons();
        createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
        showFirstPage(sortTrInTbody.tbodyList);
        setTimeout(function () {
          autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
        }, 10);
      }
    }

    if (event.target.classList.contains('z-a')) {
      function compare(a, b) {
        if (a.firstElementChild.innerHTML > b.firstElementChild.innerHTML) return -1;
        if (a.firstElementChild.innerHTML < b.firstElementChild.innerHTML) return 1;
      }
      sortType = 'z-a';
      sorter(target);
      return
    }
    if (event.target.classList.contains('a-z')) {
      function compare(a, b) {
        if (a.firstElementChild.innerHTML > b.firstElementChild.innerHTML) return 1;
        if (a.firstElementChild.innerHTML < b.firstElementChild.innerHTML) return -1;
      }
      sortType = 'a-z';
      sorter(target)
      return
    }
    if (event.target.classList.contains('a-r')) {
      function compare(a, b) {
        if (a.lastElementChild.innerHTML > b.lastElementChild.innerHTML) return 1;
        if (a.lastElementChild.innerHTML < b.lastElementChild.innerHTML) return -1;
      }
      sortType = 'a-r';
      sorter(target)
      return
    }
    if (event.target.classList.contains('r-a')) {
      function compare(a, b) {
        if (a.lastElementChild.innerHTML > b.lastElementChild.innerHTML) return -1;
        if (a.lastElementChild.innerHTML < b.lastElementChild.innerHTML) return 1;
      }
      sortType = 'r-a';
      sorter(target)
      return
    }

  }
}
document.addEventListener('click', sortTable);



function clearAuxiliaryWindows() { //заплатка убирающая окна с операциями таблицы, если добавляется новое слово
  if (document.querySelector('.alt__input')) {
    document.querySelector('.alt__input').remove();
    operationsWithTable.editing = 0;
  }
  if (document.body.querySelector('.delete-word').style.display === 'block') {
    if (document.querySelector('.branded')) {
      let branded = document.querySelectorAll('.branded');
      let circle = document.querySelectorAll('.red-circle');
      for (let i = 0; i < branded.length; i++) {
        branded[i].classList.remove('branded');
        circle[i].remove();
      }
    }
    document.body.querySelector('.delete-word').style.display = 'none';
    document.body.querySelector('.delete-word__count').innerHTML = 1;
    operationsWithTable.deletion = 0;
    operationsWithTable.countDelWords = 0;
    delete operationsWithTable.arr
  }
  if (document.body.querySelector('.choose-transfer-base').style.display === 'block') {
    if (document.querySelector('.branded')) {
      let branded = document.querySelectorAll('.branded');
      let circle = document.querySelectorAll('.green-circle');
      for (let i = 0; i < branded.length; i++) {
        branded[i].classList.remove('branded');
        circle[i].remove();
      }
    }
    document.body.querySelector('.choose-transfer-base').style.display = 'none';
    operationsWithTable.firstTime = 0;
    operationsWithTable.transfer = 0;
    delete operationsWithTable.arr
  }
}


// function preventOnMouseDown(event) {
//   if (event.target.closest('.table-sort') || event.target.closest('.table__page-buttons')
//     || event.target.closest('thead') || event.target.closest('.menu')) {
//     event.target.addEventListener('mousedown', function (event) {
//       event.preventDefault();
//     });
//   }
// }
// document.addEventListener('mousemove', preventOnMouseDown);



// target.style.paddingLeft = 0.35 * 16 + "px";

function buttonAnimation(obj) {

  var initialWidth = parseFloat(getComputedStyle(obj.elem).width);

  function increaseWidth(event) {
    if (!increaseWidth.start) { //если анимация кнопки не запущена, то true

      increaseWidth.start = 1;

      var target = event.target;
      var elem = obj.elem;
      var rightElem = obj.rightElem || null;
      var word = obj.word;

      if (obj.paddingLeft) {
        var paddingLeft = obj.paddingLeft * parseFloat(getComputedStyle(document.documentElement).fontSize) + "px";
      } else {
        var paddingLeft = getComputedStyle(target).paddingLeft; //левый отступ для добавляемых букв
      }

      target.style.width = initialWidth + "px"; //присваивает явную ширину     
      var wordLenght = word.length + 1;
      var maxWidth = initialWidth * wordLenght;

      if (rightElem) {
        rightElem.style.left = getComputedStyle(rightElem).left;
      }

      var counterWidth = 0;    //считает ширину для того чтобы впихнуть букву
      var letter = wordCounter(word);

      var interval = setInterval(function () {
        if (parseFloat(target.style.width) < (maxWidth)) { //пока ширина меньше максимальной ширины + паддинг - продолжать увеличивать       
          target.style.width = parseFloat(target.style.width) + 1 + "px";
          if (rightElem) {
            rightElem.style.left = parseFloat(rightElem.style.left) + 1 + "px";
          }
          counterWidth++; //считает ширину от которой отталкивается добавление букв        
          if (counterWidth == parseInt(initialWidth)) { //когда будут равны вставится еще одна буква
            counterWidth = 0;
            var div = document.createElement('div');
            div.classList.add("temporary");
            div.style.paddingLeft = paddingLeft;
            div.innerHTML = letter();
            target.appendChild(div);
          }
        }
        else {
          clearInterval(interval);
          increaseWidth.finish = 1; //кнопка расширилась полоностью
        }
      }, 5);

      function reduceWidth(event) {
        if (target.contains(event.relatedTarget)) return;
        if (increaseWidth.finish) { // когда кнопка раскрылась полностью и с нее убрали мышь

          increaseWidth.finish = 0;
          var counterWidth = 0;
          var i = setInterval(function () {
            if (parseFloat(target.style.width) > initialWidth) {
              target.style.width = parseFloat(target.style.width) - 1 + "px";
              if (rightElem) {
                rightElem.style.left = parseFloat(rightElem.style.left) - 1 + "px";
              }
              counterWidth++
              if (counterWidth == parseInt(initialWidth / 1.5)) {
                if (target.lastElementChild) {
                  target.lastElementChild.remove();
                }
                counterWidth = 0;
              }
            } else {
              elem.removeEventListener('mouseout', reduceWidth);

              clearInterval(i);
              setTimeout(function () {
                increaseWidth.start = 0;
              }, 0);
            }
          }, 5);
        } else {                               //если кнопка открылась не полностью и мышь убрали
          var interval = setInterval(function () {
            if (increaseWidth.finish) {
              clearInterval(interval);
              increaseWidth.finish = 0;
              var counterWidth = 0;
              var i = setInterval(function () {
                if (parseFloat(target.style.width) > initialWidth) {
                  target.style.width = parseFloat(target.style.width) - 1 + "px";
                  if (rightElem) {
                    rightElem.style.left = parseFloat(rightElem.style.left) - 1 + "px";
                  }
                  counterWidth++
                  if (counterWidth == parseInt(initialWidth / 1.5)) {
                    if (target.lastElementChild) {
                      target.lastElementChild.remove();
                    }
                    counterWidth = 0;
                  }
                } else {
                  elem.removeEventListener('mouseout', reduceWidth);
                  clearInterval(i);
                  setTimeout(function () {
                    increaseWidth.start = 0;
                  }, 0);
                }
              }, 5);
            } else {                     //убирает зависший таймаут, если происходит спам вождения мышью по кнопке (в противном случае происходит автозакрытие)
              setTimeout(function () {
                clearInterval(interval);
              }, 400)
            }
          }, 0);
        }
      }
      elem.addEventListener('mouseout', reduceWidth);
    }

    function wordCounter(word) {
      var word = word;
      var letter = 0;
      return function () {
        var a = word.charAt(letter);
        letter++;
        return a;
      }
    }

  }

  obj.elem.addEventListener('mouseover', increaseWidth);

};

setTimeout(function () {
  buttonAnimation({
    elem: document.querySelector('.add-word__button'),
    rightElem: document.querySelector('.choose-base__button'),
    word: "DD"
  });
}, 0);

setTimeout(function () {
  buttonAnimation({
    elem: document.querySelector('.help__button'),
    rightElem: document.querySelector('.table-sort__button'),
    word: "ELP",
    paddingLeft: 0.45
  });
}, 0);


setTimeout(function () {
  buttonAnimation({
    elem: document.querySelector('.choose-base__button'),
    word: "ASE",
    paddingLeft: 0.45
  });
}, 0);

setTimeout(function () {
  buttonAnimation({
    elem: document.querySelector('.table-sort__button'),
    word: "ORT",
    paddingLeft: 0.35
  });
}, 0);







function buttonClick(button, elem, display) {

  var buttonInitColor = button.style.backgroundColor;

  function click(event) {

    if (buttonClick.stateAnotherButton && !click.state) { // какое-то другое меню уже вызвано
      button.style.backgroundColor = "rgba(207, 57, 57, 0.774)";//red
      setTimeout(function () {
        button.style.backgroundColor = buttonInitColor;
      }, 500);
    }

    if (!buttonClick.stateAnotherButton || click.state) {
      showHideWindow(elem);
      if (click.state) {
        button.style.backgroundColor = "rgba(74, 226, 193, 0.699)";
      } else {
        button.style.backgroundColor = buttonInitColor;
      }
    }
  }

  var animation = showHide(elem, display);

  function showHideWindow(elem) {
    if (!click.state) {
      animation();
      buttonClick.stateAnotherButton = 1;
      click.state = 1;
    } else {
      buttonClick.stateAnotherButton = 0;
      animation();
      click.state = 0;
    }
  }
  button.addEventListener('click', click);
};

buttonClick(document.querySelector('.choose-base__button'), document.querySelector('.choose-base__window'), "block");
buttonClick(document.querySelector('.add-word__button'), document.querySelector('.add-word__window'), "block");
buttonClick(document.querySelector('.help__button'), document.querySelector('.help__instructions'), "block");
buttonClick(document.querySelector('.table-sort__button'), document.querySelector('.table-sort__window'), "block");





function autoBaseName(innerHTML, wordsAmount) {
  let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  let table = document.querySelector('table');
  let baseName = document.querySelector('.base-name');
  let totalWords = document.querySelector('.total-words');
  let tableRight = table.getBoundingClientRect().right;
  let tableBottom = table.getBoundingClientRect().bottom;

  baseName.innerHTML = innerHTML;

  if (wordsAmount) {
    totalWords.innerHTML = wordsAmount;
  } else {
    if (Object.keys(words)[0] == ``) {
      totalWords.innerHTML = `words: 0`;
    } else {
      totalWords.innerHTML = `words: ${Object.keys(words).length}`;
    }
  }
  let wdthTotalWords = totalWords.offsetWidth;
  let wdthBaseName = baseName.offsetWidth;
  baseName.style.left = tableRight - wdthBaseName - (0.31 * windowFontSize) + "px";
  baseName.style.top = tableBottom + (0.31 * windowFontSize) + "px";
  totalWords.style.left = tableRight - wdthTotalWords - (0.31 * windowFontSize) + "px";
  totalWords.style.top = tableBottom + (1.25 * windowFontSize) + "px";
}


function autoBaseNameResize() {
  let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  let table = document.querySelector('table');
  let baseName = document.querySelector('.base-name');
  let totalWords = document.querySelector('.total-words');
  let tableRight = table.getBoundingClientRect().right;
  let tableBottom = table.getBoundingClientRect().bottom;

  let wdthTotalWords = totalWords.offsetWidth;
  let wdthBaseName = baseName.offsetWidth;
  baseName.style.left = tableRight - wdthBaseName - (0.31 * windowFontSize) + "px";
  baseName.style.top = tableBottom + (0.31 * windowFontSize) + "px";
  totalWords.style.left = tableRight - wdthTotalWords - (0.31 * windowFontSize) + "px";
  totalWords.style.top = tableBottom + (1.25 * windowFontSize) + "px";
}
window.addEventListener('resize', autoBaseNameResize);



// function chooseBase(event) {
//   //тут написать код для вставки новой базы слов в таблицу, а потом уже (при успехе) выполнение функции ниже
//   if (event.target.matches('.choose-base__base')) {
//     autoBaseName(event.target.innerHTML)
//   }
// }
// document.querySelector('.choose-base__window').addEventListener('click', chooseBase);








var addBase = function () {
  function localShowHide() {
    if (deleteOrRenameBase.ctrlKeyState) return
    if (deleteOrRenameBase.altKeyState) return
    if (!localShowHide.state) {
      document.querySelector('.add-base__window').style.display = 'block';
      localShowHide.state = 1;
      addBase.state = 1;
    } else {
      document.querySelector('.add-base__window').style.display = 'none';
      localShowHide.state = 0;
      addBase.state = 0;
    }
  }
  // var t = showHide(document.querySelector('.add-base__window'), "block");
  document.querySelector('.add-base__button').addEventListener('click', localShowHide);
  document.querySelector('.add-base__button-cancel').addEventListener('click', localShowHide);

  var check = checkString('Используйте буквы латинского алфавита', true, 10, "eng");
  document.querySelector('.add-base__input').addEventListener('input', check);

  function sendNewBase(event) {
    if (event.keyCode == 13 || event.which == 1) {
      var input = document.querySelector('.add-base__input');
      if (!/[^a-z0-9]/i.test(input.value) && input.value.length < 11 && input.value.length > 0) {
        if (document.querySelectorAll('.choose-base__base').length == 8) {
          showWarning("Достигнуто максимальное количество пользовательских баз", "rgb(238, 35, 20)", 3000, true);
          return
        }
        showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
        $.ajax({
          url: "/newBaseName",
          contentType: "application/json",
          method: "POST",
          data: JSON.stringify({
            baseName: input.value,
          }),
          success: function (answer) {
            if (answer.warn) {
              showWarning(answer.warn, "rgb(238, 35, 20)");
              return
            }
            if (answer.err) {
              showWarning("На сервере произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);
              return
            }
            if (answer.success) {
              showWarning("Операция выполнена успешно", "rgba(74, 226, 193, 1)", 2000, true);
              var div = document.createElement('div');
              div.classList.add('choose-base__base');
              div.innerHTML = input.value;

              var chooseBaseWindow = document.querySelector('.choose-base__window');
              var windowHeight = parseFloat(getComputedStyle(chooseBaseWindow).height);
              var windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
              chooseBaseWindow.style.height = windowHeight + "px";
              chooseBaseWindow.style.height = parseFloat(chooseBaseWindow.style.height) + (1.43 * windowFontSize) + "px";
              document.querySelector('.choose-base__window').insertBefore(div, document.querySelector('.add-base'));

              let option = document.createElement('option');
              option.value = input.value;
              option.innerHTML = input.value;
              document.querySelector('.add-word__choose-list').appendChild(option);

              let transferOption = document.createElement('option');
              transferOption.value = input.value;
              transferOption.innerHTML = input.value;
              document.querySelector('.choose-transfer-base__window').appendChild(transferOption);

              input.value = "";
            }
          }
        });
      }
    }
  }
  document.querySelector('.add-base__button-ok').addEventListener('click', sendNewBase);
  document.querySelector('.add-base__input').addEventListener('keydown', sendNewBase);
}
addBase();



function checkString(warn, num, length, lang) { //выводит предупреждение и следит за длиной вводимой строки (если нужно)
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
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^a-z]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      } else {
        if (!state && /[^a-z0-9]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^a-z0-9]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      }
      return
    }
    if (lang == "rus") {
      if (!num) {
        if (!state && /[^а-я]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^а-я]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      } else {
        if (!state && /[^а-я0-9]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^а-я0-9]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      }
    }
  }
}
function checkStringSpecSymb(warn, num, length, lang) { //выводит предупреждение и следит за длиной вводимой строки (если нужно)
  var state = 0;                          //warn - пред, num - поддержка цифр, length - проверка длины, lang - язык, spec - спец символы
  return function foo(event) {
    var target = event.target;
    if (length) {
      if (target.value.length > length) {
        target.value = target.value.slice(0, length);
      }
    }
    // if(maincheck) return //сделать переменную для отслежки предов пришедших с сервера. Чтобы другие преды не появлялись пока те не пропадут
    if (lang === "eng") {
      if (!num) {
        if (!state && /[^a-z,.()\|/ ]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^a-z,.()\|/ ]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      } else {
        if (!state && /[^a-z0-9,.()\|/ ]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^a-z0-9,.()\|/ ]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      }
      return
    }
    if (lang == "rus") {
      if (!num) {
        if (!state && /[^а-яё,.()\|/ ]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^а-яё,.()\|/ ]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      } else {
        if (!state && /[^а-яё0-9,.()\|/ ]/i.test(target.value)) {
          state = 1;
          showWarning(warn, "rgb(238, 35, 20)");
        } else if (state && !/[^а-яё0-9,.()\|/ ]/i.test(target.value)) {
          state = 0;
          showWarning('', "rgb(238, 35, 20)");
        }
      }
    }
  }
}




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




function getAllBasesNames() {
  $.ajax({ //получение названий баз при загрузке страницы
    url: "/getAllBasesNames",
    contentType: "application/json",
    method: "GET",
    success: function (names) {
      if (names.warn) return alert(names.warn);
      if (names.err) return alert('Не удалось загрузить базы. Непредвиденная ошибка');
      if (names.names.length == 0) return
      for (let i = 0; i < names.names.length; i++) {
        let div = document.createElement('div');
        div.classList.add('choose-base__base');
        div.innerHTML = names.names[i];
        let chooseBaseWindow = document.querySelector('.choose-base__window');
        let windowHeight = parseFloat(getComputedStyle(chooseBaseWindow).height);
        let windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
        chooseBaseWindow.style.height = windowHeight + "px";
        chooseBaseWindow.style.height = parseFloat(chooseBaseWindow.style.height) + (1.5 * windowFontSize) + "px";
        document.querySelector('.choose-base__window').insertBefore(div, document.querySelector('.add-base'));

        let option = document.createElement('option');
        option.value = names.names[i];
        option.innerHTML = names.names[i];
        document.querySelector('.add-word__choose-list').appendChild(option);

        let transferOption = document.createElement('option');
        transferOption.value = names.names[i];
        transferOption.innerHTML = names.names[i];
        document.querySelector('.choose-transfer-base__window').appendChild(transferOption);
      }

      let options = document.querySelector('.add-word__choose-list').options;
      [].forEach.call(options, (option) => {
        if (option.innerHTML === getDirectBase.presentBase) {
          option.selected = true;
          return
        }
      });
    }
  });
}
getAllBasesNames();


function getDirectBase(event) {
  if (!event.target.classList.contains('choose-base__base')) return
  if (getDirectBase.presentBase === event.target.innerHTML) return
  if (event.ctrlKey || event.altKey) return
  if (deleteOrRenameBase.ctrlKeyState) return
  if (deleteOrRenameBase.altKeyState) return
  if (getDirectBase.state) return //если в данный момент какая-то база загружается
  getDirectBase.state = 1;

  clearAuxiliaryWindows();

  showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');

  $.ajax({
    url: "/getDirectBase",
    contentType: "application/json",
    method: "PUT",
    data: JSON.stringify({
      baseName: event.target.innerHTML,
    }),
    success: function (base) {
      getDirectBase.state = 0;
      if (base.err) return showWarning('Произошла непредвиденная ошибка.', "rgb(238, 35, 20)", 3000, true);
      if (base.warn) return showWarning(base.warn, "rgb(238, 35, 20)", 3000, true);

      if (searchWords.searching) {
        searchWords.searching = 0;
        searchWords.words = [];
        hideSearchInput();
      }

      words = base.words;
      baseName = base.baseName;
      getDirectBase.presentBase = baseName;

      var options = document.querySelector('.add-word__choose-list').options;
      [].forEach.call(options, (option) => {
        if (option.innerHTML === baseName) {
          option.selected = true;
          return
        }
      });
      addWordsInTrList(words);
      delRows(); //когда из базы загрузились слова, то можно удалять старые строки
      autoSortAZ(sortType);
      deleteButtons();
      createButtons(sortTrInTbody.tbodyList);
      showFirstPage(sortTrInTbody.tbodyList);
      setTimeout(function () {
        autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
      }, 10);
      showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 1000, true);
    }
  })
}
document.querySelector('.choose-base__window').addEventListener('click', getDirectBase);



function addNewWord(event) {
  var engWord = document.querySelector('.add-word-eng').value;
  var rusWord = document.querySelector('.add-word-rus').value; 
  engWord = deleteSpace(engWord);
  rusWord = deleteSpace(rusWord);
  
  if (/[^a-z,.()\|/ ]/i.test(engWord) || engWord.length > 30 || engWord.length < 1) return
  if (/[^а-яё,.()\|/ ]/i.test(rusWord) || rusWord.length > 40 || rusWord.length < 1) return
  if (addNewWord.accept) return
  if (addNewWord.state) return
  addNewWord.state = 1
  var chooseList = document.querySelector('.add-word__choose-list');
  var baseName;
  [].forEach.call(chooseList.options, (option) => {
    if (option.selected == true) {
      baseName = option.innerHTML;
      return
    }
  });
  showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');

  clearAuxiliaryWindows();

  $.ajax({
    url: "/addNewWord",
    contentType: "application/json",
    method: "PUT",
    data: JSON.stringify({
      engWord: engWord,
      rusWord: rusWord,
      baseName: baseName
    }),
    success: function (answer) {
      addNewWord.state = 0;
      if (answer.warn) return showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
      if (answer.err) return showWarning("На сервере произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);
      if (answer.accept) {  //если такое слово уже есть, то новый запрос на подтверждение операции
        if (addNewWord.accept) return //не дает отправлять еще один запрос, пока не выполнится подтверждение
        addNewWord.accept = 1;
        showWarning('Такое слово уже есть в этой базе.', "rgb(238, 35, 20)", 3000, false);
        var acceptWindow = document.querySelector('.add-word__change-accept');
        acceptWindow.style.display = 'block';
        var bottonYes = document.querySelector('.add-word__change-accept__yes');
        var bottonNo = document.querySelector('.add-word__change-accept__no');
        bottonYes.addEventListener('click', yes);
        bottonNo.addEventListener('click', no);

        function yes() { //если пользователь подтвердил изменение слова
          $.ajax({
            url: "/addNewWordAccept",
            contentType: "application/json",
            method: "PUT",
            data: JSON.stringify({
              engWord: engWord,
              rusWord: rusWord,
              baseName: baseName
            }),
            success: function (answer) {
              addNewWord.accept = 0;
              acceptWindow.style.display = 'none';
              bottonYes.removeEventListener('click', yes);
              bottonNo.removeEventListener('click', no);
              if (answer.warn) return showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
              if (answer.err) return showWarning("На сервере произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);
              if (searchWords.searching) {
                searchWords.searching = 0;
                searchWords.words = [];
                hideSearchInput();
                words[engWord.toLowerCase()] = rusWord.toLowerCase();
                addWordsInTrList(words);
                delRows(); //когда из базы загрузились слова, то можно удалять старые строки
                autoSortAZ(sortType);
                deleteButtons();
                createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
                showFirstPage(sortTrInTbody.tbodyList);
                setTimeout(function () {
                  autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
                }, 10);
                showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
                document.querySelector('.add-word-eng').value = "";
                document.querySelector('.add-word-rus').value = "";
              } else {
                var presentBase = document.querySelector('.base-name').innerHTML;
                if (baseName == presentBase) {
                  // words[engWord.toLowerCase()] = rusWord.toLowerCase();

                  // var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
                  // addWordsInTrList(words);                                                              //заново создаем массив со словами
                  // delRows();                                                                            //удаляем старую таблицу с экрана
                  // autoSortAZ(sortType);                                                                 //пересорировываем слова от A до Z и вставляем их в массив с tbody

                  // document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
                  // addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

                  // setTimeout(function () {
                  //   autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
                  // }, 10);

                  // document.querySelector('.add-word-eng').value = "";
                  // document.querySelector('.add-word-rus').value = "";
                  // showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);

                  words[engWord.toLowerCase()] = rusWord.toLowerCase();
                  addWordsInTrList(words);                                                              
                  delRows();                                                                            
                  autoSortAZ(sortType);                                                                 
                  deleteButtons();
                  createButtons(sortTrInTbody.tbodyList);
                  showFirstPage(sortTrInTbody.tbodyList);              
                  setTimeout(function () {
                    autoBaseName(getDirectBase.presentBase);
                  }, 10);
      
                  showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
                  document.querySelector('.add-word-eng').value = "";
                  document.querySelector('.add-word-rus').value = "";
                } else {
                  document.querySelector('.add-word-eng').value = "";
                  document.querySelector('.add-word-rus').value = "";
                  showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
                }
              }
            }
          })
        }
        function no() { //если пользователь отказался изменять слово
          addNewWord.accept = 0;
          acceptWindow.style.display = 'none';
          bottonYes.removeEventListener('click', yes);
          bottonNo.removeEventListener('click', no);
          document.querySelector('.add-word-eng').value = "";
          document.querySelector('.add-word-rus').value = "";
          showWarning('', "rgb(238, 35, 20)");
        }
      }
      if (answer.success) {
        if (searchWords.searching) {
          searchWords.searching = 0;
          searchWords.words = [];
          hideSearchInput();
          words[engWord.toLowerCase()] = rusWord.toLowerCase();
          addWordsInTrList(words);
          delRows(); //когда из базы загрузились слова, то можно удалять старые строки
          autoSortAZ(sortType);
          deleteButtons();
          createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
          showFirstPage(sortTrInTbody.tbodyList);
          setTimeout(function () {
            autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
          }, 10);
          showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
          document.querySelector('.add-word-eng').value = "";
          document.querySelector('.add-word-rus').value = "";
        } else {
          var presentBase = document.querySelector('.base-name').innerHTML;
          if (baseName == presentBase) {
            words[engWord.toLowerCase()] = rusWord.toLowerCase();

            // var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
            addWordsInTrList(words);                                                              //заново создаем массив со словами
            delRows();                                                                            //удаляем старую таблицу с экрана
            autoSortAZ(sortType);                                                                 //пересорировываем слова от A до Z и вставляем их в массив с tbody
            deleteButtons();
            createButtons(sortTrInTbody.tbodyList); // всегда идет перед showFirstPage, так как тут создается фейковое tbody если в переменной words ничего нет
            showFirstPage(sortTrInTbody.tbodyList);


            // document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
            // addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

            setTimeout(function () {
              autoBaseName(getDirectBase.presentBase); //через 10мс после загрузки страница размещает название базы
            }, 10);

            showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
            document.querySelector('.add-word-eng').value = "";
            document.querySelector('.add-word-rus').value = "";
          } else {
            document.querySelector('.add-word-eng').value = "";
            document.querySelector('.add-word-rus').value = "";
            showWarning('Операция выполнена успешно.', "rgba(74, 226, 193, 1)", 2000, true);
          }
        }
      }
    }
  })
}

document.querySelector('.add-word__button-ok').addEventListener('click', addNewWord);



function checkNewWord() {
  var checkEng = checkStringSpecSymb('Используйте латиницу.', false, 30, "eng");
  var checkRus = checkStringSpecSymb('Используйте кириллицу.', false, 40, "rus");
  document.querySelector('.add-word-eng').addEventListener('input', checkEng);
  document.querySelector('.add-word-rus').addEventListener('input', checkRus);
}
checkNewWord();



function showHide(elem, display) {                 // вспомогательная функция

  var state = 0;
  return function () {
    if (!state) {
      elem.style.opacity = 0;
      state = 1;
      var tmp = 0;
      var interval = setInterval(function () {
        if (elem.style.opacity < 1) {
          elem.style.display = display;
          tmp += 0.1;
          elem.style.opacity = tmp;
        } else {
          clearInterval(interval);
        }
      }, 40);
    } else {
      state = 0;
      var int = setInterval(function () {
        if (elem.style.opacity > 0.1) {
          elem.style.opacity -= 0.1;
        } else {
          clearInterval(int);
          elem.style.display = "none";
        }
      }, 40);
    }
  }
}



function operationsWithTable(event) {
  if (event.altKey) {
    if (operationsWithTable.editing) return; //если уже происходит редактирование какого-то слова
    if (operationsWithTable.deletion) return; //если происходит удаление слов
    if (operationsWithTable.transfer) return;
    if (event.target.nodeName != "TD") return;
    if (!event.target.innerHTML) return;
    if (event.target.nextElementSibling) { //если левая колонка
      const target = event.target;
      operationsWithTable.editing = 1; //статус 1 блокирует появление других полей редактирования комбинацией R + лкм
      const left = target.getBoundingClientRect().left;
      const top = target.getBoundingClientRect().top;
      const width = target.offsetWidth;
      const height = target.offsetHeight;
      const windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

      let input = document.createElement('input');
      input.style.position = "absolute";
      input.style.top = top + 1 + "px";
      input.style.left = left + 1 + "px";
      input.style.width = width - 1 + "px";
      input.style.height = height - (0.13 * windowFontSize) + "px";
      input.style.border = 0;
      input.style.textAlign = "center";
      input.value = target.innerHTML;
      input.classList.add('alt__input');

      document.body.appendChild(input);
      input.focus();
      var checkEng = checkStringSpecSymb('Используйте буквы латинского алфавита.', false, 30, 'eng');
      input.addEventListener('input', checkEng);
      input.addEventListener('keydown', enter);
      input.addEventListener('keydown', escape);
      window.addEventListener('resize', newCoords);

      function enter(event) {
        if (event.keyCode == 13) {
          if (operationsWithTable.changeWordEnterState) return //чтобы при спаме энтер не отсылалась куча запросов
          operationsWithTable.changeWordEnterState = 1;
          if (/[^a-z,.()\|/ ]/i.test(input.value) || input.value.length > 30 || input.value.length < 1) {
            operationsWithTable.changeWordEnterState = 0;
            return
          }
          var oldEngWord = target.innerHTML;
          var newEngWord = input.value;
          var baseName = document.querySelector('.base-name').innerHTML;
          showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
          $.ajax({
            url: "/changeEngWord",
            contentType: "application/json",
            method: "PUT",
            data: JSON.stringify({
              oldEngWord: oldEngWord,
              newEngWord: newEngWord,
              baseName: baseName
            }),
            success: function (answer) {
              if (answer.warn) {
                operationsWithTable.changeWordEnterState = 0;
                input.remove();
                operationsWithTable.editing = 0;
                event.target.removeEventListener('keydown', enter);
                event.target.removeEventListener('keydown', escape);
                event.target.removeEventListener('input', checkEng);
                window.removeEventListener('resize', newCoords);
                showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
                return
              }
              if (answer.err) {
                operationsWithTable.changeWordEnterState = 0;
                input.remove();
                operationsWithTable.editing = 0;
                event.target.removeEventListener('keydown', enter);
                event.target.removeEventListener('keydown', escape);
                event.target.removeEventListener('input', checkEng);
                window.removeEventListener('resize', newCoords);
                showWarning('На сервере произошла непредвиденная ошибка', "rgb(238, 35, 20)", 3000, true);
                return
              }
              if (answer.success) {
                if (searchWords.searching) { //если режим поиска
                  for (let i = 0; i < searchWords.words.length; i++) {
                    if (Object.keys(searchWords.words[i])[0] === target.innerHTML) {
                      let value = searchWords.words[i][Object.keys(searchWords.words[i])[0]];
                      delete searchWords.words[i]
                      searchWords.words[i] = {
                        [input.value]: value
                      }
                    }
                  }
                  operationsWithTable.changeWordEnterState = 0;
                  words[input.value] = words[target.innerHTML];
                  delete words[target.innerHTML];
                  target.innerHTML = input.value;
                  input.remove();
                  operationsWithTable.editing = 0;
                  event.target.removeEventListener('keydown', enter);
                  event.target.removeEventListener('keydown', escape);
                  event.target.removeEventListener('input', checkEng);
                  window.removeEventListener('resize', newCoords);

                  var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
                  foundWordsInTrList(searchWords.words);                                                              //заново создаем массив со словами
                  delRows();                                                                            //удаляем старую таблицу с экрана
                  autoSortAZ(sortType);                                                                         //пересорировываем слова от A до Z и вставляем их в массив с tbody

                  document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана                                                     
                  addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

                  setTimeout(function () {
                    autoBaseName(baseName, `matches: ${searchWords.words.length}`); //через 10мс после загрузки страница размещает название базы
                  }, 10);
                  showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
                } else {
                  operationsWithTable.changeWordEnterState = 0;
                  words[input.value.toLowerCase()] = words[target.innerHTML].toLowerCase();
                  delete words[target.innerHTML];
                  target.innerHTML = input.value.toLowerCase();
                  input.remove();
                  operationsWithTable.editing = 0;
                  event.target.removeEventListener('keydown', enter);
                  event.target.removeEventListener('keydown', escape);
                  event.target.removeEventListener('input', checkEng);
                  window.removeEventListener('resize', newCoords);


                  var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
                  addWordsInTrList(words);                                                              //заново создаем массив со словами
                  delRows();                                                                            //удаляем старую таблицу с экрана
                  autoSortAZ(sortType);                                                                         //пересорировываем слова от A до Z и вставляем их в массив с tbody

                  document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана                                                     
                  addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);


                  setTimeout(function () {
                    autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
                  }, 10);

                  showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
                }
              }
            }
          });
        }
      }

      function escape(event) {
        if (event.keyCode == 27) {
          input.remove();
          operationsWithTable.editing = 0;
          event.target.removeEventListener('keydown', enter); //удаляет обработчик энтер для экономии
          event.target.removeEventListener('keydown', escape);
          event.target.addEventListener('input', checkEng);
          window.removeEventListener('resize', newCoords);
        }
      }

      function newCoords(event) {
        input.style.top = target.getBoundingClientRect().top + "px";
        input.style.left = target.getBoundingClientRect().left + "px";
      }

    } else { //если правая колонка
      var target = event.target;
      operationsWithTable.editing = 1; //статус 1 блокирует появление других полей редактирования комбинацией R + лкм
      const left = target.getBoundingClientRect().left;
      const right = target.getBoundingClientRect().right;
      const top = target.getBoundingClientRect().top;
      const bottom = target.getBoundingClientRect().bottom;
      const windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const width = right - left;
      const height = bottom - top;

      let input = document.createElement('input');
      input.style.position = "absolute";
      input.style.top = top + 1 + "px";
      input.style.left = left + 1 + "px";
      input.style.width = width - 1 + "px";
      input.style.height = height - (0.13 * windowFontSize) + "px";
      input.style.border = 0;
      input.style.textAlign = "center";
      input.value = target.innerHTML;
      input.classList.add('alt__input');

      document.body.appendChild(input);
      var checkRus = checkStringSpecSymb('Используйте кириллицу.', false, 40, 'rus');
      input.addEventListener('input', checkRus);
      input.focus();
      input.addEventListener('keydown', enter); //обработчик события нажатия на энтер
      input.addEventListener('keydown', escape);
      window.addEventListener('resize', newCoords);

      function enter(event) {
        if (event.keyCode == 13) {
          if (operationsWithTable.changeWordEnterState) return //чтобы при спаме энтер не отсылалась куча запросов
          operationsWithTable.changeWordEnterState = 1;
          if (/[^а-яё,.()\|/ ]/i.test(input.value) || input.value.length > 40 || input.value.length < 1) {
            operationsWithTable.changeWordEnterState = 0;
            return
          }
          var engWord = target.previousElementSibling.innerHTML;
          var newRusWord = input.value;
          var baseName = document.querySelector('.base-name').innerHTML;
          showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
          $.ajax({
            url: "/changeRusWord",
            contentType: "application/json",
            method: "PUT",
            data: JSON.stringify({
              engWord: engWord,
              newRusWord: newRusWord,
              baseName: baseName
            }),
            success: function (answer) {
              if (answer.warn) {
                operationsWithTable.changeWordEnterState = 0;
                input.remove();
                operationsWithTable.editing = 0;
                event.target.removeEventListener('keydown', enter);
                event.target.removeEventListener('keydown', escape);
                event.target.removeEventListener('input', checkRus);
                window.removeEventListener('resize', newCoords);
                showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
                return
              }
              if (answer.err) {
                operationsWithTable.changeWordEnterState = 0;
                input.remove();
                operationsWithTable.editing = 0;
                event.target.removeEventListener('keydown', enter);
                event.target.removeEventListener('keydown', escape);
                event.target.removeEventListener('input', checkRus);
                window.removeEventListener('resize', newCoords);
                showWarning('На сервере произошла непредвиденная ошибка', "rgb(238, 35, 20)", 3000, true);
                return
              }
              if (answer.success) {
                if (searchWords.searching) {
                  for (let i = 0; i < searchWords.words.length; i++) {
                    let value = searchWords.words[i][Object.keys(searchWords.words[i])[0]];
                    if (value === target.innerHTML) {
                      searchWords.words[i][Object.keys(searchWords.words[i])[0]] = input.value;
                    }
                  }
                  operationsWithTable.changeWordEnterState = 0;
                  words[target.previousElementSibling.innerHTML] = input.value.toLowerCase();
                  target.innerHTML = input.value.toLowerCase();
                  input.remove();
                  operationsWithTable.editing = 0;
                  event.target.removeEventListener('keydown', enter);
                  event.target.removeEventListener('keydown', escape);
                  event.target.removeEventListener('input', checkRus);
                  window.removeEventListener('resize', newCoords);

                  var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
                  foundWordsInTrList(searchWords.words);                                                              //заново создаем массив со словами
                  delRows();                                                                            //удаляем старую таблицу с экрана
                  autoSortAZ(sortType);                                                                         //пересорировываем слова от A до Z и вставляем их в массив с tbody

                  document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана                                                      
                  addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

                  setTimeout(function () {
                    autoBaseName(baseName, `matches: ${searchWords.words.length}`); //через 10мс после загрузки страница размещает название базы
                  }, 10);
                  showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
                } else {
                  operationsWithTable.changeWordEnterState = 0;
                  words[target.previousElementSibling.innerHTML] = input.value.toLowerCase();
                  target.innerHTML = input.value.toLowerCase();
                  input.remove();
                  operationsWithTable.editing = 0;
                  event.target.removeEventListener('keydown', enter);
                  event.target.removeEventListener('keydown', escape);
                  event.target.removeEventListener('input', checkRus);
                  window.removeEventListener('resize', newCoords);

                  var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
                  addWordsInTrList(words);                                                              //заново создаем массив со словами
                  delRows();                                                                            //удаляем старую таблицу с экрана
                  autoSortAZ(sortType);                                                                         //пересорировываем слова от A до Z и вставляем их в массив с tbody

                  document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана 
                  addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

                  setTimeout(function () {
                    autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
                  }, 10);
                  showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
                }
              }
            }
          });
        }
      }

      function escape(event) {
        if (event.keyCode == 27) {
          input.remove();
          operationsWithTable.editing = 0;
          event.target.removeEventListener('keydown', enter); //удаляет обработчик энтер для экономии
          event.target.removeEventListener('keydown', escape);
          window.removeEventListener('resize', newCoords);
        }
      }

      function newCoords(event) {
        input.style.top = target.getBoundingClientRect().top + "px";
        input.style.left = target.getBoundingClientRect().left + "px";
      }
    }
  }
  if (event.ctrlKey) {
    if (event.target.nodeName != "TD") return;
    if (operationsWithTable.editing) return; //если происходит операция редактирования какого-то слова
    if (operationsWithTable.transfer) return;
    if (event.target.parentElement.classList.contains('branded') || !event.target.innerHTML) return
    var target = event.target.parentElement;
    target.classList.add('branded');
    operationsWithTable.deletion = 1; //пользователем началась операция удаления

    const left = target.getBoundingClientRect().left;
    const top = target.getBoundingClientRect().top;
    const windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    var div = document.createElement('div');

    div.style.position = "absolute";
    div.style.top = top + (0.31 * windowFontSize) + "px";
    div.style.left = left + (0.25 * windowFontSize) + "px";
    div.style.width = (0.5 * windowFontSize) + "px";
    div.style.height = (0.5 * windowFontSize) + "px";
    div.style.borderRadius = "50%"
    div.style.backgroundColor = "rgba(199, 17, 17, 0.500)"
    div.classList.add('red-circle');
    document.body.appendChild(div);
    const delWord = document.body.querySelector('.delete-word');
    var delWordWidth;

    if (operationsWithTable.countDelWords) {
      document.body.querySelector('.delete-word__count').innerHTML = operationsWithTable.countDelWords;
      operationsWithTable.countDelWords++;
      operationsWithTable.arr.push(target.firstElementChild.innerHTML);
    }


    if (!operationsWithTable.countDelWords) {
      operationsWithTable.countDelWords = 2;
      delWord.style.display = "block";
      operationsWithTable.arr = [];
      operationsWithTable.arr.push(target.firstElementChild.innerHTML);
      setTimeout(function () {
        delWordWidth = delWord.offsetWidth;
        delWord.style.left = document.body.querySelector('.table').getBoundingClientRect().left - (2 * windowFontSize) - delWordWidth + "px";
        delWord.style.top = document.body.querySelector('.table').getBoundingClientRect().top + (2 * windowFontSize) + "px";
      }, 50);
    }




    function del(event) {
      if (event.target.classList.contains('delete-word__cancel')) { //если нажать cancel

        target.classList.remove('branded');  //при отмене удаления, за счет замыкания, 
        div.remove();                       //удаляются все классы branded и все красные круги               
        delete operationsWithTable.arr
        delWord.style.display = "none";
        operationsWithTable.deletion = 0;
        operationsWithTable.countDelWords = 0;
        document.body.querySelector('.delete-word__count').innerHTML = 1;
        window.removeEventListener('resize', newCoords);
        document.removeEventListener('click', ifChangePage);
        document.body.querySelector('.delete-word__ok').removeEventListener('click', del);
        document.body.querySelector('.delete-word__cancel').removeEventListener('click', del);
        return;
      }
      if (event.target.classList.contains('delete-word__ok')) { //если нажать ok

        //удалить слова из базы, а потом код ниже. и в самом конце переформировать таблицу. то что закомментировано вроде как не нужно                   
        target.classList.remove('branded');  //при отмене удаления, за счет замыкания, 
        div.remove();                       //удаляются все классы branded и все красные круги
        delWord.style.display = "none";
        operationsWithTable.deletion = 0;
        operationsWithTable.countDelWords = 0;
        document.body.querySelector('.delete-word__count').innerHTML = 1;
        window.removeEventListener('resize', newCoords);
        document.removeEventListener('click', ifChangePage);
        document.body.querySelector('.delete-word__ok').removeEventListener('click', del);
        document.body.querySelector('.delete-word__cancel').removeEventListener('click', del);
        return;
      }
    }

    function newCoords(event) { //при ресайзе обновляет координаты кружков и окна подтверждения удаления
      div.style.top = target.getBoundingClientRect().top + (0.31 * windowFontSize) + "px";
      div.style.left = target.getBoundingClientRect().left + (0.25 * windowFontSize) + "px";
      delWord.style.left = document.body.querySelector('.table').getBoundingClientRect().left - (2 * windowFontSize) - delWordWidth + "px";
      delWord.style.top = document.body.querySelector('.table').getBoundingClientRect().top + (2 * windowFontSize) + "px";
    }

    function ifChangePage(event) {
      if (!event.target.classList.contains('table__page-button')) return;

      div.style.top = target.getBoundingClientRect().top + (0.31 * windowFontSize) + "px";  // после смены страницы красные круги остаются висеть,                                                                                             
      div.style.left = target.getBoundingClientRect().left + (0.25 * windowFontSize) + "px";// по этому нужно обновить координаты. Они не находят 
      //элемент по которому позиционировались и сбрасывают 
      //поцизию в левый верхний угол. Тут за счет замыкания
      if (parseFloat(div.style.top) < 50) {                                                 //обновляются все созданные круги
        div.style.display = "none";
      } else {
        div.style.display = "block";
      }
    }

    document.body.querySelector('.delete-word__ok').addEventListener('click', del);
    document.body.querySelector('.delete-word__cancel').addEventListener('click', del);
    window.addEventListener('resize', newCoords);
    document.addEventListener('click', ifChangePage);

  }
  if (event.shiftKey) {
    if (event.target.nodeName != "TD") return;
    if (operationsWithTable.editing) return; //если уже происходит редактирование какого-то слова
    if (operationsWithTable.deletion) return; //если происходит удаление слов
    if (event.target.parentElement.classList.contains('branded') || !event.target.innerHTML) return
    operationsWithTable.transfer = 1;
    const target = event.target.parentElement;
    target.classList.add('branded');

    const left = target.getBoundingClientRect().left;
    const top = target.getBoundingClientRect().top;
    const windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

    var div = document.createElement('div');

    div.style.position = "absolute";
    div.style.top = top + (0.31 * windowFontSize) + "px";
    div.style.left = left + (0.25 * windowFontSize) + "px";
    div.style.width = (0.5 * windowFontSize) + "px";
    div.style.height = (0.5 * windowFontSize) + "px";
    div.style.borderRadius = "50%"
    div.style.backgroundColor = "rgba(39, 207, 24, 0.507)"
    div.classList.add('green-circle');
    document.body.appendChild(div);


    var chooseTransferBase = document.body.querySelector('.choose-transfer-base');
    var chooseTransferBaseWidth;

    if (!operationsWithTable.firstTime) { //если первая зеленая метка
      chooseTransferBase.style.display = "block";
      operationsWithTable.firstTime = 1;
      operationsWithTable.arr = [];
      operationsWithTable.arr.push(target.firstElementChild.innerHTML);
      setTimeout(() => {
        chooseTransferBaseWidth = chooseTransferBase.offsetWidth;
        chooseTransferBase.style.left = document.body.querySelector('.table').getBoundingClientRect().left - chooseTransferBaseWidth - (4 * windowFontSize) + "px";
        chooseTransferBase.style.top = document.body.querySelector('.table').getBoundingClientRect().top + (2 * windowFontSize) + "px";
      }, 0);
    } else {
      operationsWithTable.arr.push(target.firstElementChild.innerHTML);
    }

    function del(event) {
      if (event.target.classList.contains('choose-transfer-base__close')) { //если нажать cancel

        target.classList.remove('branded');  //при отмене удаления, за счет замыкания, 
        div.remove();                       //удаляются все классы branded и все красные круги               
        delete operationsWithTable.arr
        chooseTransferBase.style.display = "none";
        operationsWithTable.firstTime = 0;
        operationsWithTable.transfer = 0;
        window.removeEventListener('resize', newCoords);
        document.removeEventListener('click', ifChangePage);
        document.body.querySelector('.choose-transfer-base__ok').removeEventListener('click', del);
        document.body.querySelector('.choose-transfer-base__close').removeEventListener('click', del);
        return;
      }
      if (event.target.classList.contains('choose-transfer-base__ok')) { //если нажать ok

        //удалить слова из базы, а потом код ниже. и в самом конце переформировать таблицу. то что закомментировано вроде как не нужно                   
        target.classList.remove('branded');  //при отмене удаления, за счет замыкания, 
        div.remove();                       //удаляются все классы branded и все красные круги
        chooseTransferBase.style.display = "none";
        operationsWithTable.firstTime = 0;
        operationsWithTable.transfer = 0;
        window.removeEventListener('resize', newCoords);
        document.removeEventListener('click', ifChangePage);
        document.body.querySelector('.choose-transfer-base__ok').removeEventListener('click', del);
        document.body.querySelector('.choose-transfer-base__close').removeEventListener('click', del);
        return;
      }
    }

    function newCoords() {
      div.style.top = target.getBoundingClientRect().top + (0.31 * windowFontSize) + "px";
      div.style.left = target.getBoundingClientRect().left + (0.25 * windowFontSize) + "px";
      chooseTransferBase.style.left = document.body.querySelector('.table').getBoundingClientRect().left - chooseTransferBaseWidth - (4 * windowFontSize) + "px";
      chooseTransferBase.style.top = document.body.querySelector('.table').getBoundingClientRect().top + (2 * windowFontSize) + "px";
    }

    function ifChangePage(event) {
      if (!event.target.classList.contains('table__page-button')) return;

      div.style.top = target.getBoundingClientRect().top + (0.31 * windowFontSize) + "px";  // после смены страницы красные круги остаются висеть,                                                                                             
      div.style.left = target.getBoundingClientRect().left + (0.25 * windowFontSize) + "px";// по этому нужно обновить координаты. Они не находят 
      //элемент по которому позиционировались и сбрасывают 
      //поцизию в левый верхний угол. Тут за счет замыкания
      if (parseFloat(div.style.top) < 50) {                                                 //обновляются все созданные круги
        div.style.display = "none";
      } else {
        div.style.display = "block";
      }
    }

    window.addEventListener('resize', newCoords);
    document.addEventListener('click', ifChangePage);
    document.body.querySelector('.choose-transfer-base__ok').addEventListener('click', del);
    document.body.querySelector('.choose-transfer-base__close').addEventListener('click', del);


  }
}

function antiClosureCtrl(event) { //вспомогательная функция так как обосрался с замыканиями и отсылается сразу куча дублирующих 
  var baseName = document.querySelector('.base-name').innerHTML; //запросов с массивом (в зависимости от количества кружков)
  showWarning("Операция выполняется...", 'rgba(236, 201, 41, 1)');
  setTimeout(function () {
    $.ajax({
      url: "/deleteWordsFromBase",
      contentType: "application/json",
      method: "DELETE",
      data: JSON.stringify({
        baseName: baseName,
        words: operationsWithTable.arr
      }),
      success: function (answer) {
        if (answer.warn) return showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
        if (answer.err) return showWarning("Произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);
        if (answer.success) {
          for (let i = 0; i < operationsWithTable.arr.length; i++) {
            delete words[operationsWithTable.arr[i]];
          }
        }
        if (searchWords.searching) {
          var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML;
          let tmpArr = []; //временный массив с ключами в том же порядке, что и в массиве searchWords.words
          for (let word of searchWords.words) {
            let key = Object.keys(word)[0];
            tmpArr.push(key);
          }
          for (let i = 0; i < operationsWithTable.arr.length; i++) {
            let index = tmpArr.indexOf(operationsWithTable.arr[i]);
            searchWords.words.splice(index, 1);
          }

          delete operationsWithTable.arr;
          foundWordsInTrList(searchWords.words);
          delRows();
          autoSortAZ(sortType);

          if (!sortTrInTbody.tbodyList[pageInnerHtml - 1]) { //если была открыта последняя страница и из нее удалили все слова
            sortTrInTbody.tbodyList[pageInnerHtml - 1] = fakeTbody();
          }

          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
          addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

          showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
          setTimeout(function () {
            autoBaseName(baseName, `matches: ${searchWords.words.length}`); //через 10мс после загрузки страница размещает название базы
          }, 10);
        } else {
          delete operationsWithTable.arr;
          var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML; //сохраняем номер ныне выбранной страницы
          addWordsInTrList(words);                                                              //заново создаем массив со словами
          delRows();                                                                            //удаляем старую таблицу с экрана
          autoSortAZ(sortType);                                                                 //пересорировываем слова от A до Z и вставляем их в массив с tbody

          if (!sortTrInTbody.tbodyList[pageInnerHtml - 1]) { //если была открыта последняя страница и из нее удалили все слова
            sortTrInTbody.tbodyList[pageInnerHtml - 1] = fakeTbody();
          }

          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
          addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

          showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
          setTimeout(function () {
            autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
          }, 10);
        }
      }
    })
  }, 0)
}

function antiClosureShift(event) { //вспомогательная функция так как обосрался с замыканиями и отсылается сразу куча дублирующих  
  var fromBaseName = document.querySelector('.base-name').innerHTML;
  var toBaseName;
  var chooseList = document.querySelector('.choose-transfer-base__window');
  [].forEach.call(chooseList.options, (option) => {
    if (option.selected == true) {
      toBaseName = option.innerHTML;
      return
    }
  });
  showWarning("Операция выполняется...", 'rgba(236, 201, 41, 1)');
  setTimeout(function () {    //запросов с массивом (в зависимости от количества кружков)
    $.ajax({
      url: "/transferWordsFromBase",
      contentType: "application/json",
      method: "PUT",
      data: JSON.stringify({
        fromBaseName: fromBaseName,
        toBaseName: toBaseName,
        words: operationsWithTable.arr
      }),
      success: function (answer) {
        if (answer.warn) return showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
        if (answer.err) return showWarning("Произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);

        if (fromBaseName != 'common') { //если база из которой переносят слова не равнf common, то слова из нее копируются, но не удаляются
          for (let i = 0; i < operationsWithTable.arr.length; i++) {
            delete words[operationsWithTable.arr[i]];
          }
        }

        if (searchWords.searching) { //если включен режим поиска
          var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML;

          if (fromBaseName != 'common') { //если база из которой переносят слова не равнf common, то слова из нее копируются, но не удаляются
            let tmpArr = []; //временный массив с ключами в том же порядке, что и в массиве searchWords.words
            for (let word of searchWords.words) {
              let key = Object.keys(word)[0];
              tmpArr.push(key);
            }
            for (let i = 0; i < operationsWithTable.arr.length; i++) {
              let index = tmpArr.indexOf(operationsWithTable.arr[i]);
              searchWords.words.splice(index, 1);
            }
          }

          delete operationsWithTable.arr;
          foundWordsInTrList(searchWords.words);
          delRows();
          autoSortAZ(sortType);

          if (!sortTrInTbody.tbodyList[pageInnerHtml - 1]) { //если была открыта последняя страница и из нее удалили все слова
            sortTrInTbody.tbodyList[pageInnerHtml - 1] = fakeTbody();
          }

          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
          addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

          showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
          setTimeout(function () {
            autoBaseName(baseName, `matches: ${searchWords.words.length}`); //через 10мс после загрузки страница размещает название базы
          }, 10);

        } else {
          delete operationsWithTable.arr;
          var pageInnerHtml = document.querySelector('.table__page-button--colored').innerHTML;
          addWordsInTrList(words);
          delRows();
          autoSortAZ(sortType);

          if (!sortTrInTbody.tbodyList[pageInnerHtml - 1]) { //если была открыта последняя страница и из нее удалили все слова
            sortTrInTbody.tbodyList[pageInnerHtml - 1] = fakeTbody();
          }

          document.querySelector('table').appendChild(sortTrInTbody.tbodyList[pageInnerHtml - 1]); //из массива с tbody достаем страницу которая уже была выбрана
          addEmptyRows(sortTrInTbody.tbodyList[pageInnerHtml - 1].children);

          showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
          setTimeout(function () {
            autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
          }, 10);
        }
      }
    })
  }, 0)
}

document.addEventListener('click', operationsWithTable);
document.querySelector('.delete-word__ok--anti-closure').addEventListener('click', antiClosureCtrl);
document.querySelector('.choose-transfer-base__ok--anti-closure').addEventListener('click', antiClosureShift);


function deleteOrRenameBase(event) {
  if (!event.target.matches('.choose-base__base')) return
  if (deleteOrRenameBase.ctrlKeyState) return
  if (deleteOrRenameBase.altKeyState) return
  if (addBase.state) return
  if (event.ctrlKey) {
    deleteOrRenameBase.ctrlKeyState = 1;
    document.querySelector('.delete-base').style.display = 'block';
    event.target.style.backgroundColor = "rgba(207, 57, 57, 0.774)";
    function yesButton() {
      if (yesButton.state) return
      yesButton.state = 1;
      showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
      $.ajax({
        url: "/deleteBase",
        contentType: "application/json",
        method: "DELETE",
        data: JSON.stringify({
          baseName: event.target.innerHTML,
        }),
        success: function (answer) {
          if (answer.warn) {
            yesButton.state = 0;
            showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);
            document.querySelector('.delete-base').style.display = 'none';
            deleteOrRenameBase.ctrlKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.delete-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.delete-base__no').removeEventListener('click', noButton);
            return
          }
          if (answer.err) {
            yesButton.state = 0;
            showWarning("На сервере произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);
            document.querySelector('.delete-base').style.display = 'none';
            deleteOrRenameBase.ctrlKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.delete-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.delete-base__no').removeEventListener('click', noButton);
            return
          }
          if (answer.success) {
            yesButton.state = 0;
            event.target.remove();
            var chooseBaseWindow = document.querySelector('.choose-base__window');
            var windowHeight = parseFloat(getComputedStyle(chooseBaseWindow).height);
            var windowFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            chooseBaseWindow.style.height = windowHeight + "px";
            chooseBaseWindow.style.height = parseFloat(chooseBaseWindow.style.height) - (1.5 * windowFontSize) + "px";

            document.querySelector('.delete-base').style.display = 'none';
            deleteOrRenameBase.ctrlKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.delete-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.delete-base__no').removeEventListener('click', noButton);


            var chooseList = document.querySelector('.add-word__choose-list');
            var transferList = document.querySelector('.choose-transfer-base__window');
            [].forEach.call(chooseList, (option) => {
              if (option.innerHTML === event.target.innerHTML) {
                option.remove();
                return
              }
            });
            [].forEach.call(transferList, (option) => {
              if (option.innerHTML === event.target.innerHTML) {
                option.remove();
                return
              }
            });

            if (getDirectBase.presentBase === event.target.innerHTML) {
              getDirectBase.presentBase = 'common';
              getDirectBase.state = 1;
              $.ajax({
                url: "/getDirectBase",
                contentType: "application/json",
                method: "PUT",
                data: JSON.stringify({
                  baseName: 'common',
                }),
                success: function (base) {
                  getDirectBase.state = 0;
                  if (base.warn) return alert(base.warn);
                  if (base.err) return alert("Произошла непредвиденная ошибка");

                  if (searchWords.searching) {
                    searchWords.searching = 0;
                    searchWords.words = [];
                    hideSearchInput();
                  }

                  words = base.words;
                  let baseName = base.baseName;
                  getDirectBase.presentBase = baseName;

                  var options = document.querySelector('.add-word__choose-list').options;
                  [].forEach.call(options, (option) => {
                    if (option.innerHTML === baseName) {
                      option.selected = true;
                      return
                    }
                  });
                  addWordsInTrList(words);
                  delRows(); //когда из базы загрузились слова, то можно удалять старые строки
                  autoSortAZ(sortType);
                  deleteButtons();
                  createButtons(sortTrInTbody.tbodyList);
                  showFirstPage(sortTrInTbody.tbodyList);
                  setTimeout(function () {
                    autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
                  }, 10);
                }
              })
            }
            showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
          }
        }
      });
    }
    function noButton() {
      document.querySelector('.delete-base').style.display = 'none';
      deleteOrRenameBase.ctrlKeyState = 0;
      event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
      document.querySelector('.delete-base__yes').removeEventListener('click', yesButton);
      document.querySelector('.delete-base__no').removeEventListener('click', noButton);
    }

    document.querySelector('.delete-base__yes').addEventListener('click', yesButton);
    document.querySelector('.delete-base__no').addEventListener('click', noButton);

  }
  if (event.altKey) {
    deleteOrRenameBase.altKeyState = 1;
    document.querySelector('.rename-base').style.display = 'block';
    event.target.style.backgroundColor = "rgba(74, 226, 193, 0.699)";
    var input = document.querySelector('.rename-base__input');
    var check = checkString('Используйте буквы латинского алфавита.', true, 10, "eng");
    input.addEventListener('input', check);
    input.addEventListener('keydown', enter);

    function enter(event) {
      if (event.keyCode != 13) return
      yesButton();
    }
    function yesButton() {
      if (yesButton.state) return
      yesButton.state = 1;

      if (/[^a-z0-9]/i.test(input.value) || input.value.length > 10 || input.value.length < 1) {
        yesButton.state = 0;
        return
      }
      showWarning('Операция выполняется...', 'rgba(236, 201, 41, 1)');
      $.ajax({
        url: "/renameBase",
        contentType: "application/json",
        method: "PUT",
        data: JSON.stringify({
          oldBaseName: event.target.innerHTML,
          newBaseName: input.value
        }),
        success: function (answer) {
          if (answer.warn) {
            yesButton.state = 0;
            showWarning(answer.warn, "rgb(238, 35, 20)", 3000, true);

            document.querySelector('.rename-base').style.display = 'none';
            deleteOrRenameBase.altKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.rename-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.rename-base__no').removeEventListener('click', noButton);
            input.removeEventListener('input', check);
            input.removeEventListener('keydown', enter);
            return
          }
          if (answer.err) {
            yesButton.state = 0;
            showWarning("На сервере произошла непредвиденная ошибка.", "rgb(238, 35, 20)", 3000, true);

            document.querySelector('.rename-base').style.display = 'none';
            deleteOrRenameBase.altKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.rename-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.rename-base__no').removeEventListener('click', noButton);
            input.removeEventListener('input', check);
            input.removeEventListener('keydown', enter);
            return
          }
          if (answer.success) {

            var chooseList = document.querySelector('.add-word__choose-list');
            var transferList = document.querySelector('.choose-transfer-base__window');

            [].forEach.call(chooseList, (option) => {
              if (option.innerHTML === event.target.innerHTML) {
                option.innerHTML = input.value;
                return
              }
            });
            [].forEach.call(transferList, (option) => {
              if (option.innerHTML === event.target.innerHTML) {
                option.innerHTML = input.value;
                return
              }
            });

            if (getDirectBase.presentBase === event.target.innerHTML) {
              getDirectBase.presentBase = input.value;
              document.querySelector('.base-name').innerHTML = input.value;
            }

            yesButton.state = 0;
            showWarning("Операция выполнена успешно.", "rgba(74, 226, 193, 1)", 2000, true);
            event.target.innerHTML = input.value;
            input.value = '';

            document.querySelector('.rename-base').style.display = 'none';
            deleteOrRenameBase.altKeyState = 0;
            event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
            document.querySelector('.rename-base__yes').removeEventListener('click', yesButton);
            document.querySelector('.rename-base__no').removeEventListener('click', noButton);
            input.removeEventListener('input', check);
            input.removeEventListener('keydown', enter);
          }
        }
      });
    }

    function noButton() {
      document.querySelector('.rename-base').style.display = 'none';
      deleteOrRenameBase.altKeyState = 0;
      event.target.style.backgroundColor = "rgba(0, 0, 0, 0.096)";
      document.querySelector('.rename-base__yes').removeEventListener('click', yesButton);
      document.querySelector('.rename-base__no').removeEventListener('click', noButton);
    }

    document.querySelector('.rename-base__yes').addEventListener('click', yesButton);
    document.querySelector('.rename-base__no').addEventListener('click', noButton);
  }

}

document.querySelector('.choose-base__window').addEventListener('click', deleteOrRenameBase);







function shiftPreventDefault(event) {    //три функции отвечающие за убирание выделения при зажатии шифтра
  if (!event.target.closest('tbody')) return
  event.preventDefault();
}
function keyDownShiftPreventDefault(event) {
  if (event.keyCode != 16) return
  event.target.addEventListener('mousedown', shiftPreventDefault);
}
function keyUpShiftPreventDefault(event) {
  if (event.keyCode != 16) return
  event.target.removeEventListener('mousedown', shiftPreventDefault);
}
document.addEventListener('keydown', keyDownShiftPreventDefault);
document.addEventListener('keyup', keyUpShiftPreventDefault);







function showSearchInput(event) {
  if (showSearchInput.state) return
  searchWords.searching = 1; //показывает другим функциям что включен режим поиска
  showSearchInput.state = 1; //не дает повторно запускать анимацию
  let input = document.querySelector('.search__elems');
  let calcelButton = document.querySelector('.search__space');
  input.style.opacity = 0;
  clearAuxiliaryWindows();

  event.target.style.opacity = 1;
  let timer = setInterval(() => {
    event.target.style.opacity -= 0.1;
    if (event.target.style.opacity < 0.1) {
      clearInterval(timer);
      event.target.style.display = 'none';
      input.style.display = 'block';
      let tmp = 0;
      let t = setInterval(() => {
        tmp += 0.1;
        input.style.opacity = tmp;
        if (input.style.opacity > 0.9) {
          clearInterval(t);
          calcelButton.addEventListener('click', hideSearchInput);
        }
      }, 25)
    }
  }, 25);
}
document.querySelector('.search__button').addEventListener('click', showSearchInput);



function hideSearchInput() {
  let searchButton = document.querySelector('.search__button');
  let input = document.querySelector('.search__input');
  let inputElems = document.querySelector('.search__elems');
  let calcelButton = document.querySelector('.search__space');

  clearAuxiliaryWindows();

  let timer = setInterval(() => {
    inputElems.style.opacity -= 0.1;
    if (inputElems.style.opacity < 0.1) {
      clearInterval(timer);
      inputElems.style.display = 'none';
      searchButton.style.display = 'block';
      let tmp = 0;
      let t = setInterval(() => {
        tmp += 0.1;
        searchButton.style.opacity = tmp;
        if (searchButton.style.opacity > 0.9) {
          clearInterval(t);
          showSearchInput.state = 0;
          calcelButton.removeEventListener('click', hideSearchInput);
        }
      });
    }
  }, 25);

  let baseName = getDirectBase.presentBase;
  input.value = ``;
  searchWords.searching = 0;
  searchWords.state = 0;
  searchWords.words = [];
  addWordsInTrList(words);
  delRows(); //когда из базы загрузились слова, то можно удалять старые строки
  autoSortAZ(sortType);
  deleteButtons();
  createButtons(sortTrInTbody.tbodyList);
  showFirstPage(sortTrInTbody.tbodyList);
  setTimeout(function () {
    autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
  }, 10);

}



function searchWords(event) {
  if (event.key == 'Enter') {
    if (searchWords.state) return //не дает спамить запросы поиска
    let text = deleteSpace(event.target.value);
    let baseName = getDirectBase.presentBase;
    if (text.length < 1) {
      searchWords.searching = 0;
      searchWords.words = [];
      hideSearchInput();
      clearAuxiliaryWindows();
      addWordsInTrList(words);
      delRows(); //когда из базы загрузились слова, то можно удалять старые строки
      autoSortAZ(sortType);
      deleteButtons();
      createButtons(sortTrInTbody.tbodyList);
      showFirstPage(sortTrInTbody.tbodyList);
      setTimeout(function () {
        autoBaseName(baseName); //через 10мс после загрузки страница размещает название базы
      }, 10);
      return
    }
    clearAuxiliaryWindows();
    searchWords.searching = 1; //включает режим поиска каждый раз при поиске слова длиной 1+ символ
    if (!/[^a-z,.()\|/ ]/i.test(text)) {
      searchWords.state = 1;
      let url = `/getEngWord/` + getDirectBase.presentBase + '/' + text;
      showWarning('Идет поиск...', 'rgba(236, 201, 41, 1)');
      $.ajax({
        url: url,
        contentType: "application/json",
        method: "GET",
        success: function (found) {
          if (found.warn) {
            searchWords.state = 0;
            event.target.value = '';
            return showWarning(found.warn, "rgb(238, 35, 20)", 3000, true);
          } 
          if (found.err) {
            searchWords.state = 0;
            event.target.value = '';
            return showWarning("Произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);
          } 

          searchWords.words = found.words;
          searchWords.state = 0;
          event.target.value = '';
          foundWordsInTrList(found.words);
          delRows(); //когда из базы загрузились слова, то можно удалять старые строки
          autoSortAZ(sortType);
          deleteButtons();
          createButtons(sortTrInTbody.tbodyList);
          showFirstPage(sortTrInTbody.tbodyList);
          setTimeout(function () {
            autoBaseName(baseName, `matches: ${found.words.length}`); //через 10мс после загрузки страница размещает название базы
          }, 10);
          showWarning("Поиск завершен.", "rgba(74, 226, 193, 1)", 800, true);
        }
      });
    } else if (!/[^а-яё,.()\|/ ]/i.test(text)) {
      searchWords.state = 1;
      let url = `/getRusWord/` + getDirectBase.presentBase + '/' + text;;
      showWarning('Идет поиск...', 'rgba(236, 201, 41, 1)');
      $.ajax({
        url: url,
        contentType: "application/json",
        method: "GET",
        success: function (found) {
          if (found.warn) {
            searchWords.state = 0;
            event.target.value = '';
            return showWarning(found.warn, "rgb(238, 35, 20)", 3000, true);
          } 
          if (found.err) {
            searchWords.state = 0;
            event.target.value = '';
            return showWarning("Произошла непредвиденная ошибка", "rgb(238, 35, 20)", 3000, true);
          } 

          searchWords.words = found.words;
          searchWords.state = 0;
          event.target.value = '';
          foundWordsInTrList(found.words);
          delRows(); //когда из базы загрузились слова, то можно удалять старые строки
          autoSortAZ(sortType);
          deleteButtons();
          createButtons(sortTrInTbody.tbodyList);
          showFirstPage(sortTrInTbody.tbodyList);
          setTimeout(function () {
            autoBaseName(baseName, `matches: ${found.words.length}`); //через 10мс после загрузки страница размещает название базы
          }, 10);
          showWarning("Поиск завершен.", "rgba(74, 226, 193, 1)", 800, true);
        }
      });
    }
  }
}
document.querySelector('.search__input').addEventListener('keydown', searchWords);




function foundWordsInTrList(arr) {
  addWordsInTrList.trList = [];
  for (let item of arr) {
    let key = Object.keys(item)[0];
    let value = item[key];
    let tr = document.createElement('tr');
    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    td1.innerHTML = key;
    td2.innerHTML = value;
    tr.appendChild(td1);
    tr.appendChild(td2);
    addWordsInTrList.trList.push(tr);
  }
}




function resetTimerInfo() {  //срабатывает только если посетитель закрывает страницу. (Для сброса таймера со страницы cards)
  $.ajax({ 
    url: "/resetTimerInfo", //Сбрасывает таймер
    contentType: "application/json", 
    method: "GET"
  });
}
window.addEventListener('unload', resetTimerInfo); //если посетитель закрывает сайт



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




function hideBottom() { 
  try {
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
  } catch(e) {
  }
}
hideBottom();
window.addEventListener('resize', hideBottom);