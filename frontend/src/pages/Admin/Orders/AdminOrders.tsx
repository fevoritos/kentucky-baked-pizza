import { useEffect, useState, useCallback } from 'react';
import Headling from '../../../components/Headling/Headling';
import { PREFIX } from '../../../helpers/API';
import type { IProduct } from '../../../interfaces/product.interface';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import styles from './Orders.module.css';

interface IOrder {
  id: number;
  userId: number;
  status: number;
  deliveryFee: number;
  address: string;
  phone: string;
  createdAt: string;
  items: {
    dishId: number;
    quantity: number;
    price: number;
    dish: IProduct;
  }[];
  user: {
    name: string;
    email: string;
  };
}

const STATUSES = [
  { id: 1, name: 'Новый' },
  { id: 2, name: 'Принят' },
  { id: 3, name: 'Готовится' },
  { id: 4, name: 'Доставляется' },
  { id: 5, name: 'Доставлен' },
  { id: 6, name: 'Отклонён' },
];

export function AdminOrders() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const jwt = useSelector((s: RootState) => s.user.jwt);

  const getOrders = useCallback(async () => {
    try {
      setIsloading(true);
      const { data } = await axios.get<IOrder[]>(`${PREFIX}/orders/all`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setOrders(data);
      setIsloading(false);
    } catch (e) {
      console.error(e);
      setIsloading(false);
    }
  }, [jwt]);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const handleStatusChange = async (orderId: number, statusId: number) => {
    try {
      await axios.put(
        `${PREFIX}/orders/${orderId}/status`,
        { statusId },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );
      getOrders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <Headling className={styles['mobileHidden']}>Управление заказами</Headling>
      <div className={styles['list']}>
        {isLoading && <div>Загрузка...</div>}
        <table className={styles['table']}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Клиент</th>
              <th>Состав</th>
              <th>Сумма</th>
              <th>Дата</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <div>{order.user?.name}</div>
                  <div className={styles['email']}>{order.user?.email}</div>
                  <div className={styles['phone']}>{order.phone}</div>
                  <div className={styles['address']}>{order.address}</div>
                </td>
                <td>
                  <div>{order.items.map((i) => `${i.dish.name} x${i.quantity}`).join(', ')}</div>
                  <div className={styles['delivery']}>Доставка: {order.deliveryFee} ₽</div>
                </td>
                <td>
                  {order.items.reduce((acc, i) => acc + i.price * i.quantity, 0) +
                    order.deliveryFee}{' '}
                  ₽
                </td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, Number(e.target.value))}
                    className={styles['select']}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles['mobile-list']}>
          {orders.map((order) => (
            <div key={order.id} className={styles['mobile-card']}>
              <div className={styles['card-header']}>
                <div className={styles['card-id']}>Заказ №{order.id}</div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, Number(e.target.value))}
                  className={styles['select']}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles['card-section']}>
                <div className={styles['card-label']}>Клиент</div>
                <div>{order.user?.name}</div>
                <div className={styles['email']}>{order.user?.email}</div>
                <div className={styles['phone']}>{order.phone}</div>
                <div className={styles['address']}>{order.address}</div>
              </div>
              <div className={styles['card-section']}>
                <div className={styles['card-label']}>Состав</div>
                <div>{order.items.map((i) => `${i.dish.name} x${i.quantity}`).join(', ')}</div>
                <div className={styles['delivery']}>Доставка: {order.deliveryFee} ₽</div>
              </div>
              <div className={styles['card-section']}>
                <div className={styles['card-label']}>Сумма</div>
                <div className={styles['card-price']}>
                  {order.items.reduce((acc, i) => acc + i.price * i.quantity, 0) +
                    order.deliveryFee}{' '}
                  ₽
                </div>
              </div>
              <div className={styles['card-section']}>
                <div className={styles['card-label']}>Дата</div>
                <div>{new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
