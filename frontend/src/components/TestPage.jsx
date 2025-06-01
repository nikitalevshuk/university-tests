import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, X, CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { authService, testsService, apiUtils } from '../services/api';

const TestPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Загрузка данных теста
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        
        // Проверяем авторизацию
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Получаем информацию о тесте из БД
        const testInfo = await testsService.getTestById(testId);
        
        // Загружаем данные вопросов из JSON файла
        const testData = await testsService.loadTestData(testInfo.filename);
        
        if (!testData) {
          throw new Error('Не удалось загрузить данные теста');
        }
        
        // Преобразуем данные в формат для компонента
        const formattedTestData = {
          id: testId,
          title: testData.title,
          description: testData.description,
          questions: testData.questions
        };
        
        setTestData(formattedTestData);
        
      } catch (error) {
        console.error('Ошибка при загрузке данных теста:', error);
        
        if (apiUtils.isAuthError(error)) {
          navigate('/');
        } else {
          setError(apiUtils.formatErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    loadTestData();
  }, [testId, navigate]);

  // Обработка ответа на вопрос
  const handleAnswer = async (answer) => {
    if (!testData || !testData.questions) return;
    
    const newAnswer = {
      questionIndex: currentQuestion,
      question: testData.questions[currentQuestion].question,
      answer: answer,
      timestamp: new Date().toISOString()
    };

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = newAnswer;
    setAnswers(newAnswers);

    // Переход к следующему вопросу или завершение теста
    if (currentQuestion < testData.questions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
    } else {
      // Тест завершен
      try {
        setIsCompleted(true);
        
        // Подготавливаем данные для отправки на сервер
        // Извлекаем только строковые ответы из объектов ответов
        const finalAnswers = newAnswers.map(answerObj => answerObj.answer);
        
        // Создаем результат теста
        const testResult = {
          score: finalAnswers.length, // Простой подсчет количества отвеченных вопросов
          totalQuestions: testData.questions.length,
          completedAt: new Date().toISOString(),
          testTitle: testData.title
        };
        
        // Отправляем результаты на сервер в правильном формате
        const completionData = {
          answers: finalAnswers,  // Массив строк ["да", "нет", "не знаю", ...]
          result: testResult      // Объект с результатами теста
        };
        
        await testsService.completeTest(testId, completionData);
        
      } catch (error) {
        console.error('Ошибка при завершении теста:', error);
        // Показываем ошибку, но все равно отмечаем тест как завершенный
        setError('Ошибка при сохранении результатов, но тест завершен');
      }
    }
  };

  // Возврат к предыдущему вопросу
  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Переход к результатам
  const handleViewResults = () => {
    navigate(`/results/${testId}`);
  };

  // Возврат на главную страницу
  const handleGoHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#f5e8d0] animate-spin mx-auto mb-4" />
          <div className="text-[#f5e8d0] text-lg">Загрузка теста...</div>
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
            onClick={handleGoHome}
            className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900"
          >
            Вернуться на главную
          </Button>
        </div>
      </div>
    );
  }

  if (!testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-lg mb-4">Тест не найден или содержит ошибки</div>
          <Button
            onClick={handleGoHome}
            className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900"
          >
            Вернуться на главную
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

      {/* Экран завершения теста */}
      <AnimatePresence>
        {isCompleted && (
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
              className="bg-black/80 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8 max-w-md w-full text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
                className="mb-6"
              >
                <CheckCircle className="w-16 h-16 text-[#a5f3b4] mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-[#f5e8d0] mb-4">
                Тест завершен!
              </h2>
              
              <p className="text-[#f5e8d0]/70 mb-8">
                Спасибо за прохождение теста. Ваши ответы сохранены.
              </p>
              
              <div className="flex flex-col gap-4">
                <Button
                  onClick={handleViewResults}
                  className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900 w-full"
                >
                  Посмотреть результаты
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] w-full"
                >
                  Вернуться на главную
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной контент теста */}
      {!isCompleted && testData && testData.questions && (
        <div className="relative z-10 p-4 py-8">
          {/* Заголовок и прогресс */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-[#f5e8d0] mb-4">
              {testData.title}
            </h1>
            <div className="text-[#f5e8d0]/70 text-lg mb-6">
              Вопрос {currentQuestion + 1} из {testData.questions.length}
            </div>
            
            {/* Прогресс бар */}
            <div className="max-w-2xl mx-auto mb-4">
              <div className="w-full bg-[#f5e8d0]/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / testData.questions.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-[#a5f3b4] h-2 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Кнопка возврата */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="absolute top-8 left-8"
          >
            <Button
              onClick={handleGoHome}
              className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              На главную
            </Button>
          </motion.div>

          {/* Карточка с вопросом */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8">
              {/* Текст вопроса */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#f5e8d0] mb-4 leading-relaxed">
                  {testData.questions[currentQuestion].question}
                </h2>
              </div>

              {/* Варианты ответов */}
              <div className="space-y-4 mb-8">
                {['да', 'нет', 'не знаю'].map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 text-left bg-black/30 border border-[#f5e8d0]/40 rounded-xl text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] transition-all duration-200 flex items-center gap-3"
                  >
                    <Circle className="w-5 h-5 text-[#f5e8d0]/60" />
                    <span className="text-lg capitalize">{option}</span>
                  </motion.button>
                ))}
              </div>

              {/* Навигация */}
              <div className="flex justify-between items-center">
                <Button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Назад
                </Button>

                <div className="text-[#f5e8d0]/60 text-sm">
                  {answers.length > 0 && (
                    <span>Отвечено: {answers.filter(a => a).length} из {testData.questions.length}</span>
                  )}
                </div>

                <div className="w-20" /> {/* Spacer для симметрии */}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestPage; 