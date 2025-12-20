import Button from '../../components/Button/Button';
import CartItem from '../../components/CartItem/CartItem';
import Headling from '../../components/Headling/Headling';
import Input from '../../components/Input/Input';
import { cartActions } from '../../store/cart.slice';
import styles from './Cart.module.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../../store/orders.slice';
import { useState } from 'react';
import cn from 'classnames';

const DELIVERY_FEE = 169;

function CartReceipt() {
  const backendCart = useSelector((s: RootState) => s.cart.backendCart);
  const checkoutLoading = useSelector((s: RootState) => s.orders.loading);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  const items = backendCart?.items || [];
  const count = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.quantity * i.dish.price, 0);

  const onCheckout = async () => {
    // Валидация полей
    const isAddressValid = address.trim().length > 0;
    const isPhoneValid = phone.trim().length > 0;

    setAddressError(!isAddressValid);
    setPhoneError(!isPhoneValid);

    if (!isAddressValid || !isPhoneValid) {
      return;
    }

    try {
      await dispatch(checkout({ address: address.trim(), phone: phone.trim() })).unwrap();
      dispatch(cartActions.reset());
      navigate('/success');
    } catch (e) {
      console.error('Checkout failed', e);
    }
  };

  return (
    <>
      <Headling className={cn(styles['headling'], styles['mobileHidden'])}>Корзина</Headling>

      <div className={styles['content-wrapper']}>
        <div className={styles['left-column']}>
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
          <div className={styles['receipt']}>
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
          </div>
        </div>
        <div className={styles['right-column']}>
          <div className={styles['form']}>
            <div className={styles['form-group']}>
              <label className={styles['label']}>Адрес доставки *</label>
              <Input
                name="adres"
                className={styles['cart-input']}
                type="text"
                placeholder="Введите адрес доставки"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (addressError) setAddressError(false);
                }}
                isValid={!addressError}
              />
              {addressError && (
                <span className={styles['error']}>Поле обязательно для заполнения</span>
              )}
            </div>
            <div className={styles['form-group']}>
              <label className={styles['label']}>Номер телефона *</label>
              <Input
                name="tel"
                type="tel"
                className={styles['cart-input']}
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError(false);
                }}
                isValid={!phoneError}
              />
              {phoneError && (
                <span className={styles['error']}>Поле обязательно для заполнения</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles['checkout']}>
        <Button appearance="big" onClick={onCheckout} loading={checkoutLoading}>
          Оформить
        </Button>
      </div>
    </>
  );
}

export default CartReceipt;
