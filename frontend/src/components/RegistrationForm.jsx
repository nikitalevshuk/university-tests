import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle } from 'lucide-react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    faculty: '',
    course: ''
  });

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Обработка потери фокуса
  const handleBlur = (fieldName, value) => {
    const trimmedValue = value.trim();
    
    if (trimmedValue) {
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

    // Валидация
    const error = validateNameField(trimmedValue, fieldName);
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
  };

  // Обработка изменения селектов
  const handleSelectChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Проверка валидности формы
  useEffect(() => {
    const { lastName, firstName, middleName, faculty, course } = formData;
    
    const nameFieldsValid = [
      validateNameField(lastName, 'lastName'),
      validateNameField(firstName, 'firstName'),
      validateNameField(middleName, 'middleName')
    ].every(error => error === '');

    const allFieldsFilled = lastName.trim() && firstName.trim() && middleName.trim() && faculty && course;
    
    setIsFormValid(nameFieldsValid && allFieldsFilled);
  }, [formData]);

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isFormValid) {
      const registrationData = {
        ...formData,
        registrationDate: new Date().toISOString(),
        registrationTime: new Date().toLocaleString('ru-RU')
      };
      
      localStorage.setItem('registrationData', JSON.stringify(registrationData));
      
      // Здесь можно добавить переход на следующую страницу
      alert('Регистрация успешно завершена! Данные сохранены.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Психологическое тестирование
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Для прохождения тестирования необходимо пройти процедуру регистрации
            </p>
          </motion.div>

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Фамилия */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={(e) => handleBlur('lastName', e.target.value)}
                className={`${errors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Введите фамилию"
              />
              {errors.lastName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-600 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имя
              </label>
              <Input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onBlur={(e) => handleBlur('firstName', e.target.value)}
                className={`${errors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Введите имя"
              />
              {errors.firstName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-600 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отчество
              </label>
              <Input
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                onBlur={(e) => handleBlur('middleName', e.target.value)}
                className={`${errors.middleName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Введите отчество"
              />
              {errors.middleName && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center mt-2 text-red-600 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Факультет
              </label>
              <Select onValueChange={(value) => handleSelectChange('faculty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите факультет" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty} value={faculty}>
                      {faculty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Курс */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Курс
              </label>
              <Select onValueChange={(value) => handleSelectChange('course', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите курс" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Кнопка отправки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-12 text-base font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
              >
                Начать тест
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationForm; 