import styles from './CartItem.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { cartActions } from '../../store/cart.slice';
import type { CartItemProps } from './CartItem.props';

function CartItem(props: CartItemProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isUpdating = useSelector((s: RootState) => s.cart.updatingItems[props.id] || false);

  const increase = () => {
    dispatch(cartActions.updateCartQuantity({ dishId: props.id, quantity: props.count + 1 }));
  };

  const decrease = () => {
    if (props.count == 1) return;
    dispatch(cartActions.updateCartQuantity({ dishId: props.id, quantity: props.count - 1 }));
  };

  const remove = () => {
    dispatch(cartActions.removeFromCart(props.id));
  };

  const handleItemClick = () => {
    if (!isUpdating) {
      navigate(`/product/${props.id}`);
    }
  };

  return (
    <div className={styles['item']}>
      <div
        className={styles['clickable-area']}
        onClick={handleItemClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleItemClick();
          }
        }}
      >
        <div className={styles['image']} style={{ backgroundImage: `url('${props.image}')` }}></div>
        <div className={styles['description']}>
          <div className={styles['name']}>{props.name}</div>
          <div className={styles['price']}>{props.price}&nbsp;₽</div>
        </div>
      </div>
      <div className={styles['actions']}>
        <button
          className={styles['minus']}
          onClick={decrease}
          disabled={isUpdating || props.count === 1}
        >
          <img src="/minus-icon.svg" alt="Удалить из корзины" />
        </button>
        <div className={styles['number']}>{props.count}</div>
        <button className={styles['plus']} onClick={increase} disabled={isUpdating}>
          <img src="/plus-icon.svg" alt="Добавить в корзину" />
        </button>
        <button className={styles['remove']} onClick={remove} disabled={isUpdating}>
          <img src="/delete-icon.svg" alt="Удалить все" />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
