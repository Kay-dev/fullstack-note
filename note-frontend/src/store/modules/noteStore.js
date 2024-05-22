import { createSlice } from '@reduxjs/toolkit'
import noteService from '../../services/notes'


const noteSlice = createSlice({
    name: 'notes',
    initialState: [],
    reducers: {
        setNotes(state, action) {
            return state.concat(action.payload)
        },
        appendNote(state, action) {
            return state.concat(action.payload)
        },
        toggleImportanceOf(state, action) {
            const id = action.payload
            const noteToChange = state.find(n => n.id === id)
            const changedNote = { ...noteToChange, important: !noteToChange.important }

            return state.map(note => note.id !== id ? note : changedNote)
        }
    }
})

const {setNotes, appendNote} = noteSlice.actions;
const fetchNotes = () => {
    return async dispatch => {
        const notes = await noteService.getAll()
        dispatch(setNotes(notes))
    }
}

const addNote = (note) => {
    return async dispatch => {
        const newNote = await noteService.create(note)
        dispatch(appendNote(newNote))
    }
}

export {fetchNotes, addNote}
export const { toggleImportanceOf } = noteSlice.actions
export default noteSlice.reducer