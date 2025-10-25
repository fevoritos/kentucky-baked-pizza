import { useEffect, useState } from 'react';
import Button from '../../components/Button/Button';
import CartItem from '../../components/CartItem/CartItem';
import Headling from '../../components/Headling/Headling';
import { cartActions } from '../../store/cart.slice';
import styles from './Cart.module.css';
import type { IProduct } from '../../interfaces/product.interface';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PREFIX } from '../../helpers/API';
import type { CartReceiptProps } from './CartReceipt.props';

const DELIVERY_FEE = 169;

function CartReceipt({ items }: CartReceiptProps) {
  const [cartProducts, setCartProducts] = useState<IProduct[]>([]);
  const jwt = useSelector((s: RootState) => s.user.jwt);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const count = items.reduce((acc, i) => (acc += i.count), 0);
  const total = items
    .map((i) => {
      const product = cartProducts.find((p) => p.id === i.id);
      if (!product) {
        return 0;
      }
      return i.count * product.price;
    })
    .reduce((acc, i) => (acc += i), 0);

  const getItem = async (id: number) => {
    const { data } = await axios.get<IProduct>(`${PREFIX}/products/${id}`);
    return data;
  };

  const loadAllItems = async () => {
    const res = await Promise.all(items.map((i) => getItem(i.id)));
    setCartProducts(res);
  };

  const checkout = async () => {
    await axios.post(
      `${PREFIX}/order`,
      {
        products: items,
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    );
    dispatch(cartActions.clean());
    navigate('/success');
  };

  useEffect(() => {
    loadAllItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <>
      <Headling className={styles['headling']}>Корзина</Headling>
      {items.map((i) => {
        const product = cartProducts.find((p) => p.id === i.id);
        if (!product) {
          return;
        }
        return <CartItem count={i.count} {...product} key={product.id} />;
      })}
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
        <Button appearance="big" onClick={checkout}>
          Оформить
        </Button>
      </div>
    </>
  );
}

export default CartReceipt;
