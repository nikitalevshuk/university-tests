import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, PlayCircle, Calendar } from 'lucide-react';
import { Button } from './ui/button';

const TestCard = ({ test, status, completedDate, onClick, delay = 0 }) => {
  // Определяем стили и содержимое на основе статуса
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          iconColor: 'text-[#a5f3b4]',
          bgColor: 'bg-[#a5f3b4]/10',
          borderColor: 'border-[#a5f3b4]/30',
          statusText: 'Пройден',
          buttonText: 'Тест пройден',
          buttonStyle: 'bg-gray-600/20 text-gray-400 border-gray-400/30 cursor-not-allowed',
          isDisabled: true
        };
      case 'not_started':
      default:
        return {
          icon: PlayCircle,
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/30',
          statusText: 'Не пройден',
          buttonText: 'Начать тест',
          buttonStyle: 'bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 border-blue-400/30',
          isDisabled: false
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleClick = () => {
    // Если тест пройден, показываем результаты вместо начала теста
    if (status === 'completed') {
      // Вызываем onClick только для просмотра результатов
      onClick();
    } else {
      // Для непройденных тестов показываем описание
      onClick();
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    
    // Если тест пройден, не делаем ничего (кнопка неактивна)
    if (status === 'completed') {
      return;
    }
    
    // Для непройденных тестов вызываем onClick
    onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: status === 'completed' ? 1 : 1.02 }}
      className={`
        bg-black/20 backdrop-blur-sm rounded-xl border ${statusConfig.borderColor}
        ${status === 'completed' ? '' : 'hover:bg-black/30 cursor-pointer'} 
        transition-all duration-300 shadow-lg 
        ${status === 'completed' ? '' : 'hover:shadow-xl'}
        relative overflow-hidden
      `}
      onClick={handleClick}
    >
      {/* Фоновый градиент */}
      <div className={`absolute inset-0 ${statusConfig.bgColor} opacity-50`} />

      <div className="relative p-6">
        {/* Заголовок и иконка статуса */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#f5e8d0] mb-2 leading-tight">
              {test.title}
            </h3>
          </div>
          <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
          </div>
        </div>

        {/* Описание теста */}
        {test.description && (
          <p className="text-[#f5e8d0]/70 text-sm mb-4 line-clamp-2">
            {test.description}
          </p>
        )}

        {/* Статус и дополнительная информация */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#f5e8d0]/60">Статус:</span>
            <span className={`text-xs font-medium ${statusConfig.iconColor}`}>
              {statusConfig.statusText}
            </span>
          </div>

          {/* Дата завершения для пройденных тестов */}
          {status === 'completed' && completedDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#f5e8d0]/60">Завершен:</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-[#a5f3b4]" />
                <span className="text-xs font-medium text-[#a5f3b4]">
                  {completedDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Кнопка действия */}
        <Button
          disabled={statusConfig.isDisabled}
          className={`
            w-full text-sm font-medium transition-all duration-200
            ${statusConfig.buttonStyle}
            ${statusConfig.isDisabled ? '' : 'hover:scale-105 active:scale-95'}
          `}
          onClick={handleButtonClick}
        >
          {statusConfig.buttonText}
        </Button>

        {/* Для пройденных тестов добавляем текст о просмотре результатов */}
        {status === 'completed' && (
          <p className="text-xs text-[#f5e8d0]/50 text-center mt-2">
            Нажмите на карточку для просмотра результатов
          </p>
        )}
      </div>

      {/* Дополнительные визуальные эффекты */}
      {status !== 'completed' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 0.1 }}
        />
      )}
    </motion.div>
  );
};

export default TestCard; 