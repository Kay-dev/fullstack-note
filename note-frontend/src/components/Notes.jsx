import { useSelector, useDispatch } from "react-redux";
import { toggleImportanceOf } from "../store/modules/noteStore";

const Note = ({ note, handleClick }) => {
  return (
    <li onClick={handleClick}>
      {note.content}
      <strong> {note.important ? 'important' : ''}</strong>
    </li>
  )
}

const Notes = () => {
  const notes = useSelector(state => {
    switch (state.filter) {
      case 'ALL':
        return state.notes
      case 'IMPORTANT':
        return state.notes.filter(note => note.important)
      case 'NONIMPORTANT':
        return state.notes.filter(note => !note.important)
      default:
        break;
    }
  })
  const dispatch = useDispatch();

  return (
    <div>
      <ul>
        {notes.map(note => (
          <Note 
          key={note.id} 
          note={note} 
          handleClick={() => dispatch(toggleImportanceOf(note.id))}
          />
        ))}
      </ul>
    </div>
  )
}

export default Notes