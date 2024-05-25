import {configureStore} from '@reduxjs/toolkit'
import filterReducer from './modules/filterStore'

const store = configureStore({
    reducer: {
        filter: filterReducer
    }
})

export default store