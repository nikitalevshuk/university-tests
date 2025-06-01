import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const handleLogout = () => {
    // Очищаем данные пользователя
    localStorage.removeItem('registrationData');
    localStorage.removeItem('testProgress');
    localStorage.removeItem('testResults');
    
    // Вызываем callback для выхода
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full bg-black/20 backdrop-blur-sm border-b border-[#f5e8d0]/30"
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
                {user ? `${user.lastName} ${user.firstName}` : 'Пользователь'}
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
  );
};

export default Header; 