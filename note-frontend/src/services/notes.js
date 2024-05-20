import axios from "axios";
const url = "/api/notes"

let token;
const setToken = t => {
   token = `Bearer ${t}`
}

const getAll = async () => {
    const response = await axios.get(url)
    return response.data
}

const create = async (newObj) => {
    const config = {
        headers: { Authorization: token }
    }
    const response = await axios.post(url, newObj, config)
    return response.data
}

const update = async (id, newObj) => {
    const response = await axios.put(url + `/${id}`, newObj)
    return response.data
}

export default {
    setToken, getAll, create, update
}