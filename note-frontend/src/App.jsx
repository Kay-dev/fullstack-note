import { useEffect, useState, useRef } from 'react'
import './App.css'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification'
import loginService from './services/login'
import Toggleble from './components/Toggleble'
import LoginForm from './components/LoginForm'
import NoteForm from './components/NoteForm'

function App() {

  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)

  const noteFormRef = useRef()

  useEffect(() => {
    noteService
      .getAll()
      .then(data => {
        setNotes(data)
      })
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
    const data = await noteService.create(note)
    setNotes([...notes, data])
  }


  const notesToShow = showAll ? notes : notes.filter(note => note.important === true)

  const toogleShowAll = () => {
    setShowAll(!showAll)
  }

  const toggleImportance = (id) => {
    const filterNote = notes.find(note => note.id === id)
    // copy a new note object and change the importance
    const changedNote = { ...filterNote, important: !filterNote.important }
    // update serverside data and re-render
    noteService.update(id, changedNote)
      .then(data => {
        setNotes(notes.map(note => note.id !== id ? note : data))
      })
      .catch(() => {
        setErrorMessage(`the note ${filterNote.content} was already removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(note => note.id !== id))
      })
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
    <Toggleble key="note" buttonLabel="new note" ref={noteFormRef}>
      <NoteForm createNote={createNote}/>
    </Toggleble>
  )

  return (
    <>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      {user === null ? loginForm() : noteForm()}
      <button onClick={toogleShowAll}>show {showAll ? 'Important' : 'All'}</button>
      {user && <button onClick={logout}>log out</button>}
      <ul>
        {notesToShow.map(note => (
          <Note key={note.id} note={note} toggleImportance={() => { toggleImportance(note.id) }} />
        ))}
      </ul>

    </>
  )
}



export default App
