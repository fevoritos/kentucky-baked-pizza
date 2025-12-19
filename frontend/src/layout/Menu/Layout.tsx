import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import Button from '../../components/Button/Button';
import Headling from '../../components/Headling/Headling';
import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { getProfile, userActions } from '../../store/user.slice';
import { cartActions } from '../../store/cart.slice';
import { useEffect, useState } from 'react';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Меню';
  if (pathname === '/cart') return 'Корзина';
  if (pathname === '/orders') return 'История заказов';
  if (pathname.startsWith('/admin/assortment')) return 'Ассортимент';
  if (pathname.startsWith('/admin/orders')) return 'Заказы';
  if (pathname.startsWith('/product/')) return '';
  return '';
};

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const profile = useSelector((s: RootState) => s.user.profile);
  const items = useSelector((s: RootState) => s.cart.items);
  const jwt = useSelector((s: RootState) => s.user.jwt);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    dispatch(getProfile());
    if (jwt) {
      dispatch(cartActions.fetchCart());
    }
  }, [dispatch, jwt]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const logout = () => {
    dispatch(userActions.logout());
    navigate('/auth/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={styles['layout']}>
      <header className={styles['header']}>
        <button className={styles['burger']} onClick={toggleMenu} aria-label="Открыть меню">
          <span
            className={cn(styles['burgerLine'], { [styles['burgerLineActive']]: isMenuOpen })}
          ></span>
          <span
            className={cn(styles['burgerLine'], { [styles['burgerLineActive']]: isMenuOpen })}
          ></span>
          <span
            className={cn(styles['burgerLine'], { [styles['burgerLineActive']]: isMenuOpen })}
          ></span>
        </button>
        {pageTitle && (
          <div className={styles['headerTitle']}>
            <Headling>{pageTitle}</Headling>
          </div>
        )}
      </header>
      {isMenuOpen && <div className={styles['overlay']} onClick={closeMenu}></div>}
      <div className={cn(styles['sidebar'], { [styles['sidebarOpen']]: isMenuOpen })}>
        <button className={styles['closeButton']} onClick={closeMenu} aria-label="Закрыть меню">
          <span className={styles['closeLine']}></span>
          <span className={styles['closeLine']}></span>
        </button>
        <div className={styles['user']}>
          <img className={styles['avatar']} src="/avatar.png" alt="Аватар пользователя" />
          <div className={styles['name']}>{profile?.name}</div>
          <div className={styles['email']}>{profile?.email}</div>
        </div>
        <div className={styles['menu']}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(styles['link'], {
                [styles.active]: isActive,
              })
            }
            onClick={closeMenu}
          >
            <img src="/menu-icon.svg" alt="Иконка меню" />
            Меню
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              cn(styles['link'], {
                [styles.active]: isActive,
              })
            }
            onClick={closeMenu}
          >
            <img src="/cart-icon.svg" alt="Иконка корзины" />
            Корзина{' '}
            <span className={styles['cartCount']}>
              {items.reduce((acc, i) => (acc += i.count), 0)}{' '}
            </span>
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(styles['link'], {
                [styles.active]: isActive,
              })
            }
            onClick={closeMenu}
          >
            <img src="/history.svg" alt="Иконка заказов" />
            История
          </NavLink>
          {profile?.role === 'admin' && (
            <>
              <NavLink
                to="/admin/assortment"
                className={({ isActive }) =>
                  cn(styles['link'], {
                    [styles.active]: isActive,
                  })
                }
                onClick={closeMenu}
              >
                <img src="/dish.svg" alt="Иконка ассортимента" />
                Ассортимент
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  cn(styles['link'], {
                    [styles.active]: isActive,
                  })
                }
                onClick={closeMenu}
              >
                <img src="/order.svg" alt="Иконка заказов" />
                Заказы
              </NavLink>
            </>
          )}
        </div>
        <Button
          className={styles['exit']}
          onClick={() => {
            logout();
            closeMenu();
          }}
        >
          <img src="/exit-icon.svg" alt="Иконка выхода" />
          Выйти
        </Button>
      </div>
      <div className={styles['content']}>
        <Outlet />
      </div>
    </div>
  );
}
