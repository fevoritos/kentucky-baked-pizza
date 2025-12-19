import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Menu } from './pages/Menu/Menu.tsx';
import { Cart } from './pages/Cart/Cart.tsx';
import { Error } from './pages/Error/Error.tsx';
import { Layout } from './layout/Menu/Layout.tsx';
import { Product } from './pages/Product/Product.tsx';
import axios from 'axios';
import { PREFIX } from './helpers/API.ts';
import { AuthLayout } from './layout/Auth/AuthLayout.tsx';
import { Register } from './pages/Register/Register.tsx';
import { Login } from './pages/Login/Login.tsx';
import { RequireAuth } from './helpers/RequireAuth.tsx';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { Success } from './pages/Success/Success.tsx';
import { AdminAssortment } from './pages/Admin/Assortment/AdminAssortment.tsx';
import { AdminOrders } from './pages/Admin/Orders/AdminOrders.tsx';
import { Orders } from './pages/Orders/Orders.tsx';
import { RequireAdmin } from './helpers/RequireAdmin.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/',
        element: <Menu />,
      },
      {
        path: '/success',
        element: <Success />,
      },
      {
        path: '/cart',
        element: <Cart />,
      },
      {
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/admin/assortment',
        element: (
          <RequireAdmin>
            <AdminAssortment />
          </RequireAdmin>
        ),
      },
      {
        path: '/admin/orders',
        element: (
          <RequireAdmin>
            <AdminOrders />
          </RequireAdmin>
        ),
      },
      {
        path: 'product/:id',
        element: <Product />,
        errorElement: <>Ошибка</>,
        loader: async ({ params }) => {
          return axios.get(`${PREFIX}/dishes/${params.id}`);
        },
      },
    ],
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/*',
    element: <Error />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
