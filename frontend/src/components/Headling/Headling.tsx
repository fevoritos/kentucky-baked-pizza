import styles from './Headling.module.css';
import type { HeadlingProps } from './Headling.props';
import cn from 'classnames';

function Headling({ children, className, ...props }: HeadlingProps) {
  return (
    <h1 className={cn(className, styles['h1'])} {...props}>
      {children}
    </h1>
  );
}

export default Headling;
