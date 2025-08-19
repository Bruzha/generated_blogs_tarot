import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PostType } from '@/app/componets/ui/postTable/PostTable';

interface PostsState {
  data: PostType[];
  initialized: boolean;
}

const initialState: PostsState = {
  data: [],
  initialized: false,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<PostType[]>) {
      state.data = action.payload;
      state.initialized = true;
    },
    addPost(state, action: PayloadAction<PostType>) {
      state.data.unshift(action.payload);
    },
    updatePostStatus(state, action: PayloadAction<{ id: string; status: PostType['status'] }>) {
      const post = state.data.find(p => p._id === action.payload.id);
      if (post) post.status = action.payload.status;
    },
  },
});

export const { setPosts, addPost, updatePostStatus } = postsSlice.actions;
export default postsSlice.reducer;
