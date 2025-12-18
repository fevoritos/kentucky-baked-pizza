import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PREFIX } from '../helpers/API';
import type { RootState } from './store';
import type { IOrder } from '../interfaces/order.interface';
import { userActions } from './user.slice';

export interface OrdersState {
  items: IOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk<IOrder[], void, { state: RootState }>(
  'orders/fetchAll',
  async (_, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    if (!jwt) throw new Error('No JWT');
    const { data } = await axios.get<IOrder[]>(`${PREFIX}/orders`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return data;
  },
);

export const checkout = createAsyncThunk<IOrder, void, { state: RootState }>(
  'orders/checkout',
  async (_, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    if (!jwt) throw new Error('No JWT');
    const { data } = await axios.post<IOrder>(
      `${PREFIX}/orders/checkout`,
      {},
      {
        headers: { Authorization: `Bearer ${jwt}` },
      },
    );
    return data;
  },
);

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })
      .addCase(checkout.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
        // The cart will be cleared by the backend, so we should probably refresh the cart state elsewhere
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Checkout failed';
      })
      .addCase(userActions.logout, (state) => {
        state.items = [];
      });
  },
});

export default ordersSlice.reducer;
export const ordersActions = ordersSlice.actions;
