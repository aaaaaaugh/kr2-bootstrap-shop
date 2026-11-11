# SoundProject — КР №2 (Bootstrap 5)

Учебный 4-страничный сайт музыкальной платформы в духе SoundCloud. Сделан на Bootstrap 5.3.3, Bootstrap Icons и небольшом количестве JavaScript без сборки.

**Демо:** https://ВАШ_ЛОГИН.github.io/kr2-bootstrap-shop/

## Страницы

| Файл | Содержимое |
|------|------------|
| `index.html` | Hero с волной, тренды недели, новые релизы, преимущества |
| `catalog.html` | Поиск (`input-group`), фильтр по жанру (`form-select`), 12 карточек, пагинация, `alert` |
| `product.html` | Хлебные крошки, обложка, плеер с прогресс-баром, лайк, «Поделиться», таблица характеристик, комментарии |
| `order.html` | Избранное, форма подписки PRO, FAQ-аккордеон |

На всех страницах одинаковые `navbar`, модальное окно `#uploadModal`, уведомление (`toast`) и нижний плеер.

## Структура

```
kr2-bootstrap-shop/
├── index.html
├── catalog.html
├── product.html
├── order.html
├── css/custom.css
├── js/app.js
└── README.md
```

## Что работает на JavaScript

- Нижний плеер: пауза, переключение треков, перемотка, громкость.
- Поиск, фильтр по жанру и пагинация в каталоге.
- Лайки и избранное (хранятся в `localStorage`).
- Загрузка трека через модальное окно с проверкой полей. Трек сразу попадает в каталог.
- Комментарии на странице трека.
- Форма подписки с проверкой и сообщением об успехе.

## Использованные компоненты Bootstrap

Сетка (`container`, `row`, `col-*`, `g-4`), `navbar`, `card`, `btn`, `badge`, `alert`, `modal`, `toast`, `accordion`, `table`, `breadcrumb`, `pagination`, `progress`, `list-group`, `form-control`, `form-select`, `input-group`, `form-check`.

## Запуск

Откройте `index.html` в браузере. Для демо-аудио нужен интернет: треки берутся с `soundhelix.com`.

## Публикация на GitHub Pages

1. Загрузите папку в репозиторий `kr2-bootstrap-shop`.
2. Settings → Pages → Source: ветка `main`, папка `/ (root)`.
3. Вставьте полученную ссылку в строку «Демо» выше.