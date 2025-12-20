import styles from './Button.module.css';
import { type ButtonProps } from './Button.props';
import cn from 'classnames';

function Button({
  children,
  className,
  appearance = 'small',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(styles['button'], styles['accent'], className, {
        [styles['small']]: appearance === 'small',
        [styles['big']]: appearance === 'big',
        [styles['loading']]: loading,
      })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className={styles['spinner']}></span>
          <span className={styles['loading-text']}>Загрузка...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
