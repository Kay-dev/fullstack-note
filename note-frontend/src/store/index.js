import {configureStore} from '@reduxjs/toolkit'
import noteReducer from './modules/noteStore'
import filterReducer from './modules/filterStore'

const store = configureStore({
    reducer: {
        notes: noteReducer,
        filter: filterReducer
    }
})

export default store