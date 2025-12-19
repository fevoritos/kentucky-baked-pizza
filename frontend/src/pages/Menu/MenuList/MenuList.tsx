import ProductCard from '../../../components/ProductCard/ProductCard';
import { ProductCardSkeleton } from '../../../components/ProductCard/ProductCardSkeleton';
import type { MenuListProps } from './MenuList.props';
import styles from './MenuList.module.css';

export function MenuList({ products, isLoading }: MenuListProps) {
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          description={p.ingredients.join(', ')}
          rating={p.rating}
          price={p.price}
          image={p.image}
        />
      ))}
    </div>
  );
}
