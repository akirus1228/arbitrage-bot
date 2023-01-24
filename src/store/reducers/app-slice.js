import { ethers } from 'ethers';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { database } from '../../config/firebase';
import { erc20abi } from '../../utils/abis/erc20ABI';
import { addressDatabaseURL, RPC_URL } from '../../utils/basic';

async function getAll() {
  let tokens = [];
  const result = await database.ref(addressDatabaseURL + '/').get();
  if (result.exists) {
    const data = result.val();
    Object.keys(data).forEach((key, index) => {
      tokens.push({
        id: index + 1,
        key,
        address: data[key].address,
        tokenName: data[key].tokenName,
        active: data[key].active,
      })
    });
  };
  return tokens;
}

const initialState = {
  loading: "idle",
  tokens: [],
};

export const getAllTokens = createAsyncThunk(
  "app/getAllTokens",
  async () => {
    return await getAll();
  }
);

export const addToken = createAsyncThunk(
  "app/addToken",
  async (address) => {
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const tokenContract = new ethers.Contract(address, erc20abi, provider);
    const tokenName = await tokenContract["symbol"]();

    const newToken = {
      address,
      tokenName: tokenName,
      active: true
    };
    await database.ref(addressDatabaseURL).push().set(newToken);
    return await getAll();
  }
);

export const updateToken = createAsyncThunk(
  "app/updateToken",
  async (uuid) => {
    const tokenRef = await database.ref(addressDatabaseURL + '/' + uuid);
    tokenRef.set({active: !tokenRef.child('active').get().val()});
    console.log("updateToken: ", tokenRef, tokenRef.val());
    return await getAll();
  }
);

export const removeToken = createAsyncThunk(
  "app/removeToken",
  async (uuid) => {
    await database.ref(addressDatabaseURL + '/' + uuid).remove();
    return await getAll();
  }
);

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllTokens.pending, (state) => {
      state.checkPermStatus = "pending";
    });
    builder.addCase(getAllTokens.fulfilled, (state, action) => {
      state.checkPermStatus = "success";
      state.tokens = action.payload;
    });
    builder.addCase(getAllTokens.rejected, (state) => {
      state.checkPermStatus = "failed";
    });
    builder.addCase(addToken.pending, (state) => {
      state.checkPermStatus = "pending";
    });
    builder.addCase(addToken.fulfilled, (state, action) => {
      state.checkPermStatus = "success";
      state.tokens = action.payload;
    });
    builder.addCase(addToken.rejected, (state) => {
      state.checkPermStatus = "failed";
    });
    builder.addCase(removeToken.pending, (state) => {
      state.checkPermStatus = "pending";
    });
    builder.addCase(removeToken.fulfilled, (state, action) => {
      state.checkPermStatus = "success";
      state.tokens = action.payload;
    });
    builder.addCase(removeToken.rejected, (state) => {
      state.checkPermStatus = "failed";
    });
  },
});

export const { increment, decrement, incrementByAmount } = appSlice.actions

export default appSlice.reducer;