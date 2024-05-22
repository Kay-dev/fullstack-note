import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import Notes from './components/Notes'
import noteService from './services/notes'
import Notification from './components/Notification'
import loginService from './services/login'
import Toggleble from './components/Toggleble'
import LoginForm from './components/LoginForm'
import NoteForm from './components/NoteForm'
import { fetchNotes,addNote } from './store/modules/noteStore'
import VisibilityFilter from './components/VisibilityFilter'

function App() {

  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)
  const noteFormRef = useRef()

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchNotes())
  }, [])

  // check if user is logged in and set token
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])


  const login = async (username, password) => {
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
    } catch (error) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }
  }

  const createNote = async (note) => {
    noteFormRef.current.toggleVisibility()
    dispatch(addNote(note))
  }

  const logout = () => {
    window.localStorage.removeItem('loggedUser')
    setUser(null)
  }


  const loginForm = () => (
    <Toggleble key="login" buttonLabel="log in">
      <LoginForm login={login} />
    </Toggleble>
  )

  const noteForm = () => (
    <Toggleble key="note"  buttonLabel="new note" ref={noteFormRef}>
      <NoteForm createNote={createNote}/>
    </Toggleble>
  )

  return (
    <>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      {user === null ? loginForm() : noteForm()}
      {user && <button onClick={logout}>log out</button>}
      <VisibilityFilter/>
      <Notes/>
    </>
  )
}



export default App
