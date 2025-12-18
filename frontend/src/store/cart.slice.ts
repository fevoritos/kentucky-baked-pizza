import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PREFIX } from '../helpers/API';
import type { RootState } from './store';
import type { ICart } from '../interfaces/cart.interface';
import { userActions } from './user.slice';

export const CART_PERSISTENT_STATE = 'cartData';

export interface CartState {
  items: {
    id: number;
    count: number;
  }[];
  backendCart: ICart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [], // Keeping this for backward compatibility if needed, but we'll focus on backendCart
  backendCart: null,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk<ICart, void, { state: RootState }>(
  'cart/fetch',
  async (_, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    if (!jwt) throw new Error('No JWT');
    const { data } = await axios.get<ICart>(`${PREFIX}/cart`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return data;
  },
);

export const addToCart = createAsyncThunk<
  ICart,
  { dishId: number; quantity: number },
  { state: RootState }
>('cart/add', async (params, thunkApi) => {
  const jwt = thunkApi.getState().user.jwt;
  const { data } = await axios.post<ICart>(`${PREFIX}/cart/add`, params, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return data;
});

export const updateCartQuantity = createAsyncThunk<
  ICart,
  { dishId: number; quantity: number },
  { state: RootState }
>('cart/updateQuantity', async (params, thunkApi) => {
  const jwt = thunkApi.getState().user.jwt;
  const { data } = await axios.patch<ICart>(`${PREFIX}/cart/quantity`, params, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return data;
});

export const removeFromCart = createAsyncThunk<ICart, number, { state: RootState }>(
  'cart/remove',
  async (dishId, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    const { data } = await axios.delete<ICart>(`${PREFIX}/cart/remove/${dishId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return data;
  },
);

export const clearCart = createAsyncThunk<ICart, void, { state: RootState }>(
  'cart/clear',
  async (_, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    const { data } = await axios.delete<ICart>(`${PREFIX}/cart/clear`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return data;
  },
);

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    reset: (state) => {
      state.backendCart = null;
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.backendCart = action.payload;
        state.items = [];
      })
      .addCase(userActions.logout, (state) => {
        state.backendCart = null;
        state.items = [];
      });
  },
});

export default cartSlice.reducer;
export const cartActions = {
  ...cartSlice.actions,
  fetchCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
