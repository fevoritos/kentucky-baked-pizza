import { useEffect, useState } from 'react';
import Headling from '../../../components/Headling/Headling';
import { Loading } from '../../../components/Loading/Loading';
import { PREFIX } from '../../../helpers/API';
import type { IProduct } from '../../../interfaces/product.interface';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import Button from '../../../components/Button/Button';
import styles from './Assortment.module.css';

export function AdminAssortment() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<IProduct>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const jwt = useSelector((s: RootState) => s.user.jwt);

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditing]);

  const getProducts = async () => {
    try {
      setIsloading(true);
      const { data } = await axios.get<IProduct[]>(`${PREFIX}/dishes`);
      setProducts(data);
      setIsloading(false);
    } catch (e) {
      console.error(e);
      setIsloading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это блюдо?')) return;
    try {
      await axios.delete(`${PREFIX}/dishes/${id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      getProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (product: IProduct) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleAdd = () => {
    setCurrentProduct({ name: '', price: 0, image: '', ingredients: [] });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const ingredients =
        typeof currentProduct.ingredients === 'string'
          ? (currentProduct.ingredients as string).split(',').map((i) => i.trim())
          : currentProduct.ingredients;

      const payload = {
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        ingredients,
      };

      if (currentProduct.id) {
        await axios.put(`${PREFIX}/dishes/${currentProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      } else {
        await axios.post(`${PREFIX}/dishes`, payload, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
      }
      setIsEditing(false);
      getProducts();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles['head']}>
        <Headling className={styles['mobileHidden']}>Управление ассортиментом</Headling>
        <Button onClick={handleAdd} className={styles['addButton']}>
          Добавить блюдо
        </Button>
      </div>

      {isEditing && (
        <div className={styles['modal']}>
          <form onSubmit={handleSave} className={styles['form']}>
            <h2>{currentProduct.id ? 'Редактировать' : 'Добавить'} блюдо</h2>
            <input
              placeholder="Название"
              value={currentProduct.name}
              onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
              required
            />
            <input
              placeholder="Цена"
              type="number"
              value={currentProduct.price}
              onChange={(e) =>
                setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })
              }
              required
            />
            <input
              placeholder="URL изображения"
              value={currentProduct.image}
              onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
              required
            />
            <input
              placeholder="Ингредиенты (через запятую)"
              value={
                Array.isArray(currentProduct.ingredients)
                  ? currentProduct.ingredients.join(', ')
                  : (currentProduct.ingredients as unknown as string)
              }
              onChange={(e) =>
                setCurrentProduct({
                  ...currentProduct,
                  ingredients: e.target.value as unknown as string[],
                })
              }
              required
            />
            <div className={styles['actions']}>
              <Button type="submit" loading={isSaving}>
                Сохранить
              </Button>
              <Button appearance="big" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Отмена
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className={styles['list']}>
        {isLoading ? (
          <Loading text="Загрузка ассортимента..." />
        ) : (
          <>
            {products.map((p) => (
              <div key={p.id} className={styles['item']}>
                <img
                  src={p.image}
                  alt={p.name}
                  className={p.image ? styles['img'] : styles['no-img']}
                />
                <div className={styles['info']}>
                  <div className={styles['title']}>{p.name}</div>
                  <div className={styles['price']}>{p.price} ₽</div>
                </div>
                <div className={styles['item-actions']}>
                  <button onClick={() => handleEdit(p)}>Редактировать</button>
                  <button onClick={() => handleDelete(p.id)} className={styles['delete']}>
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
