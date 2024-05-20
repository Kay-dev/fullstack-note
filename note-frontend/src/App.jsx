import { useEffect, useState } from 'react'
import './App.css'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification'
import loginService from './services/login'

function App() {

  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

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

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000);
    }
  }

  const addNote = (event) => {
    event.preventDefault();
    const noteObj = { content: newNote, important: Math.random() < 0.5 }

    noteService.create(noteObj)
      .then(data => {
        setNotes([...notes, data])
        setNewNote("")
      })
  }

  const changeNewNote = (event) => {
    setNewNote(event.target.value)
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
    <form onSubmit={handleLogin}>
      <div>
        <label htmlFor="username">username:</label>
        <input
          type="text"
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">password:</label>
        <input
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input type="text" value={newNote} onChange={changeNewNote} />
      <button type="submit">Save</button>
    </form>
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
