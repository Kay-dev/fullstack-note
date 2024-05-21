import { useState } from 'react'

const NoteForm = ({ createNote }) => {

    const [newNote, setNewNote] = useState("")

    const addNote = (event) => {
        event.preventDefault();
        const noteObj = { content: newNote, important: Math.random() < 0.5 }
        createNote(noteObj)
        setNewNote("")
    }

    const changeNewNote = (event) => {
        setNewNote(event.target.value)
    }

    return (
        <div>
            <h2>Add A New Note</h2>
            <form onSubmit={addNote}>
                <input type="text" value={newNote} onChange={changeNewNote} />
                <button type="submit">Save</button>
            </form>
        </div>
    )
}

export default NoteForm