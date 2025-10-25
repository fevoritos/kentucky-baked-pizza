import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import CartReceipt from './CartReceipt';
import Headling from '../../components/Headling/Headling';

export function Cart() {
  const items = useSelector((s: RootState) => s.cart.items);
  return (
    <>
      <div>
        {items.length === 0 && <Headling>Корзина пуста</Headling>}
        {items.length !== 0 && <CartReceipt items={items}></CartReceipt>}
      </div>
    </>
  );
}
