import axios from "axios";
const url = "/api/notes"

let token;

export const setToken = t => {
   token = `Bearer ${t}`
}

export const getAllNotes = async () =>{ 
    const response = await axios.get(url)
    return response.data
}

export const createNote = async (newObj) => {
    const config = {
        headers: { Authorization: token }
    }
    const response = await axios.post(url, newObj, config)
    return response.data
}

export const updateNote = async ({id, newObj}) => {
    const response = await axios.put(url + `/${id}`, newObj)
    return response.data
}
