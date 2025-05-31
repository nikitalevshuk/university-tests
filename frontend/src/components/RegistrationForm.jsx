import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { AlertCircle, X } from 'lucide-react';

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
  const [showInstructionModal, setShowInstructionModal] = useState(false);

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
      
      // Показываем модальное окно инструкции
      setShowInstructionModal(true);
    }
  };

  // Обработка ознакомления с инструкцией
  const handleInstructionAcknowledged = () => {
    setShowInstructionModal(false);
    // Переход на страницу теста
    window.location.href = '/test';
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setShowInstructionModal(false);
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
            <h1 className="text-2xl font-bold text-[#f5e8d0] mb-2">
              Психологическое тестирование
            </h1>
            <p className="text-[#f5e8d0]/70 text-sm leading-relaxed">
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
              <label className="block text-sm font-medium text-[#f5e8d0] mb-2">
                Фамилия
              </label>
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onBlur={(e) => handleBlur('lastName', e.target.value)}
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
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
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
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
                className={`
                  bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] placeholder:text-[#f5e8d0]/50
                  hover:scale-105 transition-transform duration-150 ease-in-out
                  focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20
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
                <Select onValueChange={(value) => handleSelectChange('faculty', value)}>
                  <SelectTrigger className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20">
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
                <Select onValueChange={(value) => handleSelectChange('course', value)}>
                  <SelectTrigger className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] focus:border-[#f5e8d0] focus:ring-[#f5e8d0]/20">
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

            {/* Кнопка отправки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={!isFormValid}
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
                Начать тест
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* Модальное окно инструкции */}
      <AnimatePresence>
        {showInstructionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Блюр фон */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={handleCloseModal}
            />
            
            {/* Модальное окно */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md bg-black/20 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8"
            >
              {/* Кнопка закрытия */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-[#f5e8d0]/70 hover:text-[#f5e8d0] transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Заголовок */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-center mb-6"
              >
                <h2 className="text-xl font-bold text-[#f5e8d0] mb-2">
                  Инструкция к тестированию
                </h2>
                <div className="w-16 h-0.5 bg-[#f5e8d0]/30 mx-auto"></div>
              </motion.div>

              {/* Текст инструкции */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mb-8"
              >
                <div className="text-[#f5e8d0]/80 text-sm leading-relaxed space-y-4">
                  <p>
                    <strong className="text-[#f5e8d0]">Внимательно прочитайте перед началом теста:</strong>
                  </p>
                  <ul className="space-y-2 pl-4">
                    <li>• Тест состоит из нескольких блоков вопросов</li>
                    <li>• Отвечайте честно и не думайте слишком долго</li>
                    <li>• Нет правильных или неправильных ответов</li>
                    <li>• Время прохождения не ограничено</li>
                    <li>• Результаты будут сохранены автоматически</li>
                  </ul>
                  <p className="text-[#f5e8d0]/60 text-xs mt-4">
                    Убедитесь, что у вас есть достаточно времени для прохождения теста.
                  </p>
                </div>
              </motion.div>

              {/* Кнопка подтверждения */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Button
                  onClick={handleInstructionAcknowledged}
                  className={`
                    w-full h-12 text-base font-medium rounded-full 
                    bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900
                    border border-[#f5e8d0]/50
                    transition-all duration-150 ease-in-out
                    hover:scale-105 
                    shadow-lg hover:shadow-xl
                  `}
                >
                  С инструкцией ознакомлен
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationForm; 