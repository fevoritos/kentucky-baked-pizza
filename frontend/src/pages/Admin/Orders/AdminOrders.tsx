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
  { id: 2, name: 'В процессе' },
  { id: 3, name: 'Завершен' },
  { id: 4, name: 'Отменен' },
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
      <Headling>Управление заказами</Headling>
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
                </td>
                <td>{order.items.map((i) => `${i.dish.name} x${i.quantity}`).join(', ')}</td>
                <td>{order.items.reduce((acc, i) => acc + i.price * i.quantity, 0)} ₽</td>
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
      </div>
    </>
  );
}
