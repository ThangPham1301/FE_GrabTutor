import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ✅ Custom hook for Ask Question functionality
 * - Handles authentication check
 * - Opens modal if authenticated
 * - Redirects to login if not authenticated
 * 
 * Usage:
 * const { handleAskQuestion } = useAskQuestion();
 * 
 * In component with modal:
 * const { handleAskQuestion } = useAskQuestion(onOpenModal);
 */
export const useAskQuestion = (onOpenModal) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAskQuestion = () => {
    console.log('=== handleAskQuestion ===');
    console.log('User:', user);

    // ✅ Nếu chưa đăng nhập → redirect login
    if (!user) {
      console.log('❌ Not logged in, redirecting to /login');
      navigate('/login');
      return;
    }

    // ✅ Nếu là STUDENT (USER) → mở modal
    if (user.role === 'USER') {
      console.log('✅ User is STUDENT, opening modal');
      if (onOpenModal) {
        onOpenModal(); // ✅ Gọi callback để mở modal
      } else {
        console.log('⚠️ No onOpenModal callback provided');
      }
      return;
    }

    // ❌ Nếu là TUTOR hoặc ADMIN → không được phép
    console.warn('⚠️ User role is not allowed:', user.role);
    alert('⚠️ Chỉ có STUDENT mới có thể đặt câu hỏi!');
    navigate('/');
  };

  return { handleAskQuestion };
};