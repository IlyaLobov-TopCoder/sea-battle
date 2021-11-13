var player;
var bot;

buttonStart.onclick = function() {
    player = String(document.getElementById('player').value);
    bot = String(document.getElementById('bot').value);
    if (!player || !bot) {
        alert('Введите имена пользователей');
    } else {
        // Временный вывод имен пользователей
        document.getElementById('test').innerHTML = "Вы ввели: " +
            player.replace("<", "&lt;").replace(">", "&gt;") +
            " и " + bot.replace("<", "&lt;").replace(">", "&gt;");
    }
};