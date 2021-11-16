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

        var fields = document.createElement('div');
        fields.setAttribute('class', 'fields');
        this.gameArea.appendChild(fields);

        //числа таблицы
        this.fieldNumbers = document.createElement('div');
        this.fieldNumbers.setAttribute('class', 'symbolsVert');
        createNumbersVertical(this.fieldNumbers, this.gameFieldBorderY);
        fields.appendChild(this.fieldNumbers);

        var playerGameArea = document.createElement('div');
        playerGameArea.setAttribute('class', 'playerGameArea');
        fields.appendChild(playerGameArea);

        //числа таблицы
        this.fieldNumbers = document.createElement('div');
        this.fieldNumbers.setAttribute('class', 'symbolsVert');
        createNumbersVertical(this.fieldNumbers, this.gameFieldBorderY);
        fields.appendChild(this.fieldNumbers);

        var botGameArea = document.createElement('div');
        botGameArea.setAttribute('class', 'botGameArea');
        fields.appendChild(botGameArea);

        this.playerInfo = document.createElement('div');
        this.playerInfo.setAttribute('class', 'playerInfo');
        this.playerInfo.innerHTML = this.playerName;
        playerGameArea.appendChild(this.playerInfo);

        this.botInfo = document.createElement('div');
        this.botInfo.setAttribute('class', 'botInfo');
        this.botInfo.innerHTML = this.botName;
        botGameArea.appendChild(this.botInfo);

        //буквы таблицы
        this.fieldSymbols = document.createElement('div');
        this.fieldSymbols.setAttribute('class', 'symbolsHoriz');
        createSymbolsHorizontal(this.fieldSymbols, this.gameFieldBorderX, this.gameFieldBorderY);
        playerGameArea.appendChild(this.fieldSymbols);

        //буквы таблицы
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
                this.createPointBlock(yPoint, xPoint, 'bot');
                this.createPointBlock(yPoint, xPoint, 'player');
            }
        }
    }

    // Создание ячеек, в которых будут размещаться корабли     
    createPointBlock(yPoint, xPoint, type) {
        var id = type + '_x' + xPoint + '_y' + yPoint;
        var block = document.getElementById(id);
        if (block) {
            block.innerHTML = '';
            block.setAttribute('class', '');
        } else {
            // если блока еще не существует
            block = document.createElement('div');
            block.setAttribute('id', id);
            block.setAttribute('data-x', xPoint);
            block.setAttribute('data-y', yPoint);
            // добавление ячейки на поле пользователя
            if (type && type === 'player') {
                this.playerGameField.appendChild(block);
            } else {
                this.botGameField.appendChild(block);
            }
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
};