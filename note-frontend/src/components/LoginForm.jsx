/* eslint-disable react/prop-types */
import { useState } from 'react'

const LoginForm = ({login}) => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async (event) => {
        event.preventDefault()
        login(username, password)
        setUsername('')
        setPassword('')
    }

    return (
        <div>
            <h2>Log in</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor="username">username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="password">password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                    />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    )
}

export default LoginForm
