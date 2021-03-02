# ogruNotifier

Браузерное дополнение — счетчик непрочитанных оповещений для форума https://www.old-games.ru/forum/. Proof of Concept.

Использует существующий логин в браузере, чтобы получить счетчик. Периодичность проверки - 5 минут, пока не настраивается.

<a href="https://addons.mozilla.org/firefox/addon/ogrunotifier/" target="_blank"><img src="https://user-images.githubusercontent.com/585534/107280546-7b9b2a00-6a26-11eb-8f9f-f95932f4bfec.png" alt="Скачать для Firefox"></a> <a href="https://chrome.google.com/webstore/detail/ogrunotifier/pdiigojcibmmfcegbfckpcbphooppjfn" target="_blank"><img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="Скачать для Chrome"></a>

#### Совместимость
- Firefox 48+
- Chrome 66+

Совместимость с Chrome реализуется с помощью слоя совместимости [WebExtension browser API Polyfill от Mozilla](https://github.com/mozilla/webextension-polyfill).

#### Настройка окружения разработки
Первоначальная настройка простая, есть 2 варианта:
- при наличии установленного Node.js и npm исполнить команду `npm install` в корневой папке - это скачает и поместит в папку `./extension` последнюю версию `browser-polyfill.js` из npm
- скачать `browser-polyfill.js` самостоятельно и поместить его в папку `./extension`

Для отладки и тестирования см. соответствующие инструкции:
- Firefox: https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
- Chrome: https://developer.chrome.com/docs/extensions/mv2/tut_debugging/

### TODO
- Настраиваемая периодичность проверки
- Уменьшить потребление трафика

Тикеты и пулл-реквесты приветствуются!

### Version history
#### 1.0.1
- Первый релиз на AMO (addons.mozilla.org)

#### 1.0.2
- Убран флаг s из регексов для совместимости со старыми версиям браузеров

#### 1.1.0
- Первый релиз на CWS (Chrome Web Store)
- Убрана лишняя привилегия tabs
- Добавлен авто-сброс бейджа со счетчиком, если пользователь или браузер открывают страницу или выпадающее меню оповещений самостоятельно
