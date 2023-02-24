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
        symbol: data[key].symbol,
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
    const collections = await database.ref(addressDatabaseURL).get();
    if (collections.val() === null ) {
      const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
      const tokenContract = new ethers.Contract(address, erc20abi, provider);
      const symbol = await tokenContract["symbol"]();
      console.log('symbol: ', symbol);

      const newToken = {
        address,
        symbol,
        active: true,
        amount: {
          min: 0,
          max: 100
        }
      };
      await database.ref(addressDatabaseURL).push().set(newToken);
    } else {
      const addresses = Object.values(collections.val()).map(collection => collection.address);
      console.log('c')
      if (!addresses.includes(address)) {
        console.log('aa');
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const tokenContract = new ethers.Contract(address, erc20abi, provider);
        const symbol = await tokenContract["symbol"]();
        console.log('symbol: ', symbol);

        const newToken = {
          address,
          symbol,
          active: true,
          amount: {
            min: 0,
            max: 100
          }
        };
        await database.ref(addressDatabaseURL).push().set(newToken);
      }
    }
    console.log('bb');
    return await getAll();
  }
);

export const updateToken = createAsyncThunk(
  "app/updateToken",
  async (uuid) => {
    const tokenRef = await database.ref(addressDatabaseURL + '/' + uuid);
    const token = await tokenRef.get();
    await tokenRef.update({active: !token.val().active});
    const result = await getAll();
    return result;
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
      state.loading = "pending";
    });
    builder.addCase(getAllTokens.fulfilled, (state, action) => {
      state.loading = "success";
      state.tokens = action.payload;
    });
    builder.addCase(getAllTokens.rejected, (state) => {
      state.loading = "failed";
    });
    builder.addCase(addToken.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(addToken.fulfilled, (state, action) => {
      state.loading = "success";
      state.tokens = action.payload;
    });
    builder.addCase(addToken.rejected, (state) => {
      state.loading = "failed";
    });
    builder.addCase(updateToken.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(updateToken.fulfilled, (state, action) => {
      state.loading = "success";
      state.tokens = action.payload;
    });
    builder.addCase(updateToken.rejected, (state) => {
      state.loading = "failed";
    });
    builder.addCase(removeToken.pending, (state) => {
      state.loading = "pending";
    });
    builder.addCase(removeToken.fulfilled, (state, action) => {
      state.loading = "success";
      state.tokens = action.payload;
    });
    builder.addCase(removeToken.rejected, (state) => {
      state.loading = "failed";
    });
  },
});

export const { increment, decrement, incrementByAmount } = appSlice.actions

export default appSlice.reducer;