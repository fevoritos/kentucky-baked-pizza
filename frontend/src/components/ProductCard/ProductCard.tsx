import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import type { ProductCardProps } from './ProductCard.props';
import type { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { cartActions } from '../../store/cart.slice';
import { toast } from 'react-toastify';

function ProductCard(props: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();

  const add = async (e: MouseEvent) => {
    e.preventDefault();
    try {
      await dispatch(cartActions.addToCart({ dishId: props.id, quantity: 1 })).unwrap();
      toast.success('Товар добавлен в корзину!');
    } catch {
      toast.error('Не удалось добавить товар в корзину');
    }
  };

  return (
    <Link to={`/product/${props.id}`} className={styles['link']}>
      <div className={styles['card']}>
        <div className={styles['head']} style={{ backgroundImage: `url('${props.image}')` }}>
          <div className={styles['price']}>
            {props.price}&nbsp;
            <span className={styles['currncy']}>₽</span>
          </div>
          <button className={styles['add-to-cart']} onClick={add}>
            <img src="/cart-button-icon.svg" alt="Добавить в корзину" />
          </button>
          <div className={styles['rating']}>
            {props.rating}&nbsp;
            <img src="/star-icon.svg" alt="Иконка звезды" />
          </div>
        </div>
        <div className={styles['footer']}>
          <div className={styles['title']}>{props.name}</div>
          <div className={styles['description']}>{props.description}</div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
