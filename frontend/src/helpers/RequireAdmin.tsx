import { type ReactNode, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { type RootState, type AppDispatch } from '../store/store';
import { getProfile } from '../store/user.slice';
import { Loading } from '../components/Loading/Loading';

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { jwt, profile } = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (jwt && !profile) {
      dispatch(getProfile());
    }
  }, [jwt, profile, dispatch]);

  if (!jwt) {
    return <Navigate to="/auth/login" replace />;
  }

  if (profile && profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (!profile) {
    return <Loading text="Загрузка профиля..." />;
  }

  return children;
};
