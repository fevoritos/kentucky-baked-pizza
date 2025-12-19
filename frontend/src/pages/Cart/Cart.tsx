import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import CartReceipt from './CartReceipt';
import Headling from '../../components/Headling/Headling';
import Button from '../../components/Button/Button';
import { useEffect } from 'react';
import { cartActions } from '../../store/cart.slice';
import { useNavigate } from 'react-router-dom';
import styles from './Cart.module.css';

export function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const backendCart = useSelector((s: RootState) => s.cart.backendCart);
  const jwt = useSelector((s: RootState) => s.user.jwt);

  useEffect(() => {
    if (jwt) {
      dispatch(cartActions.fetchCart());
    }
  }, [dispatch, jwt]);

  const items = backendCart?.items || [];

  return (
    <>
      <div>
        {items.length === 0 && (
          <div className={styles['empty']}>
            <Headling className={styles['mobileHidden']}>Корзина пуста</Headling>
            <div className={styles['emptyContent']}>
              <p className={styles['emptyText']}>Ваша корзина пока пуста</p>
              <p className={styles['emptySubtext']}>Добавьте блюда из меню, чтобы сделать заказ</p>
              <Button
                appearance="big"
                onClick={() => navigate('/')}
                className={styles['emptyButton']}
              >
                Перейти в меню
              </Button>
            </div>
          </div>
        )}
        {items.length !== 0 && <CartReceipt />}
      </div>
    </>
  );
}
