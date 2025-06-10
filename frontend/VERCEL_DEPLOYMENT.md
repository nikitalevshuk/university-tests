# Деплой фронтенда на Vercel

## Подготовка проекта

Проект уже подготовлен для деплоя на Vercel:

- ✅ Удалены все Docker/nginx файлы
- ✅ Настроены переменные окружения
- ✅ Создан `vercel.json` для SPA
- ✅ API использует переменную окружения

## Настройки Vercel

### 1. Автоматический деплой через GitHub

1. **Подключите репозиторий к Vercel:**
   - Перейдите в [Vercel Dashboard](https://vercel.com/dashboard)
   - Нажмите "New Project"
   - Импортируйте ваш GitHub репозиторий

2. **Настройте директорию проекта:**
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Переменные окружения:**
   ```
   VITE_API_BASE_URL=https://university-tests-production.up.railway.app
   ```

### 2. Деплой через CLI

```bash
# Установка Vercel CLI
npm i -g vercel

# Переход в директорию frontend
cd frontend

# Первый деплой
vercel

# Настройка переменных окружения
vercel env add VITE_API_BASE_URL

# Повторный деплой с обновленными переменными
vercel --prod
```

## Структура проекта

```
frontend/
├── src/
│   ├── services/
│   │   └── api.js          # ✅ Использует VITE_API_BASE_URL
│   └── components/         # React компоненты
├── public/                 # Статические файлы
├── dist/                   # Папка сборки (создается при build)
├── vercel.json            # ✅ Конфигурация Vercel
├── package.json           # ✅ Настроены скрипты
├── vite.config.js         # Конфигурация Vite
└── tailwind.config.js     # Конфигурация Tailwind
```

## API Endpoints

Фронтенд подключается к Railway backend:
- **Базовый URL:** `https://university-tests-production.up.railway.app`
- **Авторизация:** `/auth/login`, `/auth/register`, `/auth/me`
- **Тесты:** `/tests/available`, `/tests/{id}`
- **Результаты:** `/user-tests/{id}/complete`, `/user-tests/{id}/results`

## Проверка работы

После деплоя проверьте:

1. **Статические файлы:** Сайт загружается корректно
2. **SPA роутинг:** Обновление страницы работает
3. **API подключение:** Регистрация/авторизация работают
4. **CORS:** Нет ошибок в консоли браузера

## Возможные проблемы

### CORS ошибки
Если есть CORS ошибки, убедитесь что в Railway backend настроен `CORS_ORIGINS`:
```
CORS_ORIGINS=https://ваш-домен.vercel.app
```

### API не отвечает
Проверьте в браузере Developer Tools → Network, что запросы идут на правильный URL Railway.

### SPA роутинг не работает
Убедитесь что `vercel.json` содержит правильные rewrites для SPA.

## Автоматические деплои

При пуше в `main` ветку, Vercel автоматически:
1. Соберет проект (`npm run build`)
2. Задеплоит в продакшен
3. Обновит домен

Preview деплои создаются для всех других веток и PR. 