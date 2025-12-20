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
        <Search
          placeholder="Введите блюдо или состав"
          value={searchValue}
          onChange={updateFilter}
        />
      </div>
      <div>
        {error && <>{error}</>}
        <MenuList products={products} isLoading={isLoading} />
        {!isLoading && products.length === 0 && !error && (
          <div className={styles['empty']}>
            <div className={styles['emptyIcon']}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="60" cy="60" r="60" fill="#FFF4E5" />
                <circle cx="50" cy="50" r="20" stroke="#FFA726" strokeWidth="4" fill="none" />
                <path d="M65 65L80 80" stroke="#FFA726" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles['emptyText']}>Ничего не найдено</p>
            <p className={styles['emptySubtext']}>
              {searchValue.trim()
                ? `По запросу "${searchValue.trim()}" блюд не найдено. Попробуйте изменить параметры поиска.`
                : 'Попробуйте изменить параметры поиска'}
            </p>
            {searchValue.trim() && (
              <button className={styles['clearButton']} onClick={() => setSearchValue('')}>
                Очистить поиск
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
