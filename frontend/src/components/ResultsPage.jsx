import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, Home } from 'lucide-react';

const ResultsPage = () => {
  const navigate = useNavigate();
  const [testData, setTestData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных и подсчет результатов
  useEffect(() => {
    const loadDataAndCalculateResults = async () => {
      try {
        // Загружаем данные теста
        const response = await fetch('/questions.json');
        const data = await response.json();
        setTestData(data);

        // Получаем ответы пользователя из localStorage
        const savedAnswers = localStorage.getItem('testAnswers');
        if (!savedAnswers) {
          setError('Ответы на тест не найдены. Пройдите тест сначала.');
          setLoading(false);
          return;
        }

        const answers = JSON.parse(savedAnswers);
        setUserAnswers(answers);

        // Подсчитываем результаты по каждой шкале
        const calculatedResults = {};
        
        Object.entries(data.results).forEach(([scaleName, scaleData]) => {
          let score = 0;
          
          // Подсчет баллов за положительные ответы
          scaleData.positive.forEach(questionNumber => {
            const answerIndex = questionNumber - 1; // Приводим к 0-индексации
            if (answers[answerIndex] && answers[answerIndex].answer.toLowerCase() === 'да') {
              score++;
            }
          });
          
          // Подсчет баллов за отрицательные ответы
          scaleData.negative.forEach(questionNumber => {
            const answerIndex = questionNumber - 1; // Приводим к 0-индексации
            if (answers[answerIndex] && answers[answerIndex].answer.toLowerCase() === 'нет') {
              score++;
            }
          });
          
          // Определение уровня
          let level;
          let levelColor;
          let levelIcon;
          
          if (score > 12) {
            level = 'высокий';
            levelColor = 'text-red-400 bg-red-400/10 border-red-400/30';
            levelIcon = TrendingUp;
          } else if (score >= 6) {
            level = 'средний';
            levelColor = 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            levelIcon = Minus;
          } else {
            level = 'низкий';
            levelColor = 'text-green-400 bg-green-400/10 border-green-400/30';
            levelIcon = TrendingDown;
          }
          
          calculatedResults[scaleName] = {
            score,
            level,
            levelColor,
            levelIcon,
            description: scaleData.description,
            maxPossibleScore: scaleData.positive.length + scaleData.negative.length
          };
        });
        
        setResults(calculatedResults);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных или подсчете результатов:', error);
        setError('Произошла ошибка при обработке результатов теста.');
        setLoading(false);
      }
    };

    loadDataAndCalculateResults();
  }, []);

  // Функция для форматирования названия шкалы
  const formatScaleName = (scaleName) => {
    return scaleName.charAt(0).toUpperCase() + scaleName.slice(1).replace('_', ' ');
  };

  // Возврат на главную страницу
  const handleGoHome = () => {
    navigate('/');
  };

  // Повторное прохождение теста
  const handleRetakeTest = () => {
    localStorage.removeItem('testAnswers');
    localStorage.removeItem('testResults');
    navigate('/test');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-[#f5e8d0] text-lg">Обработка результатов...</div>
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

      <div className="relative z-10 p-4 py-8">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-[#a5f3b4] mr-3" />
            <h1 className="text-3xl font-bold text-[#f5e8d0]">
              Результаты тестирования
            </h1>
          </div>
          <p className="text-[#f5e8d0]/70 text-lg max-w-2xl mx-auto">
            Анализ уровня адаптации к новой социокультурной среде
          </p>
          <div className="w-24 h-0.5 bg-[#f5e8d0]/30 mx-auto mt-4"></div>
        </motion.div>

        {/* Навигация */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <div className="flex gap-4">
            <Button
              onClick={handleGoHome}
              className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0]"
            >
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Button>
            <Button
              onClick={handleRetakeTest}
              className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900"
            >
              Пройти тест заново
            </Button>
          </div>
        </motion.div>

        {/* Результаты по шкалам */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(results).map(([scaleName, result], index) => {
              const IconComponent = result.levelIcon;
              
              return (
                <motion.div
                  key={scaleName}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.3 + index * 0.1, 
                    duration: 0.5,
                    ease: "easeOut"
                  }}
                  className="bg-black/20 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-6 hover:scale-105 transition-transform duration-200"
                >
                  {/* Заголовок шкалы */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-[#f5e8d0] capitalize">
                      {formatScaleName(scaleName)}
                    </h3>
                    <IconComponent className="w-6 h-6 text-[#f5e8d0]/70" />
                  </div>

                  {/* Уровень и баллы */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${result.levelColor} mb-2`}>
                      <IconComponent className="w-4 h-4 mr-1" />
                      {result.level} уровень
                    </div>
                    <div className="text-[#f5e8d0]/70 text-sm">
                      Баллы: {result.score} из {result.maxPossibleScore}
                    </div>
                  </div>

                  {/* Прогресс бар */}
                  <div className="mb-4">
                    <div className="w-full bg-[#f5e8d0]/20 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.score / result.maxPossibleScore) * 100}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                        className={`h-2 rounded-full ${
                          result.level === 'высокий' ? 'bg-red-400' :
                          result.level === 'средний' ? 'bg-blue-400' : 'bg-green-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Описание */}
                  <div className="text-[#f5e8d0]/80 text-sm leading-relaxed">
                    {result.description}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Общая информация */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-4xl mx-auto mt-12 bg-black/20 backdrop-blur-sm rounded-2xl border border-[#f5e8d0]/30 shadow-2xl p-8"
        >
          <h3 className="text-xl font-semibold text-[#f5e8d0] mb-4 text-center">
            Интерпретация результатов
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-green-400/10 border border-green-400/30">
              <TrendingDown className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-green-400 font-medium mb-1">Низкий уровень</div>
              <div className="text-[#f5e8d0]/70 text-sm">Менее 6 баллов</div>
            </div>
            <div className="p-4 rounded-xl bg-blue-400/10 border border-blue-400/30">
              <Minus className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-blue-400 font-medium mb-1">Средний уровень</div>
              <div className="text-[#f5e8d0]/70 text-sm">6-12 баллов</div>
            </div>
            <div className="p-4 rounded-xl bg-red-400/10 border border-red-400/30">
              <TrendingUp className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-red-400 font-medium mb-1">Высокий уровень</div>
              <div className="text-[#f5e8d0]/70 text-sm">Более 12 баллов</div>
            </div>
          </div>
          <div className="mt-6 text-[#f5e8d0]/70 text-sm text-center leading-relaxed">
            Результаты теста отражают ваш текущий уровень адаптации к новой социокультурной среде. 
            Высокие показатели по некоторым шкалам могут указывать на области, требующие внимания и поддержки.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage; 