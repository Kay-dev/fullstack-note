import { useDispatch } from 'react-redux'
import { setFilter } from '../store/modules/filterStore'

const VisibilityFilter = () => {
    const dispatch = useDispatch()
  
    return (
      <div>
        all    
        <input 
          type="radio" 
          name="filter" 
          onChange={() => dispatch(setFilter('ALL'))}
        />
        important   
        <input
          type="radio"
          name="filter"
          onChange={() => dispatch(setFilter('IMPORTANT'))}
        />
        nonimportant 
        <input
          type="radio"
          name="filter"
          onChange={() => dispatch(setFilter('NONIMPORTANT'))}
        />
      </div>
    )
  }
  
  export default VisibilityFilter