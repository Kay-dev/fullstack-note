import { useSelector, useDispatch } from "react-redux";
import {useMutation, useQueryClient, useQuery} from '@tanstack/react-query'
import {getAllNotes} from "../services/notes"
import {updateNote} from "../services/notes"

const Note = ({ note, handleClick }) => {
  return (
    <li onClick={handleClick}>
      {note.content}
      <strong> {note.important ? 'important' : ''}</strong>
    </li>
  )
}



const Notes = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
      mutationFn: updateNote,
      // disable old data in cache
      onSuccess: () => {
          queryClient.invalidateQueries({queryKey: ['notes']})
      }
  })

  const result = useQuery({
    queryKey: ['notes'],
    queryFn: getAllNotes
  })
  const data = result.data ? result.data : []
  const notes = useSelector(state => {
    switch (state.filter) {
      case 'IMPORTANT':
        return data.filter(note => note.important)
      case 'NONIMPORTANT':
        return data.filter(note => !note.important)
      default:
      case 'ALL':
        return data
    }
  })

  return (
    <div>
      <ul>
        {notes.map(note => (
          <Note
            key={note.id}
            note={note}
            handleClick={() => mutation.mutate({id:note.id,newObj:{...note, important: !note.important}})}
          />
        ))}
      </ul>
    </div>
  )
}


export default Notes