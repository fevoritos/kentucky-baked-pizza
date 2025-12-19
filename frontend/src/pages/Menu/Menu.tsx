import type { ChangeEvent } from 'react';
import { useEffect, useState, useRef } from 'react';
import Headling from '../../components/Headling/Headling';
import Search from '../../components/Search/Search';
import { PREFIX } from '../../helpers/API';
import type { IProduct } from '../../interfaces/product.interface';
import styles from './Menu.module.css';
import axios, { AxiosError } from 'axios';
import { MenuList } from './MenuList/MenuList';

export function Menu() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [searchValue, setSearchValue] = useState<string>('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // При первой загрузке делаем запрос без фильтра
    if (isFirstRender.current) {
      isFirstRender.current = false;
      getMenu(undefined);
      return;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Устанавливаем filter только если searchValue не пустая
      const trimmedValue = searchValue.trim();
      setFilter(trimmedValue || undefined);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchValue]);

  useEffect(() => {
    // Пропускаем первый рендер
    if (isFirstRender.current) {
      return;
    }
    getMenu(filter);
  }, [filter]);

  const getMenu = async (name?: string) => {
    try {
      setIsloading(true);
      const params = name && name.trim() ? { name: name.trim() } : {};
      const { data } = await axios.get<IProduct[]>(`${PREFIX}/dishes`, {
        params,
      });
      setProducts(data);
      setIsloading(false);
    } catch (e) {
      console.error(e);
      if (e instanceof AxiosError) {
        setError(e.message);
      }
      setIsloading(false);
      return;
    }
  };

  const updateFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <>
      <div className={styles['head']}>
        <Headling className={styles['mobileHidden']}>Меню</Headling>
        <Search placeholder="Введите блюдо или состав" onChange={updateFilter} />
      </div>
      <div>
        {error && <>{error}</>}
        <MenuList products={products} isLoading={isLoading} />
        {!isLoading && products.length === 0 && !error && <>Не найдено блюд по запросу</>}
      </div>
    </>
  );
}
