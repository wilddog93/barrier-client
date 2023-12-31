import {
  Action,
  AnyAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import type { RootState } from "../../store";

// here we are typing the types for the state
export type MainState = {
  logs: any;
  log: any;
  pending: boolean;
  error: boolean;
  message: any;
};

const initialState: MainState = {
  logs: {},
  log: {},
  pending: false,
  error: false,
  message: "",
};

interface HeadersConfiguration {
  params?: any;
  headers: {
    "Content-Type"?: string;
    Accept?: string;
    Authorization?: string;
  };
}

interface LogData {
  id?: any;
  data: any;
  token?: any;
  isSuccess: () => void;
}

interface DefaultGetData {
  id?: any;
  token?: any;
  params?: any;
}

// rejection
interface RejectedAction extends Action {
  error: Error;
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith("rejected");
}

// get all log
export const getLogGate = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("/gate", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get("gate", config);
    const { data, status } = response;
    if (status == 200) {
      return data;
    } else {
      throw response;
    }
  } catch (error: any) {
    const { data, status } = error.response;
    let newError: any = { message: data.message[0] };
    if (error.response.status !== 401) {
      toast.dark(newError.message);
    }
    if (error.response && error.response.status === 404) {
      throw new Error("log not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

// SLICER
export const logGateSlice = createSlice({
  name: "log-gate",
  initialState,
  reducers: {
    // leave this empty here
    resetLogGate(state) {
      state.log = {};
      state.pending = false;
      state.error = false;
      state.message = "";
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  // Since this is an API call we have 3 possible outcomes: pending, fulfilled and rejected. We have made allocations for all 3 outcomes.
  // Doing this is good practice as we can tap into the status of the API call and give our logs an idea of what's happening in the background.
  extraReducers: (builder) => {
    builder
      // get-logs
      .addCase(getLogGate.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getLogGate.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          logs: payload,
        };
      })
      .addCase(getLogGate.rejected, (state, { error }) => {
        state.pending = false;
        state.error = true;
        state.message = error.message;
      })

      .addMatcher(isRejectedAction, (state, action) => {})
      .addDefaultCase((state, action) => {
        let base = {
          ...state,
          ...action.state,
        };
        return base;
      });
  },
});
// SLICER

const logGateReducers = logGateSlice.reducer;

export const { resetLogGate } = logGateSlice.actions;
export const selectLogGateManagement = (state: RootState) =>
  state.logGateManagement;

export default logGateReducers;
