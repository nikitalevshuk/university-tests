import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, BarChart3, CheckCircle, Calendar, Clock, User, Loader2, AlertCircle, FileText, X } from 'lucide-react';
import { authService, testsService, apiUtils } from '../services/api';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка результатов
  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        
        // Проверяем авторизацию
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Загружаем результаты теста
        const testResults = await testsService.getTestResults(testId);
        setResults(testResults);
        
      } catch (error) {
        console.error('Ошибка при загрузке результатов:', error);
        
        if (apiUtils.isAuthError(error)) {
          navigate('/');
        } else {
          setError(apiUtils.formatErrorMessage(error));
        }
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadResults();
    } else {
      setError('ID теста не указан');
      setLoading(false);
    }
  }, [testId, navigate]);

  // Возврат на главную страницу
  const handleGoHome = () => {
    navigate('/dashboard');
  };

  // Повторное прохождение теста (если это возможно)
  const handleRetakeTest = () => {
    navigate(`/test/${testId}`);
  };

  // Анализ результатов
  const analyzeResults = () => {
    if (!results?.result?.answers) return null;

    const answers = results.result.answers;
    const totalQuestions = answers.length;
    
    // Подсчет ответов - теперь answers это массив строк
    const yesCount = answers.filter(answer => answer && answer.toLowerCase() === 'да').length;
    const noCount = answers.filter(answer => answer && answer.toLowerCase() === 'нет').length;
    const unsureCount = answers.filter(answer => answer && answer.toLowerCase() === 'не знаю').length;

    // Процентное соотношение
    const yesPercentage = totalQuestions > 0 ? Math.round((yesCount / totalQuestions) * 100) : 0;
    const noPercentage = totalQuestions > 0 ? Math.round((noCount / totalQuestions) * 100) : 0;
    const unsurePercentage = totalQuestions > 0 ? Math.round((unsureCount / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      yesCount,
      noCount,
      unsureCount,
      yesPercentage,
      noPercentage,
      unsurePercentage
    };
  };

  const analysis = analyzeResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-[#f5e8d0] animate-spin mx-auto mb-4" />
          <div className="text-[#f5e8d0] text-lg">Загрузка результатов...</div>
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

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <FileText className="h-12 w-12 text-[#f5e8d0]/50 mx-auto mb-4" />
          <div className="text-[#f5e8d0]/70 text-lg mb-4">Результаты теста не найдены</div>
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
                Результаты тестирования
              </h1>
            </div>

            {/* Информация о пользователе */}
            <div className="flex items-center space-x-2 text-[#f5e8d0]/80">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {user ? `${user.last_name} ${user.first_name}` : 'Пользователь'}
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Основной контент */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Кнопка назад */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Button
            onClick={handleGoHome}
            className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
        </motion.div>

        {/* Заголовок результатов */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-[#a5f3b4]/20 rounded-full mr-4">
              <CheckCircle className="w-8 h-8 text-[#a5f3b4]" />
            </div>
            <h2 className="text-3xl font-bold text-[#f5e8d0]">
              Тест завершен успешно!
            </h2>
          </div>
          
          <p className="text-[#f5e8d0]/70 text-lg">
            {results.test_title}
          </p>
          
          {/* Информация о завершении */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-[#f5e8d0]/60">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Завершен: {new Date(results.completed_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Статистика результатов */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {/* Общее количество вопросов */}
            <Card className="bg-black/20 backdrop-blur-sm border-[#f5e8d0]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-[#f5e8d0] text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Всего вопросов
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#f5e8d0] mb-1">
                  {analysis.totalQuestions}
                </div>
              </CardContent>
            </Card>

            {/* Положительные ответы */}
            <Card className="bg-black/20 backdrop-blur-sm border-green-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-400 text-lg flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Ответов "Да"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {analysis.yesCount}
                </div>
                <div className="text-sm text-green-400/70">
                  {analysis.yesPercentage}% от общего
                </div>
              </CardContent>
            </Card>

            {/* Отрицательные ответы */}
            <Card className="bg-black/20 backdrop-blur-sm border-red-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-400 text-lg flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  Ответов "Нет"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-400 mb-1">
                  {analysis.noCount}
                </div>
                <div className="text-sm text-red-400/70">
                  {analysis.noPercentage}% от общего
                </div>
              </CardContent>
            </Card>

            {/* Неопределенные ответы */}
            <Card className="bg-black/20 backdrop-blur-sm border-yellow-400/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-yellow-400 text-lg flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  "Не знаю"
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  {analysis.unsureCount}
                </div>
                <div className="text-sm text-yellow-400/70">
                  {analysis.unsurePercentage}% от общего
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Визуализация результатов */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-black/20 backdrop-blur-sm border-[#f5e8d0]/30">
              <CardHeader>
                <CardTitle className="text-[#f5e8d0] text-xl flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  Распределение ответов
                </CardTitle>
                <CardDescription className="text-[#f5e8d0]/60">
                  Визуальное представление ваших ответов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Прогресс-бары для каждого типа ответов */}
                  <div className="space-y-4">
                    {/* Ответы "Да" */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-400 font-medium">Ответы "Да"</span>
                        <span className="text-green-400 text-sm">{analysis.yesCount} ({analysis.yesPercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.yesPercentage}%` }}
                          transition={{ duration: 1, delay: 0.8 }}
                          className="bg-green-400 h-3 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Ответы "Нет" */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-red-400 font-medium">Ответы "Нет"</span>
                        <span className="text-red-400 text-sm">{analysis.noCount} ({analysis.noPercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.noPercentage}%` }}
                          transition={{ duration: 1, delay: 1 }}
                          className="bg-red-400 h-3 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Ответы "Не знаю" */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-yellow-400 font-medium">Ответы "Не знаю"</span>
                        <span className="text-yellow-400 text-sm">{analysis.unsureCount} ({analysis.unsurePercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.unsurePercentage}%` }}
                          transition={{ duration: 1, delay: 1.2 }}
                          className="bg-yellow-400 h-3 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Действия */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={handleGoHome}
            className="bg-[#a5f3b4] hover:bg-[#7be398] text-gray-900 px-8 py-3"
          >
            Вернуться к тестам
          </Button>
          
          {/* Возможность пройти тест заново (если это предусмотрено бэкендом) */}
          {/* <Button
            onClick={handleRetakeTest}
            className="bg-black/30 border-[#f5e8d0]/40 text-[#f5e8d0] hover:bg-[#f5e8d0]/10 hover:border-[#f5e8d0] px-8 py-3"
          >
            Пройти тест заново
          </Button> */}
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage; 