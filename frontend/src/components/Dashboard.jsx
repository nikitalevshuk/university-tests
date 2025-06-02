import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, PlayCircle, Clock, AlertCircle, User, LogOut, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import TestCard from './TestCard';
import { useNavigate } from 'react-router-dom';
import { authService, testsService, apiUtils } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [user, setUser] = useState(null);
  const [testStatuses, setTestStatuses] = useState({});
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError('');

        // Проверяем авторизацию
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Загружаем список доступных тестов из БД
        const availableTests = await testsService.getAvailableTests();
        
        // Загружаем статусы тестов пользователя
        const userTestStatuses = await testsService.getUserTestsStatus();
        
        // Временное логирование для дебага
        console.log('Raw user test statuses from API:', userTestStatuses);
        
        // Преобразуем статусы в объект для быстрого доступа
        const statusesMap = {};
        userTestStatuses.forEach(status => {
          console.log('Processing status:', status); // Дебаг лог
          statusesMap[status.test_id] = status;
        });
        setTestStatuses(statusesMap);
        
        console.log('Final statuses map:', statusesMap); // Дебаг лог

        // Создаем список тестов из данных БД, используя названия из статусов
        const testsData = availableTests.map(test => {
          const testStatus = statusesMap[test.id];
          return {
            id: test.id,
            filename: test.filename,
            title: testStatus?.test_title || `Тест ${test.id}`, // Берем название из статуса
            // Убираем описание с карточек - оно будет загружаться только для модального окна
          };
        });
        
        setTests(testsData);

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        
        if (apiUtils.isAuthError(error)) {
          // Ошибка авторизации - перенаправляем на регистрацию
          navigate('/');
        } else {
          setError(apiUtils.formatErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  // Функция для получения статуса теста
  const getTestStatus = (testId) => {
    const status = testStatuses[testId];
    console.log(`Getting status for test ${testId}:`, status); // Дебаг лог
    
    if (!status) return 'not_started';
    
    // Нормализуем статус к нижнему регистру для правильного сравнения
    const normalizedStatus = status.status?.toLowerCase();
    console.log(`Normalized status for test ${testId}:`, normalizedStatus); // Дебаг лог
    
    switch (normalizedStatus) {
      case 'completed':
        console.log(`Test ${testId} is completed`); // Дебаг лог
        return 'completed';
      case 'not_started':
      default:
        console.log(`Test ${testId} is not started`); // Дебаг лог
        return 'not_started';
    }
  };

  // Функция для получения даты завершения
  const getCompletedDate = (testId) => {
    const status = testStatuses[testId];
    if (status?.completed_at) {
      return new Date(status.completed_at).toLocaleDateString('ru-RU');
    }
    return null;
  };

  // Обработка клика по карточке теста
  const handleTestClick = async (test) => {
    const status = getTestStatus(test.id);
    
    if (status === 'completed') {
      // Если тест завершен, переходим к результатам
      navigate(`/results/${test.id}`);
    } else {
      // Если тест не завершен, загружаем описание из JSON файла и показываем модальное окно
      try {
        const testData = await testsService.loadTestData(test.filename);
        if (testData) {
          // Обновляем выбранный тест с загруженным описанием
          setSelectedTest({
            ...test,
            description: testData.description
          });
        } else {
          // Если не удалось загрузить описание, используем заглушку
          setSelectedTest({
            ...test,
            description: 'Описание недоступно'
          });
        }
        setShowDescriptionModal(true);
      } catch (error) {
        console.error('Ошибка при загрузке описания теста:', error);
        // В случае ошибки показываем модальное окно с заглушкой
        setSelectedTest({
          ...test,
          description: 'Не удалось загрузить описание теста'
        });
        setShowDescriptionModal(true);
      }
    }
  };

  // Обработка начала теста
  const handleStartTest = () => {
    if (selectedTest) {
      setShowDescriptionModal(false);
      navigate(`/test/${selectedTest.id}`);
    }
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setShowDescriptionModal(false);
    setSelectedTest(null);
  };

  // Обработка выхода из системы
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // В случае ошибки все равно перенаправляем на главную
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#f5e8d0] animate-spin mx-auto mb-4" />
          <div className="text-[#f5e8d0] text-lg">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900"
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
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

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full bg-black/20 backdrop-blur-sm border-b border-[#f5e8d0]/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип/название */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-[#f5e8d0]">
                Психологическое тестирование
              </h1>
            </div>

            {/* Информация о пользователе и кнопка выхода */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-[#f5e8d0]/80">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  {user ? `${user.last_name} ${user.first_name}` : 'Пользователь'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-transparent border-[#f5e8d0]/30 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:text-[#f5e8d0] hover:border-[#f5e8d0]/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Основной контент */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок страницы */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-[#f5e8d0] mb-4">
            Доступные тесты
          </h2>
          <p className="text-[#f5e8d0]/70 text-lg max-w-2xl mx-auto">
            Выберите тест для прохождения. Результаты будут сохранены после завершения.
          </p>
        </motion.div>

        {/* Сетка карточек тестов */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tests.map((test, index) => {
            const status = getTestStatus(test.id);
            const completedDate = getCompletedDate(test.id);

            return (
              <TestCard
                key={test.id}
                test={test}
                status={status}
                completedDate={completedDate}
                onClick={() => handleTestClick(test)}
                delay={index * 0.1}
              />
            );
          })}
        </motion.div>

        {/* Если тестов нет */}
        {tests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <AlertCircle className="h-12 w-12 text-[#f5e8d0]/50 mx-auto mb-4" />
            <p className="text-[#f5e8d0]/70 text-lg">
              В данный момент нет доступных тестов
            </p>
          </motion.div>
        )}
      </div>

      {/* Модальное окно с описанием теста */}
      <AnimatePresence>
        {showDescriptionModal && selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-black/80 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8 max-w-md w-full relative"
            >
              {/* Кнопка закрытия */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-[#f5e8d0]/70 hover:text-[#f5e8d0] transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Иконка и заголовок */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#a5f3b4]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayCircle className="w-8 h-8 text-[#a5f3b4]" />
                </div>
                <h3 className="text-xl font-bold text-[#f5e8d0] mb-2">
                  {selectedTest.title}
                </h3>
                <div className="w-16 h-0.5 bg-[#f5e8d0]/30 mx-auto"></div>
              </div>

              {/* Описание */}
              <div className="mb-8">
                <p className="text-[#f5e8d0]/80 text-sm leading-relaxed text-center">
                  {selectedTest.description}
                </p>
              </div>

              {/* Дополнительная информация */}
              <div className="mb-8">
                <div className="text-[#f5e8d0]/60 text-xs space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Время прохождения не ограничено</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Результаты сохраняются после завершения</span>
                  </div>
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleStartTest}
                  className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900 w-full"
                >
                  {getTestStatus(selectedTest.id) === 'completed' ? 'Повторить тест' : 'Начать тест'}
                </Button>
                <Button
                  onClick={handleCloseModal}
                  className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] w-full"
                >
                  Отмена
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard; 