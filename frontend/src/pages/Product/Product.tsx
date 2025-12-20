import { Await, useLoaderData } from 'react-router-dom';
import type { IProduct } from '../../interfaces/product.interface';
import { Suspense, useEffect, useState } from 'react';
import Headling from '../../components/Headling/Headling';
import Button from '../../components/Button/Button';
import styles from './Product.module.css';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { cartActions } from '../../store/cart.slice';
import { fetchOrders } from '../../store/orders.slice';
import { fetchMyRating, submitRating } from '../../store/feedback.slice';
import cn from 'classnames';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PREFIX } from '../../helpers/API';

export function Product() {
  const data = useLoaderData() as { data: IProduct };
  const dispatch = useDispatch<AppDispatch>();
  const { items: orders } = useSelector((s: RootState) => s.orders);
  const userRatings = useSelector((s: RootState) => s.feedback.ratings);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <>
      <Suspense fallback={'Загружаю...'}>
        <Await resolve={data.data}>
          {(product: IProduct) => {
            const hasOrdered = orders.some((order) =>
              order.items.some((item) => item.dishId === product.id),
            );
            const userRating = userRatings[product.id];

            return (
              <ProductContent
                product={product}
                hasOrdered={hasOrdered}
                userRating={userRating}
                dispatch={dispatch}
              />
            );
          }}
        </Await>
      </Suspense>
    </>
  );
}

function ProductContent({
  product: initialProduct,
  hasOrdered,
  userRating,
  dispatch,
}: {
  product: IProduct;
  hasOrdered: boolean;
  userRating: number | undefined;
  dispatch: AppDispatch;
}) {
  const [product, setProduct] = useState<IProduct>(initialProduct);
  const cartLoading = useSelector((s: RootState) => s.cart.loading);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    if (userRating === undefined && hasOrdered) {
      dispatch(fetchMyRating(product.id));
    }
  }, [dispatch, product.id, userRating, hasOrdered]);

  const handleRatingWithUpdate = async (dishId: number, rating: number) => {
    try {
      await dispatch(submitRating({ dishId, rating })).unwrap();
      const { data } = await axios.get<IProduct>(`${PREFIX}/dishes/${dishId}`);
      setProduct((prev) => ({ ...prev, rating: data.rating }));
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  return (
    <>
      <div className={styles['head']}>
        <button className={styles['back_button']} onClick={() => window.history.back()}>
          <img src="/back.svg" alt="Вернуться в меню" />
        </button>
        <Headling className={styles['headling']}>{product.name}</Headling>
      </div>
      <div className={styles['wrapper']}>
        <div
          className={styles['image']}
          style={{ backgroundImage: `url('${product.image}')` }}
        ></div>
        <div className={styles['description']}>
          <div className={styles['line']}>
            <div className={styles['text']}>Цена</div>
            <div className={styles['price']}>
              {product.price}&nbsp;<span>₽</span>
            </div>
          </div>
          <hr className={styles['hr']} />
          <div className={styles['rating_wrapper']}>
            Рейтинг
            <div className={styles['rating']}>
              {product.rating}&nbsp;
              <img src="/star-icon.svg" alt="Иконка звезды" />
            </div>
          </div>
          {hasOrdered && (
            <div className={styles['my_rating_wrapper']}>
              <div className={styles['my_rating_text']}>Ваша оценка</div>
              <div className={styles['stars']}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src="/star-icon.svg"
                    alt={`Звезда ${star}`}
                    className={cn(styles['star'], {
                      [styles['active_star']]: (userRating || 0) >= star,
                    })}
                    onClick={() => handleRatingWithUpdate(product.id, star)}
                  />
                ))}
              </div>
            </div>
          )}
          <ul className={styles['ul']}>
            Состав:
            {product.ingredients.map((i) => (
              <li className={styles['li']} key={i}>
                {i.charAt(0).toUpperCase() + i.slice(1)}
              </li>
            ))}
          </ul>
          <Button
            className={styles['cart_button']}
            onClick={async (e) => {
              e.preventDefault();
              try {
                await dispatch(cartActions.addToCart({ dishId: product.id, quantity: 1 })).unwrap();
                toast.success('Товар добавлен в корзину!');
              } catch {
                toast.error('Не удалось добавить товар в корзину');
              }
            }}
            appearance="small"
            loading={cartLoading}
          >
            <img src="/cart-button-icon.svg" alt="Иконка корзины" />В корзину
          </Button>
        </div>
      </div>
    </>
  );
}
