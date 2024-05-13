import { useEffect, useState } from 'react'
import './App.css'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification'

function App() {

  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(response => {
        setNotes(response.data)
      })
  }, [])

  const addNote = (event) => {
    event.preventDefault();
    const noteObj = { content: newNote, important: Math.random() < 0.5 }

    noteService.create(noteObj)
      .then(response => {
        setNotes([...notes, response.data])
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
      .then(response => {
        setNotes(notes.map(note => note.id !== id ? note : response.data))
      })
      .catch(error => {
        setErrorMessage(`the note ${filterNote.content} was already removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(note => note.id !== id))
      })
  }

  return (
    <>
      <h1>Notes</h1>
      <Notification message={errorMessage}/>

      <button onClick={toogleShowAll}>show {showAll ? 'Important' : 'All'}</button>
      <ul>
        {notesToShow.map(note => (
          <Note key={note.id} note={note} toggleImportance={() => { toggleImportance(note.id) }} />
        ))}
      </ul>

      <form onSubmit={addNote}>
        <input type="text" value={newNote} onChange={changeNewNote} />
        <button type="submit">Save</button>
      </form>
    </>
  )
}



export default App
