import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, Loader2, LogIn, UserPlus } from 'lucide-react';
import { authService, apiUtils } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.getCurrentUser();
        // Если запрос успешен, пользователь авторизован
        navigate('/dashboard');
      } catch (error) {
        // Если ошибка авторизации - это нормально, пользователь не авторизован
        if (!apiUtils.isAuthError(error)) {
          console.error('Ошибка при проверке авторизации:', error);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    faculty: '',
    course: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const faculties = ['ФИБ', 'ФКСИС', 'ФКП', 'ФРЭ', 'ИЭФ', 'ФИТУ'];
  const courses = ['1', '2', '3', '4', '5', '6'];

  // Функция для капитализации с учетом дефиса
  const capitalizeWithHyphen = (str) => {
    return str
      .toLowerCase()
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('-');
  };

  // Функция для обычной капитализации
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Валидация поля имени (только кириллица, дефис только для фамилии)
  const validateNameField = (value, fieldName) => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      return 'Поле обязательно для заполнения';
    }
    
    if (trimmedValue.length < 2) {
      return 'Минимум 2 символа';
    }

    // Проверка на кириллицу и дефис
    const cyrillicPattern = fieldName === 'lastName' 
      ? /^[а-яё]+(-[а-яё]+)?$/i  // Дефис разрешен только в фамилии
      : /^[а-яё]+$/i;             // Дефис запрещен в имени и отчестве

    if (!cyrillicPattern.test(trimmedValue)) {
      if (fieldName === 'lastName') {
        return 'Только кириллица, допускается один дефис';
      } else {
        return 'Только кириллица';
      }
    }

    return '';
  };

  // Валидация пароля
  const validatePassword = (value) => {
    if (!value.trim()) {
      return 'Пароль обязателен для заполнения';
    }
    
    if (value.length < 6) {
      return 'Минимум 6 символов';
    }

    return '';
  };

  // Обработка потери фокуса
  const handleBlur = (fieldName, value) => {
    const trimmedValue = value.trim();
    
    if (fieldName !== 'password' && trimmedValue) {
      let formattedValue;
      if (fieldName === 'lastName' && trimmedValue.includes('-')) {
        formattedValue = capitalizeWithHyphen(trimmedValue);
      } else {
        formattedValue = capitalize(trimmedValue);
      }
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: formattedValue
      }));
    }

    // Валидация только для полей ввода (имена и пароль)
    let error = '';
    if (fieldName === 'password') {
      error = validatePassword(trimmedValue);
    } else if (['firstName', 'lastName', 'middleName'].includes(fieldName)) {
      error = validateNameField(trimmedValue, fieldName);
    }
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Обработка изменения значений
  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Очистка ошибки при вводе
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
    
    // Очистка ошибки отправки
    if (submitError) {
      setSubmitError('');
    }
  };

  // Обработка изменения селектов
  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Очистка ошибки отправки
    if (submitError) {
      setSubmitError('');
    }
  };

  // Проверка валидности формы
  useEffect(() => {
    const { lastName, firstName, middleName, faculty, course, password } = formData;
    
    const nameFieldsValid = [
      validateNameField(lastName, 'lastName'),
      validateNameField(firstName, 'firstName'),
      validateNameField(middleName, 'middleName')
    ].every(error => error === '');

    const passwordValid = validatePassword(password) === '';
    const allFieldsFilled = lastName.trim() && firstName.trim() && middleName.trim() && faculty && course && password.trim();
    
    setIsFormValid(nameFieldsValid && passwordValid && allFieldsFilled);
  }, [formData]);

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;
    
    try {
      setIsLoading(true);
      setSubmitError('');
      
      // Отправляем данные на сервер для авторизации
      await authService.login(formData);
      
      // Если авторизация успешна, переходим на Dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      
      const errorMessage = apiUtils.formatErrorMessage(error);
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Переход к регистрации
  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Мелкая сетка */}
      <div 
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 232, 208, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 232, 208, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px'
        }}
      />
      
      {/* Дополнительные градиентные пятна для глубины */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-[#a5f3b4]/20 rounded-full mr-3">
                <LogIn className="w-6 h-6 text-[#a5f3b4]" />
              </div>
              <h1 className="text-2xl font-bold text-[#f5e8d0]">
                Вход в систему
              </h1>
            </div>
            <p className="text-[#f5e8d0]/70 text-sm leading-relaxed">
              Введите ваши данные для входа в систему психологического тестирования
            </p>
          </motion.div>

          {/* Ошибка отправки */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg"
            >
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {submitError}
              </div>
            </motion.div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Фамилия */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Фамилия
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={(e) => handleBlur('lastName', e.target.value)}
                disabled={isLoading}
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.lastName ? 'border-red-400 focus:ring-red-400/20' : ''}
                `}
                placeholder="Введите фамилию"
              />
              {errors.lastName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.lastName}
                </motion.div>
              )}
            </motion.div>

            {/* Имя */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Имя
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={(e) => handleBlur('firstName', e.target.value)}
                disabled={isLoading}
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.firstName ? 'border-red-400 focus:ring-red-400/20' : ''}
                `}
                placeholder="Введите имя"
              />
              {errors.firstName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.firstName}
                </motion.div>
              )}
            </motion.div>

            {/* Отчество */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Отчество
              </label>
              <Input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                onBlur={(e) => handleBlur('middleName', e.target.value)}
                disabled={isLoading}
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.middleName ? 'border-red-400 focus:ring-red-400/20' : ''}
                `}
                placeholder="Введите отчество"
              />
              {errors.middleName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.middleName}
                </motion.div>
              )}
            </motion.div>

            {/* Факультет */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Факультет
              </label>
              <div className="hover:scale-105 transition-transform duration-150 ease-in-out">
                <Select 
                  onValueChange={(value) => handleSelectChange('faculty', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20 disabled:opacity-50">
                    <SelectValue placeholder="Выберите факультет" className="text-[#f5e8d0]/50" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-[#f5e8d0]/40">
                    {faculties.map((faculty) => (
                      <SelectItem 
                        key={faculty} 
                        value={faculty}
                        className="text-[#f5e8d0] hover:bg-[#f5e8d0]/10 focus:bg-[#f5e8d0]/10 focus:text-[#f5e8d0]"
                      >
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Курс */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Курс
              </label>
              <div className="hover:scale-105 transition-transform duration-150 ease-in-out">
                <Select 
                  onValueChange={(value) => handleSelectChange('course', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20 disabled:opacity-50">
                    <SelectValue placeholder="Выберите курс" className="text-[#f5e8d0]/50" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-[#f5e8d0]/40">
                    {courses.map((course) => (
                      <SelectItem 
                        key={course} 
                        value={course}
                        className="text-[#f5e8d0] hover:bg-[#f5e8d0]/10 focus:bg-[#f5e8d0]/10 focus:text-[#f5e8d0]"
                      >
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Пароль */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Пароль
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={(e) => handleBlur('password', e.target.value)}
                disabled={isLoading}
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${errors.password ? 'border-red-400 focus:ring-red-400/20' : ''}
                `}
                placeholder="Введите пароль"
              />
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </motion.div>
              )}
            </motion.div>

            {/* Кнопка входа */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`
                  w-full h-12 text-base font-medium rounded-full 
                  bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900
                  border border-[#f5e8d0]/50
                  transition-all duration-150 ease-in-out
                  hover:scale-105 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  disabled:hover:scale-100 disabled:hover:bg-[#a5f3b4]
                  shadow-lg hover:shadow-xl
                `}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Вход в систему...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Войти
                  </>
                )}
              </Button>
            </motion.div>

            {/* Ссылка на регистрацию */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="text-center pt-4"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#f5e8d0]/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-[#f5e8d0]/60">
                    или
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                onClick={handleGoToRegister}
                disabled={isLoading}
                className={`
                  w-full h-12 text-base font-medium rounded-full mt-4
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] 
                  hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0]
                  transition-all duration-150 ease-in-out
                  hover:scale-105 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl
                `}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Нет аккаунта? Зарегистрироваться
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage; 