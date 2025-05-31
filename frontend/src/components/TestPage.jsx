import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, X, CheckCircle, Circle } from 'lucide-react';

const TestPage = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showDescriptionModal, setShowDescriptionModal] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных теста
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const response = await fetch('/questions.json');
        const data = await response.json();
        setTestData(data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных теста:', error);
        setError('Не удалось загрузить данные теста.');
        setLoading(false);
      }
    };

    loadTestData();
  }, []);

  // Обработка ответа на вопрос
  const handleAnswer = (answer) => {
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
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Тест завершен
      setIsCompleted(true);
      // Сохраняем ответы в localStorage
      localStorage.setItem('testAnswers', JSON.stringify(newAnswers));
      localStorage.setItem('testCompletedAt', new Date().toISOString());
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
    navigate('/results');
  };

  // Возврат на главную страницу
  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-[#f5e8d0] text-lg">Загрузка теста...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
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

      {/* Модальное окно с описанием теста */}
      <AnimatePresence>
        {showDescriptionModal && testData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDescriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-black/80 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#f5e8d0]">Описание теста</h2>
                <button
                  onClick={() => setShowDescriptionModal(false)}
                  className="text-[#f5e8d0]/70 hover:text-[#f5e8d0] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="w-full h-0.5 bg-[#f5e8d0]/30 mb-6"></div>
              
              <div className="text-[#f5e8d0]/90 leading-relaxed mb-8 whitespace-pre-line">
                {testData.description}
              </div>
              
              <div className="flex justify-center">
                <Button
                  onClick={() => setShowDescriptionModal(false)}
                  className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900 px-8 py-3 text-lg"
                >
                  Готов пройти тест
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {!showDescriptionModal && !isCompleted && testData && (
        <div className="relative z-10 p-4 py-8">
          {/* Заголовок и прогресс */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-[#f5e8d0] mb-4">
              Психологическое тестирование
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

          {/* Вопрос */}
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8 mb-8">
              <h2 className="text-xl font-medium text-[#f5e8d0] leading-relaxed text-center">
                {testData.questions[currentQuestion].question}
              </h2>
            </div>

            {/* Варианты ответов */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {['Да', 'Нет', 'Не знаю что ответить'].map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
                  onClick={() => handleAnswer(option)}
                  className="bg-black/20 backdrop-blur-sm border border-[#f5e8d0]/30 rounded-xl p-6 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] hover:scale-105 transition-all duration-200 text-lg font-medium"
                >
                  {option}
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
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>

              <div className="text-[#f5e8d0]/50 text-sm">
                {answers.filter(a => a).length} из {testData.questions.length} отвечено
              </div>

              <Button
                onClick={handleGoHome}
                className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0]"
              >
                Выйти
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TestPage; 