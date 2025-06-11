const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    const courseNumber = parseInt(userData.course);
    if (isNaN(courseNumber)) {
      throw new Error('Некорректный номер курса');
    }
    
    const payload = {
      first_name: userData.firstName,
      last_name: userData.lastName,
      middle_name: userData.middleName,
      faculty: userData.faculty,
      course: courseNumber,
      password: userData.password
    };
    
    return api.post('/auth/register', payload);
  },

  // Авторизация пользователя
  async login(credentials) {
    const courseNumber = parseInt(credentials.course);
    if (isNaN(courseNumber)) {
      throw new Error('Некорректный номер курса');
    }
    
    const payload = {
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      middle_name: credentials.middleName,
      faculty: credentials.faculty,
      course: courseNumber,
      password: credentials.password
    };
    
    const response = await api.post('/auth/login', payload);
    
    // Сохраняем токен в localStorage для Safari compatibility
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
    }
    
    return response;
  },

  // Выход из системы
  async logout() {
    // Очищаем сохраненный токен
    localStorage.removeItem('access_token');
    return api.post('/auth/logout');
  },

  // Получение информации о текущем пользователе
  async getCurrentUser() {
    // Для Safari - используем Authorization header вместо cookies
    const token = localStorage.getItem('access_token');
    if (token) {
      return api.request('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // Fallback на cookies
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
    // Для Safari - используем Authorization header вместо cookies
    const token = localStorage.getItem('access_token');
    if (token) {
      return api.request('/user-tests/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // Fallback на cookies
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
    // Для Safari - используем Authorization header вместо cookies
    const token = localStorage.getItem('access_token');
    if (token) {
      return api.request(`/user-tests/${testId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completionData)
      });
    }
    
    // Fallback на cookies
    // completionData должен содержать поля: answers и result
    return api.post(`/user-tests/${testId}/complete`, completionData);
  },

  // Получение результатов теста
  async getTestResults(testId) {
    // Для Safari - используем Authorization header вместо cookies
    const token = localStorage.getItem('access_token');
    if (token) {
      return api.request(`/user-tests/${testId}/results`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    // Fallback на cookies
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