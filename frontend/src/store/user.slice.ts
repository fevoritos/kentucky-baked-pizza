import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadState } from './storage';
import axios, { AxiosError } from 'axios';
import type { LoginResponse } from '../interfaces/auth.interface';
import { PREFIX } from '../helpers/API';
import type { Profile } from '../interfaces/user.interface';
import type { RootState } from './store';

export const JWT_PERSISTENT_STATE = 'userData';

export interface UserPersistentState {
  jwt: string | undefined;
}

export interface UserState {
  jwt: string | null;
  loginErrorMessage?: string | undefined;
  registerErrorMessage?: string | undefined;
  profile?: Profile;
  loginLoading: boolean;
  registerLoading: boolean;
}

const initialState: UserState = {
  jwt: loadState<UserPersistentState>(JWT_PERSISTENT_STATE)?.jwt ?? null,
  loginLoading: false,
  registerLoading: false,
};

export const login = createAsyncThunk(
  'user/login',
  async (params: { email: string; password: string }) => {
    try {
      const { data } = await axios.post<LoginResponse>(`${PREFIX}/auth/login`, {
        email: params.email,
        password: params.password,
      });
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new Error(e.response?.data.message);
      }
    }
  },
);

export const register = createAsyncThunk(
  'user/register',
  async (params: { email: string; password: string; name: string }) => {
    try {
      const { data } = await axios.post<LoginResponse>(`${PREFIX}/auth/register`, {
        email: params.email,
        password: params.password,
        name: params.name,
      });
      return data;
    } catch (e) {
      if (e instanceof AxiosError) {
        throw new Error(e.response?.data.message);
      }
    }
  },
);

export const getProfile = createAsyncThunk<Profile, void, { state: RootState }>(
  'user/getProfile',
  async (_, thunkApi) => {
    const jwt = thunkApi.getState().user.jwt;
    const { data } = await axios.get<Profile>(`${PREFIX}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    return data;
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.jwt = null;
    },
    clearLoginError: (state) => {
      state.loginErrorMessage = undefined;
    },
    clearRegisterError: (state) => {
      state.registerErrorMessage = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loginLoading = true;
        state.loginErrorMessage = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loginLoading = false;
        if (!action.payload) {
          return;
        }
        state.jwt = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginErrorMessage = action.error.message;
      })
      .addCase(register.pending, (state) => {
        state.registerLoading = true;
        state.registerErrorMessage = undefined;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.registerLoading = false;
        if (!action.payload) {
          return;
        }
        state.jwt = action.payload.access_token;
      })
      .addCase(register.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerErrorMessage = action.error.message;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default userSlice.reducer;
export const userActions = userSlice.actions;
