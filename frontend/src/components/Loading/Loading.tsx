import styles from './Loading.module.css';

interface LoadingProps {
  text?: string;
  className?: string;
}

export function Loading({ text = 'Загрузка...', className }: LoadingProps) {
  return (
    <div className={`${styles['loading']} ${className || ''}`}>
      <div className={styles['spinner']}></div>
      <p className={styles['loadingText']}>{text}</p>
    </div>
  );
}
