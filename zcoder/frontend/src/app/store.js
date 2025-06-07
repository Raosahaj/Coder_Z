// src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../features/theme/themeSlice';
import userReducer from '../features/userSlice'; // Your existing user slice

export default configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer, // Keep existing reducers
  },
});
