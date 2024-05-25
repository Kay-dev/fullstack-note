import {createNote} from '../services/notes';
import {useMutation, useQueryClient} from '@tanstack/react-query'

const NoteForm = () => {

    const queryClient = useQueryClient()

    const newNoteMutation = useMutation({
        mutationFn: createNote,
        // disable old data in cache
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['notes']})
        }
    })

    const handleSubmitNote = (event) => {
        event.preventDefault();
        const content = event.target.note.value
        event.target.note.value=''
        const noteObj = { content: content, important: Math.random() < 0.5 }
        newNoteMutation.mutate(noteObj)
    }


    return (
        <div>
            <h2>Add A New Note</h2>
            <form onSubmit={handleSubmitNote}>
                <input name="note" type="text"/>
                <button type="submit">Add</button>
            </form>
        </div>
    )
}

export default NoteForm