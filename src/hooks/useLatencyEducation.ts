
import { useState, useEffect } from 'react';

interface UseLatencyEducationProps {
  showEducationOnFirstUse?: boolean;
  educationKey?: string;
}

export const useLatencyEducation = ({
  showEducationOnFirstUse = true,
  educationKey = 'turn_based_education_completed'
}: UseLatencyEducationProps = {}) => {
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [hasSeenEducation, setHasSeenEducation] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(educationKey);
    const hasCompleted = completed === 'true';
    
    setHasSeenEducation(hasCompleted);
    
    if (showEducationOnFirstUse && !hasCompleted) {
      // Show education after a short delay for first-time users
      const timer = setTimeout(() => {
        setShowEducationModal(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [showEducationOnFirstUse, educationKey]);

  const completeEducation = () => {
    localStorage.setItem(educationKey, 'true');
    setHasSeenEducation(true);
    setShowEducationModal(false);
  };

  const triggerEducation = () => {
    setShowEducationModal(true);
  };

  const closeEducation = () => {
    setShowEducationModal(false);
  };

  return {
    showEducationModal,
    hasSeenEducation,
    completeEducation,
    triggerEducation,
    closeEducation,
  };
};
