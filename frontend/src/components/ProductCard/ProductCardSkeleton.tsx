import styles from './ProductCardSkeleton.module.css';

export function ProductCardSkeleton() {
  return (
    <div className={styles['card']}>
      <div className={styles['head']}>
        <div className={styles['price']}></div>
        <div className={styles['add-to-cart']}></div>
        <div className={styles['rating']}></div>
      </div>
      <div className={styles['footer']}>
        <div className={styles['title']}></div>
        <div className={styles['description']}></div>
        <div className={styles['description']}></div>
      </div>
    </div>
  );
}
