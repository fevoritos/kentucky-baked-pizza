import { configureStore } from '@reduxjs/toolkit';
import userSlice, { JWT_PERSISTENT_STATE } from './user.slice';
import { saveState } from './storage';
import cartSlice, { CART_PERSISTENT_STATE } from './cart.slice';
import ordersSlice from './orders.slice';
import feedbackSlice from './feedback.slice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    cart: cartSlice,
    orders: ordersSlice,
    feedback: feedbackSlice,
  },
});

store.subscribe(() => {
  saveState({ jwt: store.getState().user.jwt }, JWT_PERSISTENT_STATE);
  saveState(store.getState().cart, CART_PERSISTENT_STATE);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
