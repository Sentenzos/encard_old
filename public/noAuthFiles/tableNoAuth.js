let tbodyList = [];
tbodyList.length = 15;
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
createButtons(tbodyList);

