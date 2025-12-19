import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { PREFIX } from '../helpers/API';
import type { RootState } from './store';

export interface FeedbackState {
  ratings: Record<number, number>; // dishId -> rating value
  loading: boolean;
  error: string | null;
}

const initialState: FeedbackState = {
  ratings: {},
  loading: false,
  error: null,
};

export const fetchMyRating = createAsyncThunk<
  { dishId: number; rating: number | null },
  number,
  { state: RootState }
>('feedback/fetchMyRating', async (dishId, thunkApi) => {
  const jwt = thunkApi.getState().user.jwt;
  if (!jwt) throw new Error('No JWT');
  try {
    const { data } = await axios.get(`${PREFIX}/feedback/my-rating/${dishId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return { dishId, rating: data ? data.value : null };
  } catch (e) {
    console.log(e);
    return { dishId, rating: null };
  }
});

export const submitRating = createAsyncThunk<
  { dishId: number; rating: number },
  { dishId: number; rating: number },
  { state: RootState }
>('feedback/submitRating', async (params, thunkApi) => {
  const jwt = thunkApi.getState().user.jwt;
  if (!jwt) throw new Error('No JWT');
  await axios.post(
    `${PREFIX}/feedback/rate`,
    { dishId: params.dishId, rating: params.rating },
    {
      headers: { Authorization: `Bearer ${jwt}` },
    },
  );
  return params;
});

export const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyRating.fulfilled, (state, action) => {
        if (action.payload.rating !== null) {
          state.ratings[action.payload.dishId] = action.payload.rating;
        }
      })
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        state.ratings[action.payload.dishId] = action.payload.rating;
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to submit rating';
      });
  },
});

export default feedbackSlice.reducer;
export const feedbackActions = feedbackSlice.actions;
