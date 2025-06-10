# Компоненты Frontend

## Обзор

Frontend построен на React 18.2.0 с использованием функциональных компонентов и хуков.

**Расположение:** `frontend/src/components/`

**Технологии:**
- React Router DOM для маршрутизации
- Tailwind CSS для стилизации
- Framer Motion для анимаций
- Radix UI для UI компонентов

## Структура компонентов

### Главный компонент

#### App.jsx
**Описание:** Корневой компонент приложения с настройкой маршрутизации.

**Маршруты:**
- `/` - Страница входа (LoginPage)
- `/register` - Страница регистрации (RegistrationForm)
- `/dashboard` - Главная панель (Dashboard) - защищенный маршрут
- `/test/:testId` - Страница прохождения теста (TestPage) - защищенный маршрут
- `/results/:testId` - Страница результатов (ResultsPage) - защищенный маршрут

**Особенности:**
- Использует BrowserRouter для SPA навигации
- Все основные маршруты защищены компонентом ProtectedRoute
- Поддерживает старые маршруты для обратной совместимости

---

### Компоненты аутентификации

#### LoginPage.jsx
**Файл:** `frontend/src/components/LoginPage.jsx`

**Описание:** Страница входа в систему с формой авторизации.

**Функциональность:**
- Форма входа с полями: ФИО, факультет, курс, пароль
- Валидация данных на клиенте
- Интеграция с API авторизации
- Автоматическое перенаправление после успешного входа
- Ссылка на страницу регистрации

**Состояние:**
```javascript
const [formData, setFormData] = useState({
  firstName: '',
  lastName: '',
  middleName: '',
  faculty: '',
  course: '',
  password: ''
});
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

**Основные методы:**
- `handleSubmit()` - обработка отправки формы
- `handleInputChange()` - обработка изменений в полях

#### RegistrationForm.jsx
**Файл:** `frontend/src/components/RegistrationForm.jsx`

**Описание:** Страница регистрации новых пользователей.

**Функциональность:**
- Форма регистрации с валидацией
- Подтверждение пароля
- Выбор факультета из списка
- Выбор курса (1-6)
- Проверка уникальности пользователя

**Валидация:**
- Все поля обязательны
- Пароль минимум 6 символов
- Подтверждение пароля должно совпадать
- Курс должен быть от 1 до 6

#### ProtectedRoute.jsx
**Файл:** `frontend/src/components/ProtectedRoute.jsx`

**Описание:** HOC для защиты маршрутов от неавторизованных пользователей.

**Функциональность:**
- Проверка авторизации пользователя
- Автоматическое перенаправление на страницу входа
- Показ загрузки во время проверки

**Использование:**
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

---

### Основные страницы

#### Dashboard.jsx
**Файл:** `frontend/src/components/Dashboard.jsx`

**Описание:** Главная панель пользователя со списком доступных тестов.

**Функциональность:**
- Отображение информации о пользователе
- Список доступных тестов
- Статус прохождения тестов
- Навигация к тестам и результатам

**Состояние:**
```javascript
const [user, setUser] = useState(null);
const [tests, setTests] = useState([]);
const [testStatuses, setTestStatuses] = useState({});
const [isLoading, setIsLoading] = useState(true);
```

**Компоненты:**
- Header - шапка с информацией о пользователе
- TestCard - карточки тестов

#### TestPage.jsx
**Файл:** `frontend/src/components/TestPage.jsx`

**Описание:** Страница прохождения психологического теста.

**Функциональность:**
- Загрузка вопросов теста
- Пошаговое прохождение вопросов
- Сохранение ответов пользователя
- Подсчет результатов
- Отправка результатов на сервер

**Состояние:**
```javascript
const [testData, setTestData] = useState(null);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [answers, setAnswers] = useState({});
const [isCompleted, setIsCompleted] = useState(false);
const [results, setResults] = useState(null);
```

**Алгоритм подсчета результатов:**
- Подсчет баллов по шкалам темперамента
- Определение доминирующего типа
- Формирование детального описания

#### ResultsPage.jsx
**Файл:** `frontend/src/components/ResultsPage.jsx`

**Описание:** Страница отображения результатов пройденного теста.

**Функциональность:**
- Загрузка результатов теста
- Визуализация результатов
- Детальное описание типа темперамента
- Рекомендации и характеристики

**Отображаемая информация:**
- Тип темперамента
- Процентное соотношение типов
- Подробное описание
- Рекомендации

---

### UI компоненты

#### Header.jsx
**Файл:** `frontend/src/components/Header.jsx`

**Описание:** Компонент шапки приложения.

**Функциональность:**
- Отображение информации о пользователе
- Кнопка выхода из системы
- Навигация по приложению

**Props:**
```javascript
{
  user: {
    full_name: string,
    faculty: string,
    course: number
  },
  onLogout: function
}
```

#### TestCard.jsx
**Файл:** `frontend/src/components/TestCard.jsx`

**Описание:** Карточка теста на главной странице.

**Функциональность:**
- Отображение информации о тесте
- Статус прохождения
- Кнопки действий (пройти/посмотреть результаты)

**Props:**
```javascript
{
  test: {
    id: number,
    title: string,
    description: string
  },
  status: 'not_started' | 'completed',
  onStartTest: function,
  onViewResults: function
}
```

#### UI компоненты (ui/)
**Расположение:** `frontend/src/components/ui/`

Переиспользуемые UI компоненты на основе Radix UI:
- Button - кнопки различных стилей
- Input - поля ввода
- Select - выпадающие списки
- Card - карточки контента
- Dialog - модальные окна

---

## Управление состоянием

### Локальное состояние
Каждый компонент управляет своим состоянием через хуки:
- `useState` - для локального состояния
- `useEffect` - для побочных эффектов
- `useNavigate` - для программной навигации
- `useParams` - для получения параметров маршрута

### Глобальное состояние
В текущей версии глобальное состояние не используется. Данные передаются через:
- Props между компонентами
- API вызовы для получения данных
- LocalStorage для временного хранения

### Предложения по улучшению
Для масштабирования рекомендуется добавить:
- Context API для глобального состояния
- React Query для кеширования API данных
- Zustand или Redux Toolkit для сложного состояния

---

## Стилизация

### Tailwind CSS
Основной подход к стилизации через utility-классы:

```jsx
<div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
  <div className="p-6">
    <h2 className="text-xl font-semibold text-gray-900">
      Заголовок
    </h2>
  </div>
</div>
```

### Компонентные стили
Для сложных компонентов используются:
- CSS модули (при необходимости)
- Styled components через className
- CSS-in-JS через style prop

### Адаптивность
Все компоненты адаптивны благодаря Tailwind CSS:
- Mobile-first подход
- Breakpoints: sm, md, lg, xl
- Flexbox и Grid для лейаутов

---

## Анимации

### Framer Motion
Используется для плавных переходов и анимаций:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Контент
</motion.div>
```

### Типы анимаций
- Появление/исчезновение элементов
- Переходы между страницами
- Анимация кнопок и интерактивных элементов
- Загрузочные состояния

---

## Обработка ошибок

### Паттерны обработки
```javascript
const [error, setError] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    await apiCall();
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};
```

### Типы ошибок
- Ошибки валидации форм
- Ошибки API запросов
- Ошибки авторизации
- Сетевые ошибки

### Отображение ошибок
- Toast уведомления
- Inline сообщения в формах
- Error boundaries для критических ошибок

---

## Производительность

### Оптимизации
- React.memo для предотвращения лишних рендеров
- useMemo для дорогих вычислений
- useCallback для стабильных функций
- Lazy loading для больших компонентов

### Code Splitting
```javascript
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<div>Загрузка...</div>}>
  <LazyComponent />
</Suspense>
```

### Bundle анализ
- Vite Bundle Analyzer для анализа размера
- Tree shaking для удаления неиспользуемого кода
- Минификация в production сборке

---

## Тестирование

### Рекомендуемые инструменты
- **Jest** - unit тестирование
- **React Testing Library** - тестирование компонентов
- **Cypress** - E2E тестирование

### Примеры тестов
```javascript
// Unit тест компонента
import { render, screen } from '@testing-library/react';
import TestCard from './TestCard';

test('отображает название теста', () => {
  const test = { id: 1, title: 'Тест темперамента' };
  render(<TestCard test={test} />);
  
  expect(screen.getByText('Тест темперамента')).toBeInTheDocument();
});
```

### Покрытие тестами
- Критические пути пользователя
- Формы и валидация
- API интеграция
- Обработка ошибок

---

## Доступность (A11y)

### Принципы
- Семантическая разметка HTML
- ARIA атрибуты для интерактивных элементов
- Поддержка клавиатурной навигации
- Контрастность цветов

### Примеры реализации
```jsx
<button
  aria-label="Начать тест"
  onClick={handleStartTest}
  className="focus:ring-2 focus:ring-blue-500"
>
  Начать
</button>
```

### Инструменты проверки
- axe-core для автоматической проверки
- Lighthouse для аудита доступности
- Screen reader тестирование 