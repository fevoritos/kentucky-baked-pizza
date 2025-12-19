import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Headling from '../../components/Headling/Headling';
import styles from './Error.module.css';

export function Error() {
  const navigate = useNavigate();

  return (
    <div className={styles['error']}>
      <div className={styles['icon']}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="60" cy="60" r="60" fill="#FFE5E5" />
          <path
            d="M60 30C43.4315 30 30 43.4315 30 60C30 76.5685 43.4315 90 60 90C76.5685 90 90 76.5685 90 60C90 43.4315 76.5685 30 60 30ZM65 75H55V65H65V75ZM65 55H55V35H65V55Z"
            fill="#FF4444"
          />
        </svg>
      </div>
      <Headling className={styles['title']}>Упс! Что-то пошло не так</Headling>
      <p className={styles['description']}>
        К сожалению, произошла ошибка. Попробуйте вернуться на главную страницу и повторить попытку.
      </p>
      <Button appearance="big" onClick={() => navigate('/')} className={styles['button']}>
        Вернуться в меню
      </Button>
    </div>
  );
}
