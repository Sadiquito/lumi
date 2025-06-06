
import React from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';

const UserGreeting: React.FC = () => {
  const { user } = useAuth();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const greeting = `${getTimeOfDay()}, ${getFirstName()}.`;

  return (
    <div className="text-center mb-8">
      <p className="text-white/90 text-lg font-sans">
        {greeting}
      </p>
    </div>
  );
};

export default UserGreeting;
