# ogruNotifier

Браузерное дополнение - счетчик непрочитанных оповещений для форума https://www.old-games.ru/forum/. Proof of Concept.

Использует существующий логин в браузере, чтобы получить счетчик. Периодичность проверки - 5 минут, пока не настраивается.

#### Совместимость
- Firefox 48+
- Chrome 80+ (страница в Chrome Web Store повится в скором времени)

Совместимость с Chrome осуществляется с помощью слоя совместимости WebExtension browser API Polyfill от Mozilla.

#### Настройка окружения разработки
Первоначальная настройка простая, есть 2 варианта:
- при наличии установленного Node.js и npm исполнить команду `npm install` в корневой папке - это скачает и поместит в папку `./extension` последнюю версию `browser-polyfill.js` (https://github.com/mozilla/webextension-polyfill) из npm
- скачать `browser-polyfill.js` самостоятельно и поместить его в папку `./extension`

Для отладки и тестирования см. соответствующие инструкции:
- Firefox: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
- Chrome: https://developer.chrome.com/docs/extensions/mv2/tut_debugging/

### TODO
- Настраиваемая периодичность проверки
- Сброс счетчика при обнаружении определенных запросов на форуме, которые обнуляют счетчик на стороне сервера

Тикеты и пулл-реквесты приветствуются!
