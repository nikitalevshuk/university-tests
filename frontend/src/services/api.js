const API_BASE_URL = 'http://localhost:8000';

// Базовый класс для API запросов
class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Метод для выполнения HTTP запросов
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Важно для отправки httpOnly cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Проверяем статус ответа
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // Если ответ пустой, возвращаем пустой объект
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET запрос
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST запрос
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запрос
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запрос
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Создаем экземпляр API сервиса
const api = new ApiService();

// Сервис авторизации
export const authService = {
  // Регистрация пользователя
  async register(userData) {
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      middle_name: userData.middleName,
      faculty: userData.faculty,
      course: parseInt(userData.course),
      password: userData.password
    };
    
    return api.post('/auth/register', payload);
  },

  // Авторизация пользователя
  async login(credentials) {
    const payload = {
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      middle_name: credentials.middleName,
      faculty: credentials.faculty,
      course: parseInt(credentials.course),
      password: credentials.password
    };
    
    return api.post('/auth/login', payload);
  },

  // Выход из системы
  async logout() {
    return api.post('/auth/logout');
  },

  // Получение информации о текущем пользователе
  async getCurrentUser() {
    return api.get('/auth/me');
  }
};

// Сервис тестов
export const testsService = {
  // Получение всех доступных тестов
  async getAvailableTests() {
    return api.get('/tests/available');
  },

  // Получение информации о конкретном тесте
  async getTestById(testId) {
    return api.get(`/tests/${testId}`);
  },

  // Получение статуса всех тестов для пользователя
  async getUserTestsStatus() {
    return api.get('/user-tests/status');
  },

  // Алиас для совместимости
  async getTestStatuses() {
    return this.getUserTestsStatus();
  },

  // Загрузка данных теста из JSON файла
  async loadTestData(filename) {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить файл теста: ${filename}`);
      }
      
      const data = await response.json();
      
      // Первый элемент содержит метаданные теста
      if (data && data.length > 0) {
        const metadata = data[0];
        return {
          title: metadata.title || 'Неизвестный тест',
          description: metadata.description || 'Описание недоступно',
          questions: data.slice(1).filter(item => item.question)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка при загрузке данных теста:', error);
      throw error;
    }
  },

  // Завершение теста
  async completeTest(testId, completionData) {
    // completionData должен содержать поля: answers и result
    return api.post(`/user-tests/${testId}/complete`, completionData);
  },

  // Получение результатов теста
  async getTestResults(testId) {
    return api.get(`/user-tests/${testId}/results`);
  }
};

// Утилиты для работы с ошибками API
export const apiUtils = {
  // Проверка, является ли ошибка ошибкой авторизации
  isAuthError(error) {
    return error.message.includes('401') || 
           error.message.includes('Unauthorized') ||
           error.message.includes('токен');
  },

  // Проверка, является ли ошибка ошибкой валидации
  isValidationError(error) {
    return error.message.includes('422') || 
           error.message.includes('validation');
  },

  // Форматирование ошибки для показа пользователю
  formatErrorMessage(error) {
    if (this.isAuthError(error)) {
      return 'Ошибка авторизации. Пожалуйста, войдите в систему заново.';
    }
    
    if (this.isValidationError(error)) {
      return 'Ошибка валидации данных. Проверьте правильность заполнения полей.';
    }
    
    return error.message || 'Произошла неизвестная ошибка';
  }
};

export default api; 