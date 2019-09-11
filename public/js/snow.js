
function snow() {
  var snowBox = document.createElement('div');
  document.body.appendChild(snowBox);

  function snowRepeat() {
    for (var i = 0; i < 2; i++)(function () {
      var snow = document.createElement('div');
      snow.style.cssText = `position: absolute;
			background-color: rgba(255, 255, 255);
			border-radius: 100%`;
      snow.classList.add('snowball')
      snow.style.opacity = 0.4;

      var mainSnow = new MainSnow();

      var size = mainSnow.snowSize().toFixed(3);
      snow.style.width = size + "rem";
      snow.style.height = size + "rem";


      var coords = mainSnow.snowCoords(size);
      snow.style.left = coords.width + "px";
      snow.style.top = coords.height + "px";

      snowBox.appendChild(snow);
      mainSnow.nextDirection(coords.direction, snow);

      setTimeout(function () {
        snow.remove();
      }, 26000)
    })();
  }
  snowRepeat();

  setTimeout(function int() {
    snowRepeat();
    setTimeout(int, 400);
  }, 100)





  function MainSnow() {

    this.snowCoords = function (size) {                                      //начальные координаты снежинок
      var windowWidth = document.documentElement.clientWidth;
      var windowHeight = document.documentElement.clientHeight;

      var snowWidthCoord;
      var snowHeightCoord;

      var rand = randomSnowCoord(1, 4);

      switch (rand) {
        case 1: //верхняя грань
          snowWidthCoord = randomSnowCoord(0, windowWidth);
          snowHeightCoord = -(size * 16);
          break;

        case 2: //нижняя грань
          snowWidthCoord = randomSnowCoord(0, windowWidth);
          snowHeightCoord = windowHeight;
          break;

        case 3: //левая грань
          snowHeightCoord = randomSnowCoord(0, windowHeight);
          snowWidthCoord = -(size * 16);
          break;

        case 4: //правая грань
          snowHeightCoord = randomSnowCoord(0, windowHeight);
          snowWidthCoord = windowWidth;
          break;
      }

      function randomSnowCoord(min, max) {
        var random = min + Math.random() * (max + 1 - min);
        random = Math.floor(random);
        return random;
      }

      return {
        width: snowWidthCoord,
        height: snowHeightCoord,
        direction: rand
      }

    }

    this.snowSize = function () {                                               //размер снежинок

      return randomSnowSize(0.15, 0.3)

      function randomSnowSize(min, max) {
        return (min + Math.random() * (max - min));
      }

    }


    this.nextDirection = function (direction, snow) {                           //запуск снежинок в направдении

      var subDir = randomizer(1, 3);


      var start = setInterval(function () {
        next(direction);
      }, 15);

      var decreaseOpacity;


      setTimeout(function () {
        decreaseOpacity = setInterval(function () {
          snow.style.opacity = snow.style.opacity - 0.01
        }, 300)
      }, 7000);

      setTimeout(function () {
        clearTimeout(start);
        clearTimeout(decreaseOpacity);
      }, 26000);






      function randomizer(min, max) {
        var random = min + Math.random() * (max + 1 - min);
        random = Math.floor(random);
        return random;
      }



      function next(direction) {
        switch (direction) {
          case 1: //сверху вниз
            if (subDir == 1) {
              snow.style.top = parseInt(snow.style.top) + 1 + "px";
            }
            if (subDir == 2) {
              snow.style.top = parseInt(snow.style.top) + 1 + "px";
              snow.style.left = parseInt(snow.style.left) + 1 + "px";
            }
            if (subDir == 3) {
              snow.style.top = parseInt(snow.style.top) + 1 + "px";
              snow.style.left = parseInt(snow.style.left) - 1 + "px";
            }
            break;

          case 2: //снизу вверх
            if (subDir == 1) {
              snow.style.top = parseInt(snow.style.top) - 1 + "px";
            }
            if (subDir == 2) {
              snow.style.top = parseInt(snow.style.top) - 1 + "px";
              snow.style.left = parseInt(snow.style.left) + 1 + "px";
            }
            if (subDir == 3) {
              snow.style.top = parseInt(snow.style.top) - 1 + "px";
              snow.style.left = parseInt(snow.style.left) - 1 + "px";
            }
            break;

          case 3: //слева направо
            if (subDir == 1) {
              snow.style.left = parseInt(snow.style.left) + 1 + "px";
            }
            if (subDir == 2) {
              snow.style.left = parseInt(snow.style.left) + 1 + "px";
              snow.style.top = parseInt(snow.style.top) - 1 + "px";
            }
            if (subDir == 3) {
              snow.style.left = parseInt(snow.style.left) + 1 + "px";
              snow.style.top = parseInt(snow.style.top) + 1 + "px";
            }
            break;

          case 4: //справа налево
            if (subDir == 1) {
              snow.style.left = parseInt(snow.style.left) - 1 + "px";
            }
            if (subDir == 2) {
              snow.style.left = parseInt(snow.style.left) - 1 + "px";
              snow.style.top = parseInt(snow.style.top) - 1 + "px";
            }
            if (subDir == 3) {
              snow.style.left = parseInt(snow.style.left) - 1 + "px";
              snow.style.top = parseInt(snow.style.top) + 1 + "px";
            }
            break;
        }
      }

    }

  }



}
// snow()







