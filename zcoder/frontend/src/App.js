import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Main from './components/Main';
import Question from './components/AddQuestion/Question';
import ViewQuestion from './components/ViewQuestion';
import Auth from './components/Auth';
import { login, logout, selectUser } from './features/userSlice';
import { useSelector, useDispatch } from 'react-redux';
import { auth } from './firebase';
import Calendar from './components/Calendar';
import Profile from './components/Profile/Profile';
import CodeEditor from './components/CodeEditor/CodeEditor';
import ChatRoom from './components/ChatRoom/ChatRoom';
import ThemeToggle from './components/ThemeToggle';

function PrivateRoute({ element: Element, ...rest }) {
  const user = useSelector(selectUser);

  return user ? <Element {...rest} /> : <Navigate to="/auth" />;
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const currentTheme = useSelector((state) => state.theme?.currentTheme);

  // Set theme on initial load and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        dispatch(login({
          uid: authUser.uid,
          photo: authUser.photoURL,
          displayName: authUser.displayName,
          email: authUser.email
        }));
      } else {
        dispatch(logout());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="App">
      <Router>
        <Header>
          <ThemeToggle />
        </Header>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute element={Main} />} />
          <Route path="/add-question" element={<PrivateRoute element={Question} />} />
          <Route path="/question" element={<PrivateRoute element={ViewQuestion} />} />
          <Route path="/calendar" element={<PrivateRoute element={Calendar} />} />
          <Route path="/profile" element={<PrivateRoute element={Profile} />} />
          <Route path="/zcoderIDE" element={<PrivateRoute element={CodeEditor} />} />
          <Route path="/chatRoom" element={<PrivateRoute element={ChatRoom} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
