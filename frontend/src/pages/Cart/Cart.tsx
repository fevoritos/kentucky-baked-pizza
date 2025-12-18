import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import CartReceipt from './CartReceipt';
import Headling from '../../components/Headling/Headling';
import { useEffect } from 'react';
import { cartActions } from '../../store/cart.slice';

export function Cart() {
  const dispatch = useDispatch<AppDispatch>();
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
        {items.length === 0 && <Headling>Корзина пуста</Headling>}
        {items.length !== 0 && <CartReceipt />}
      </div>
    </>
  );
}
