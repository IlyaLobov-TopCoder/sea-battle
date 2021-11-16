buttonStart.onclick = function() {
    let player = String(document.getElementById('player').value);
    let bot = String(document.getElementById('bot').value);
    if (!player || !bot) {
        alert('Введите имена пользователей');
    } else {
        player = player.replace("<", "&lt;").replace(">", "&gt;");
        bot = bot.replace("<", "&lt;").replace(">", "&gt;");

        let gameArea = document.createElement('div');
        gameArea.setAttribute('id', 'gameArea');
        document.body.appendChild(gameArea);

        let container = document.querySelector('.container');
        container.parentNode.removeChild(container);
        var game = new SeaBattle('gameArea', player, bot);
        game.createElements();
    }
};

class SeaBattle {
    constructor(nameArea, player, bot) {
        this.gameFieldBorderX = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'К'];
        this.gameFieldBorderY = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        this.gameArea = document.getElementById(nameArea);
        this.gameArea.innerHTML = "";
        this.shipsConfiguration = [
            { maxShips: 1, pointCount: 4 },
            { maxShips: 2, pointCount: 3 },
            { maxShips: 3, pointCount: 2 },
            { maxShips: 4, pointCount: 1 }
        ];
        this._botShipsMap = null;
        this._playerShipsMap = null;
        this.CELL_WITH_SHIP = true;
        this.EMPTY_CELL = false;

        this.playerName = player;
        this.botName = bot;

        this._blockHeight = null;

        this.botInfo = null;
        this.playerInfo = null;
        this.fieldSymbols = null;
        this.fieldNumbers = null;
        this.botGameField = null;
        this.playerGameField = null;
    }

    createElements() {
        this.createGameFields();
        this._botShipsMap = this.generateRandomShipMap();
        this._playerShipsMap = this.generateRandomShipMap();
        this.drawGamePoints();
    }

    createGameFields() {
        function createSymbolsHorizontal(parent, x, y) {
            for (var i = 0; i < x.length; i++) {
                let block = document.createElement('div');
                parent.appendChild(block);
                block.setAttribute('class', 'symbols');
                block.innerHTML = x[i];
                block.style.width = (100 / y.length) + '%';
                block.style.height = block.style.width;
            }
        };

        function createNumbersVertical(parent, y) {
            for (var i = 0; i < y.length; i++) {
                let block = document.createElement('div');
                parent.appendChild(block);
                block.setAttribute('class', 'numbers');
                block.innerHTML = y[i];
                block.style.height = (100 / y.length) + '%';
            }
        };

        // создание контейнера для полей и имен игроков, чисел и символов у полей
        var fields = document.createElement('div');
        fields.setAttribute('class', 'fields');
        this.gameArea.appendChild(fields);

        // создание вертикальных чисел около поля игрока
        this.fieldNumbers = document.createElement('div');
        this.fieldNumbers.setAttribute('class', 'symbolsVert');
        createNumbersVertical(this.fieldNumbers, this.gameFieldBorderY);
        fields.appendChild(this.fieldNumbers);

        // создание игрового поля игрока
        var playerGameArea = document.createElement('div');
        playerGameArea.setAttribute('class', 'playerGameArea');
        fields.appendChild(playerGameArea);

        // создание вертикальных чисел около поля компьютера
        this.fieldNumbers = document.createElement('div');
        this.fieldNumbers.setAttribute('class', 'symbolsVert');
        createNumbersVertical(this.fieldNumbers, this.gameFieldBorderY);
        fields.appendChild(this.fieldNumbers);

        // создание игрового поля компьютера
        var botGameArea = document.createElement('div');
        botGameArea.setAttribute('class', 'botGameArea');
        fields.appendChild(botGameArea);

        // создание поля с именем игрока
        this.playerInfo = document.createElement('div');
        this.playerInfo.setAttribute('class', 'playerInfo');
        this.playerInfo.innerHTML = this.playerName;
        playerGameArea.appendChild(this.playerInfo);

        // создание поля с именем компьютера
        this.botInfo = document.createElement('div');
        this.botInfo.setAttribute('class', 'botInfo');
        this.botInfo.innerHTML = this.botName;
        botGameArea.appendChild(this.botInfo);

        // создание горизонтальных букв около поля игрока
        this.fieldSymbols = document.createElement('div');
        this.fieldSymbols.setAttribute('class', 'symbolsHoriz');
        createSymbolsHorizontal(this.fieldSymbols, this.gameFieldBorderX, this.gameFieldBorderY);
        playerGameArea.appendChild(this.fieldSymbols);

        // создание горизонтальных букв около поля компьютера
        this.fieldSymbols = document.createElement('div');
        this.fieldSymbols.setAttribute('class', 'symbolsHoriz');
        createSymbolsHorizontal(this.fieldSymbols, this.gameFieldBorderX, this.gameFieldBorderY);
        botGameArea.appendChild(this.fieldSymbols);

        this.botGameField = document.createElement('div');
        this.botGameField.setAttribute('class', 'gameField');
        this.playerGameField = document.createElement('div');
        this.playerGameField.setAttribute('class', 'gameField');
        botGameArea.appendChild(this.botGameField);
        playerGameArea.appendChild(this.playerGameField);
    }

    // Создание игровых ячеек
    drawGamePoints() {
        for (var yPoint = 0; yPoint < this.gameFieldBorderY.length; yPoint++) {
            for (var xPoint = 0; xPoint < this.gameFieldBorderX.length; xPoint++) {
                var botPointBlock = this.createPointBlock(yPoint, xPoint, 'bot');
                botPointBlock.onclick = function(e) {
                    this.playerFire(e);
                }.bind(this);
                // отображение кораблей компьютера
                // if (this._botShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP) {
                //     botPointBlock.setAttribute('class', 'ship');
                // }
                var playerPointBlock = this.createPointBlock(yPoint, xPoint, 'player');
                // отображение кораблей игрока
                if (this._playerShipsMap[yPoint][xPoint] === this.CELL_WITH_SHIP) {
                    playerPointBlock.setAttribute('class', 'ship');
                }
            }
        }
    }

    // Создание ячеек, в которых могут размещаться корабли     
    createPointBlock(yPoint, xPoint, type) {
        var id = this.getPointBlockIdByCoords(yPoint, xPoint, type);
        // создание ячейки с определенным id
        var block = document.createElement('div');
        block.setAttribute('id', id);
        block.setAttribute('data-x', xPoint);
        block.setAttribute('data-y', yPoint);

        if (type && type === 'player') {
            // добавление ячейки на поле пользователя
            this.playerGameField.appendChild(block);
        } else {
            // добавление ячейки на поле компьютера
            this.botGameField.appendChild(block);
        }

        block.style.width = (100 / this.gameFieldBorderY.length) + '%';
        if (!this._blockHeight) {
            this._blockHeight = block.clientWidth;
        }
        block.style.height = this._blockHeight + 'px';
        block.style.lineHeight = this._blockHeight + 'px';
        block.style.fontSize = this._blockHeight + 'px';
        return block;
    }

    getPointBlockIdByCoords(yPoint, xPoint, type) {
        return type + '_x' + xPoint + '_y' + yPoint;
    }

    // Создание массива с информацией о наличии/отсутствии корабля в ячейках игрового поля
    generateRandomShipMap() {
        var map = [];
        // отрицательные координаты нужны для возможности размещения кораблей у видимых границ поля
        for (var yPoint = -1; yPoint < (this.gameFieldBorderY.length + 1); yPoint++) {
            for (var xPoint = -1; xPoint < (this.gameFieldBorderX.length + 1); xPoint++) {
                if (!map[yPoint]) {
                    map[yPoint] = [];
                }
                map[yPoint][xPoint] = this.EMPTY_CELL;
            }
        }
        // получение текущего количества кораблей из объекта конфигурации
        let shipsConfiguration = JSON.parse(JSON.stringify(this.shipsConfiguration));
        let allShipsPlaced = false;
        while (allShipsPlaced == false) {
            // случайная стартовая координата X генерации очередного корабля
            let xPoint = this.getRandomInt(0, this.gameFieldBorderX.length);
            // случайная стартовая координата Y генерации очередного корабля
            let yPoint = this.getRandomInt(0, this.gameFieldBorderY.length);
            if (this.isCellFree(map, xPoint, yPoint) == true) {
                if (this.canPutHorizontal(map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderX.length)) {
                    for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
                        map[yPoint][xPoint + i] = this.CELL_WITH_SHIP;
                    }
                } else if (this.canPutVertical(map, xPoint, yPoint, shipsConfiguration[0].pointCount, this.gameFieldBorderY.length)) {
                    for (var i = 0; i < shipsConfiguration[0].pointCount; i++) {
                        map[yPoint + i][xPoint] = this.CELL_WITH_SHIP;
                    }
                } else {
                    continue;
                }
                // если удалось определить координаты нового корабля,
                // то происходит удаление корабля из набора доступных для размещения кораблей
                shipsConfiguration[0].maxShips--;
                if (shipsConfiguration[0].maxShips < 1) {
                    shipsConfiguration.splice(0, 1);
                }
                if (shipsConfiguration.length === 0) {
                    allShipsPlaced = true;
                }
            }
        }
        return map;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    // Определение возможности размещения однопалубного корабля в ячейке с заданными координатами
    isCellFree(map, xPoint, yPoint) {
        // проверка пустоты текущей ячейки и всех соседних ячеек
        return map[yPoint][xPoint] == this.EMPTY_CELL &&
            map[yPoint - 1][xPoint] == this.EMPTY_CELL &&
            map[yPoint - 1][xPoint + 1] == this.EMPTY_CELL &&
            map[yPoint][xPoint + 1] == this.EMPTY_CELL &&
            map[yPoint + 1][xPoint + 1] == this.EMPTY_CELL &&
            map[yPoint + 1][xPoint] == this.EMPTY_CELL &&
            map[yPoint + 1][xPoint - 1] == this.EMPTY_CELL &&
            map[yPoint][xPoint - 1] == this.EMPTY_CELL &&
            map[yPoint - 1][xPoint - 1] == this.EMPTY_CELL
    }

    // Определение возможности горизонтальной вставки корабля
    canPutHorizontal(map, xPoint, yPoint, shipLength, coordLength) {
        var freePoints = 0;
        for (var x = xPoint; x < coordLength; x++) {
            // проверка пустоты текущей ячейки и всех ячеек в направлении вправо
            if (map[yPoint][x] == this.EMPTY_CELL &&
                map[yPoint - 1][x] == this.EMPTY_CELL &&
                map[yPoint - 1][x + 1] == this.EMPTY_CELL &&
                map[yPoint][x + 1] == this.EMPTY_CELL &&
                map[yPoint + 1][x + 1] == this.EMPTY_CELL &&
                map[yPoint + 1][x] == this.EMPTY_CELL) {
                freePoints++;
            } else {
                break;
            }
        }
        return freePoints >= shipLength;
    }

    // Определение возможности вертикальной вставки корабля
    canPutVertical(map, xPoint, yPoint, shipLength, coordLength) {
        var freePoints = 0;
        for (var y = yPoint; y < coordLength; y++) {
            // проверка пустоты текущей ячейки и всех ячеек в направлении вниз
            if (map[y][xPoint] == this.EMPTY_CELL &&
                map[y + 1][xPoint] == this.EMPTY_CELL &&
                map[y + 1][xPoint + 1] == this.EMPTY_CELL &&
                map[y + 1][xPoint] == this.EMPTY_CELL &&
                map[y][xPoint - 1] == this.EMPTY_CELL &&
                map[y + 1][xPoint - 1] == this.EMPTY_CELL) {
                freePoints++;
            } else {
                break;
            }
        }
        return freePoints >= shipLength;
    }

    // Обработка нажатия на ячейку
    playerFire(event) {
        var e = event || window.event;
        var firedEl = e.target || e.srcElement;
        var x = firedEl.getAttribute('data-x');
        var y = firedEl.getAttribute('data-y');
        if (this._botShipsMap[y][x] == this.EMPTY_CELL) {
            firedEl.innerHTML = this.getFireFailValue();
        } else {
            firedEl.innerHTML = this.getFireSuccessValue();
            firedEl.setAttribute('class', 'ship');
        }
        firedEl.onclick = null;
    }

    getFireSuccessValue() {
        return '&#10006;';
    }

    getFireFailValue() {
        return '&#8226;';
    }
};