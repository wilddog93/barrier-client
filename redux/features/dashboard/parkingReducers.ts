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
  parkings: any;
  parking: any;
  duration: any;
  pending: boolean;
  error: boolean;
  message: any;
};

const initialState: MainState = {
  parkings: {},
  parking: {},
  duration: {},
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
export const getParkings = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("dashboard/weekly/report", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get("dashboard/weekly/report", config);
    const { data, status } = response;
    if (status == 200) {
      return data;
    } else {
      throw response;
    }
  } catch (error: any) {
    const { data, status } = error.response;
    let newError: any = { message: data.message[0] };
    toast.dark(newError.message);
    if (error.response && error.response.status === 404) {
      throw new Error("rfid not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

export const getParkingById = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("dashboard/weekly/arrival", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get("dashboard/weekly/arrival", config);
    const { data, status } = response;
    if (status == 200) {
      return data;
    } else {
      throw response;
    }
  } catch (error: any) {
    const { data, status } = error.response;
    let newError: any = { message: data.message[0] };
    toast.dark(newError.message);
    if (error.response && error.response.status === 404) {
      throw new Error("rfid not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

export const getDuration = createAsyncThunk<
  any,
  DefaultGetData,
  { state: RootState }
>("dashboard/weekly/peekTime", async (params, { getState }) => {
  let config: HeadersConfiguration = {
    params: params.params,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${params.token}`,
    },
  };
  try {
    const response = await axios.get("dashboard/weekly/peekTime", config);
    const { data, status } = response;
    if (status == 200) {
      return data;
    } else {
      throw response;
    }
  } catch (error: any) {
    const { data, status } = error.response;
    let newError: any = { message: data.message[0] };
    toast.dark(newError.message);
    if (error.response && error.response.status === 404) {
      throw new Error("rfid not found");
    } else {
      throw new Error(newError.message);
    }
  }
});

// SLICER
export const parkingSlice = createSlice({
  name: "parking",
  initialState,
  reducers: {
    // leave this empty here
    resetParkings(state) {
      state.parkings = {};
      state.pending = false;
      state.error = false;
      state.message = "";
    },

    resetParking(state) {
      state.parking = {};
      state.pending = false;
      state.error = false;
      state.message = "";
    },

    resetDuration(state) {
      state.duration = {};
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
      .addCase(getParkings.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getParkings.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          parkings: payload,
        };
      })
      .addCase(getParkings.rejected, (state, { error }) => {
        state.pending = false;
        state.error = true;
        state.message = error.message;
      })

      // get-arrival
      .addCase(getParkingById.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getParkingById.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          parking: payload,
        };
      })
      .addCase(getParkingById.rejected, (state, { error }) => {
        state.pending = false;
        state.error = true;
        state.message = error.message;
      })

      // get-report
      .addCase(getDuration.pending, (state) => {
        return {
          ...state,
          pending: true,
        };
      })
      .addCase(getDuration.fulfilled, (state, { payload }) => {
        return {
          ...state,
          pending: false,
          error: false,
          duration: payload,
        };
      })
      .addCase(getDuration.rejected, (state, { error }) => {
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

const parkingReducers = parkingSlice.reducer;

export const { resetParkings, resetParking, resetDuration } =
  parkingSlice.actions;
export const selectParkingManagement = (state: RootState) =>
  state.parkingManagement;

export default parkingReducers;
