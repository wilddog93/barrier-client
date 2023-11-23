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
  arrivals: any[];
  arrival: any;
  pending: boolean;
  error: boolean;
  message: any;
};

const initialState: MainState = {
  arrivals: [],
  arrival: {},
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

interface ArrivalData {
  id?: any;
  data?: any;
  token?: any;
  isSuccess: () => void;
  isError: () => void;
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

// get all report
export const getArrivals = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("dashboard/arrival", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get("dashboard/arrival", config);
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
      throw new Error("rfid not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

export const getArrivalById = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("dashboard/arrival/id", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get(`dashboard/arrival/${params.id}`, config);
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
      throw new Error("rfid not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

// SLICER
export const arrivalSlice = createSlice({
  name: "arrival",
  initialState,
  reducers: {
    // leave this empty here
    resetArrivals(state) {
      state.arrivals = [];
      state.pending = false;
      state.error = false;
      state.message = "";
    },

    resetArrival(state) {
      state.arrival = {};
      state.pending = false;
      state.error = false;
      state.message = "";
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  // Since this is an API call we have 3 possible outcomes: pending, fulfilled and rejected. We have made allocations for all 3 outcomes.
  // Doing this is good practice as we can tap into the status of the API call and give our rfids an idea of what's happening in the background.
  extraReducers: (builder) => {
    builder
      // get-report
      .addCase(getArrivals.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getArrivals.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          arrivals: payload,
        };
      })
      .addCase(getArrivals.rejected, (state, { error }) => {
        state.pending = false;
        state.error = true;
        state.message = error.message;
      })

      // get-arrival
      .addCase(getArrivalById.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getArrivalById.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          arrival: payload,
        };
      })
      .addCase(getArrivalById.rejected, (state, { error }) => {
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

const arrivalReducers = arrivalSlice.reducer;

export const { resetArrivals, resetArrival } = arrivalSlice.actions;
export const selectArrivalManagement = (state: RootState) =>
  state.arrivalManagement;

export default arrivalReducers;
