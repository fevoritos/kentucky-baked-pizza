import Button from '../../components/Button/Button';
import CartItem from '../../components/CartItem/CartItem';
import Headling from '../../components/Headling/Headling';
import { cartActions } from '../../store/cart.slice';
import styles from './Cart.module.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../../store/orders.slice';

const DELIVERY_FEE = 169;

function CartReceipt() {
  const backendCart = useSelector((s: RootState) => s.cart.backendCart);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const items = backendCart?.items || [];
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.quantity * i.dish.price, 0);

  const onCheckout = async () => {
    try {
      await dispatch(checkout()).unwrap();
      dispatch(cartActions.reset());
      navigate('/success');
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  return (
    <>
      <Headling className={styles['headling']}>Корзина</Headling>
      {items.map((i) => (
        <CartItem
          key={i.dishId}
          id={i.dishId}
          count={i.quantity}
          name={i.dish.name}
          price={i.dish.price}
          image={i.dish.image}
        />
      ))}
      <div className={styles['line']}>
        <div className={styles['text']}>Итог</div>
        <div className={styles['price']}>
          {total}&nbsp;<span>₽</span>
        </div>
      </div>
      <hr className={styles['hr']} />
      <div className={styles['line']}>
        <div className={styles['text']}>Доставка</div>
        <div className={styles['price']}>
          {DELIVERY_FEE}&nbsp;<span>₽</span>
        </div>
      </div>
      <hr className={styles['hr']} />
      <div className={styles['line']}>
        <div className={styles['text']}>
          Итог &nbsp;<span>({count})</span>
        </div>
        <div className={styles['price']}>
          {total + DELIVERY_FEE}&nbsp;<span>₽</span>
        </div>
      </div>
      <div className={styles['checkout']}>
        <Button appearance="big" onClick={onCheckout}>
          Оформить
        </Button>
      </div>
    </>
  );
}

export default CartReceipt;
