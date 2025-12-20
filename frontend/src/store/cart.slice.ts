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
  updatingItems: { [dishId: number]: boolean };
}

const initialState: CartState = {
  items: [], // Keeping this for backward compatibility if needed, but we'll focus on backendCart
  backendCart: null,
  loading: false,
  error: null,
  updatingItems: {},
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
      state.updatingItems = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch cart';
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to cart';
      })
      .addCase(updateCartQuantity.pending, (state, action) => {
        state.updatingItems[action.meta.arg.dishId] = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        const dishId = action.meta.arg.dishId;
        delete state.updatingItems[dishId];
        state.backendCart = action.payload;
        state.items = action.payload.items.map((i) => ({ id: i.dishId, count: i.quantity }));
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
        const dishId = action.meta.arg.dishId;
        delete state.updatingItems[dishId];
        state.error = action.error.message || 'Failed to update cart quantity';
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
        state.updatingItems = {};
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
