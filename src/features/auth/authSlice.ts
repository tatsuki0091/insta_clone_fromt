import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState  } from '../../app/store';
import axios from "axios";
import { PROPS_AUTHEN, PROPS_PROFILE, PROPS_NICKNAME} from "../types"

const apiURL = process.env.REACT_APP_DEV_API_URL;

// 非同期関数

export const fetchAsyncLogin = createAsyncThunk (
    "auth/post",
    async(authen: PROPS_AUTHEN) => {
        const res = await axios.post(`${apiURL}authen/jwt/create`, authen, {
            headers: {
                "Content-Type": "application/json"
            },
        });
        return res.data;
    }
);

export const fetchAsyncRegister = createAsyncThunk(
    "auth/register",
    async (auth: PROPS_AUTHEN) => {
        const res = await axios.post(`${apiURL}api/register/`, auth, {
            headers: {
                "Content-Type": "application/json"
            },
        });
        return res.data;
    }
);

export const fetchAsyncCreateProf = createAsyncThunk(
    "profile/post",
    async (nickName: PROPS_NICKNAME) => {
        const res = await axios.post(`${apiURL}api/profile/`, nickName, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data;
    }
);

export const fetchAsyncUpdateProf = createAsyncThunk(
    "profile/put",
    async (profile: PROPS_PROFILE) => {
        // formデータのオブジェクト作成
        const uploadData = new FormData();
        uploadData.append("nickName", profile.nickName);
        console.log(uploadData)
        // イメージがあった場合に処理をする
        profile.img && uploadData.append("img", profile.img, profile.img.name);
        const res = await axios.put(`${apiURL}api/profile/${profile.id}/`, uploadData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        console.log(localStorage.localJWT)
        return res.data;
    }
);

export const fetchAsyncGetMyProf = createAsyncThunk(
    "profile/get",
    async () => {
        const res = await axios.get(`${apiURL}api/myprofile/`, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data[0];
    }
);

export const fetchAsyncGetProfs = createAsyncThunk(
    "profiles/get",
    async () => {
        const res = await axios.get(`${apiURL}api/profile/`, {
            headers: {
                Authorization: `JWT ${localStorage.localJWT}`
            },
        });
        return res.data;
    }
);



export const authSlice = createSlice({
  name: 'auth',
  initialState: {
      // modalの制御
      openSignIn: true,
      openSignUp: false,
      openProfile: false,
      // APIとの通信中にtrueになる
      isLoadingAuth: false,
      // ログインしているユーザを管理するためのState
      myprofile: {
          id: 0,
          nickName: "",
          userProfile: 0,
          created_on: "",
          img:"",
      },
      profiles: [
          {
              id: 0,
              nickName: "",
              userProfile: 0,
              created_on: "",
              img: "",
          }
      ],
  },
  reducers: {
      fetchCredStart(state) {
          state.isLoadingAuth = true;
      },
      fetchCredEnd(state) {
          state.isLoadingAuth = false;
      },
      setOpenSignIn(state) {
          state.openSignIn = true;
      },
      resetOpenSignIn(state) {
          state.openSignIn = false;
      },
      setOpenSignUp(state) {
          state.openSignUp = true;
      },
      resetOpenSignUp(state) {
          state.openSignUp = false;
      },
      setOpenProfile(state) {
        state.openProfile = true;
      },
      resetOpenProfile(state) {
          state.openProfile = false;
      },
      editNickname(state, action) {
          state.myprofile.nickName = action.payload;
      }
  },

  // extraReducer追加
  extraReducers: (builder) => {
    // fetchAsyncLoginメソッドがfulfilledだった場合の処理
    builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
        localStorage.setItem("localJWT", action.payload.access);
    });

    builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
        state.myprofile = action.payload;
    });

    builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
        state.myprofile = action.payload;
    });

    builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
        state.profiles = action.payload;
    });

    builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
        state.myprofile = action.payload;
        state.profiles = state.profiles.map((prof) =>
            prof.id === action.payload.id ? action.payload: prof
        );
    });
  }   
});



// reducerに関するものを登録
export const { 
    fetchCredStart, 
    fetchCredEnd, 
    setOpenSignIn, 
    resetOpenSignIn, 
    setOpenSignUp, 
    resetOpenSignUp, 
    setOpenProfile,
    resetOpenProfile, 
    editNickname 
} = authSlice.actions;


// 各スライスのstateにアクセスするための関数
export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;

export default authSlice.reducer;