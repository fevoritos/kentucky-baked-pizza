import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Headling from '../../components/Headling/Headling';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchOrders } from '../../store/orders.slice';
import styles from './Orders.module.css';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { formatDateTime } from '../../helpers/dateFormat';

const STATUS_NAMES: Record<number, string> = {
  1: 'Обработка',
  2: 'Принят',
  3: 'Готовится',
  4: 'Доставляется',
  5: 'Доставлен',
  6: 'Отклонён',
};

export function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: orders, loading, error } = useSelector((s: RootState) => s.orders);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  if (loading && orders.length === 0) {
    return <div className={styles['loading']}>Загрузка заказов...</div>;
  }

  if (error) {
    return <div className={styles['error']}>Ошибка: {error}</div>;
  }

  return (
    <div className={styles['wrapper']}>
      <Headling className={cn(styles['headling'], styles['mobileHidden'])}>
        История заказов
      </Headling>
      {orders.length === 0 ? (
        <div className={styles['empty']}>У вас пока нет заказов</div>
      ) : (
        <div className={styles['list']}>
          {orders.map((order) => (
            <div key={order.id} className={styles['order']}>
              <div className={styles['order_head']}>
                <div className={styles['order_id_status']}>
                  <div className={styles['order_id']}>Заказ №{order.id}</div>
                  <div className={cn(styles['status'], styles[`status_${order.status}`])}>
                    {STATUS_NAMES[order.status] || 'Неизвестно'}
                  </div>
                </div>
                <div className={styles['order_info']}>
                  <div className={styles['order_date']}>{formatDateTime(order.createdAt)}</div>
                  {order.address && (
                    <div className={styles['order_address']}>
                      <span className={styles['address_label']}>Адрес доставки:</span>{' '}
                      {order.address}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles['items']}>
                {order.items?.map((item) => (
                  <div
                    key={item.dishId}
                    className={styles['item']}
                    onClick={() => navigate(`/product/${item.dishId}`)}
                  >
                    <div
                      className={styles['image']}
                      style={{ backgroundImage: `url('${item.dish.image}')` }}
                    />
                    <div className={styles['item_info']}>
                      <div className={styles['item_name']}>{item.dish.name}</div>
                      <div className={styles['item_details']}>
                        {item.quantity} шт. x {item.price} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles['order_footer']}>
                <div className={styles['delivery_fee']}>Доставка: {order.deliveryFee} ₽</div>
                <div className={styles['total']}>
                  Итого:{' '}
                  {(order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0) +
                    order.deliveryFee}{' '}
                  ₽
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
