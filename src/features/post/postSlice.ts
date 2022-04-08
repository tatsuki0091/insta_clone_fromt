import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState  } from '../../app/store';
import axios from "axios";
import { PROPS_LIKED, PROPS_NEWPOST, PROPS_COMMENT} from "../types"

const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`

export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
    const res = await axios.get(apiUrlPost, {
        headers: {
            Authorization: `JWT ${localStorage.localJWT}`,
        },
    });
    return res.data;
})

export const fetchAsyncNewPost = createAsyncThunk(
    "post/post",
    async (newPost: PROPS_NEWPOST) => {
        const uploadData = new FormData();
        uploadData.append("title", newPost.title);
        newPost.img && uploadData.append("img", newPost.img, newPost.img.name);
        const res = await axios.post(apiUrlPost, uploadData, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            }
        });
        return res.data;
});

export const fetchAsyncPatchLiked = createAsyncThunk(
    "post/patch",
    async (liked: PROPS_LIKED) => {
        const currentLiked = liked.current;
        const uploadData = new FormData();

        let isOverlapped = false;
        // 一度likeが押されている場合はそのユーザIDを抜くのでそのユーザの判定処理
        currentLiked.forEach((current) => {
            if (current === liked.new) {
                isOverlapped = true;
            } else {
                uploadData.append("Liked", String(current))
            }
        });

        if(!isOverlapped) { 
            uploadData.append("liked", String(liked.new));
        } else if(currentLiked.length === 1) {
            uploadData.append("title", liked.title);
            // httpのpatchメソッドだと何もない状態にすることができないのでputを使用
            const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `JWT ${localStorage.localJWT}`
                }
            });
            return res.data
        }

        const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
            headers: {
                    "Content-Type": "application/json",
                    Authorization: `JWT ${localStorage.localJWT}`
            }
        });
        return res.data;

});

export const fetchAsyncGetComments = createAsyncThunk(
    "comment/get",
    async () => {
        const res = await axios.get(apiUrlComment, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            }
        });
        return res.data;
});

export const fetchAsyncPostComment = createAsyncThunk(
    "comment/post",
    async (comment: PROPS_COMMENT) => {
        const res = await axios.post(apiUrlComment, comment,{
            headers: {
                "Content-Type": "application/json",
                Authorization: `JWT ${localStorage.localJWT}`
            }
        });
        return res.data;
});


export const postSlice = createSlice({
  name: 'post',
  initialState: {
      isLoadingPost: false,
      openNewPost: false,
      posts: [
          {
              id:0,
              title: "",
              userPost: 0,
              created_on: "",
              img: "",
              liked: [0],
          }
      ],
      comments: [
          {
              id: 0,
              text: "",
              userComment: 0,
              post: 0,
          }
        ]
  },
  reducers: {
      fetchPostStart(state) {
          state.isLoadingPost = true;
      },
      fetchPostEnd(state) {
          state.isLoadingPost = false;
      },
      setOpenNewPost(state) {
          state.openNewPost = true;
      },
      resetOpenNewPost(state) {
          state.openNewPost = false;
      },
  },

  // 必要に応じて追加のReducerを指定できる
  extraReducers: (builder) => {
    builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
        return {
            ...state,
            posts: action.payload
        }
    });
    builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
        return {
            ...state,
            posts: [...state.posts, action.payload],
        }
    });
    builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
        return {
            ...state,
            comments: action.payload
        }
    });
    builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
        return {
            ...state,
            comments: [...state.comments, action.payload],
        }
    });
    builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
        return {
            ...state,
            posts: state.posts.map((post) =>
             post.id === action.payload.id ? action.payload : post
            ),
        }
    });
  }
});



// reducerに関するものを登録
export const { 
    fetchPostStart, 
    fetchPostEnd, 
    setOpenNewPost, 
    resetOpenNewPost, 
} = postSlice.actions;

// 各スライスのstateにアクセスするための関数
export const selectIsLoadingPost = (state: RootState) => state.post.isLoadingPost;
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost;
export const selectPosts = (state: RootState) => state.post.posts;
export const selectComments = (state: RootState) => state.post.comments;

export default postSlice.reducer;