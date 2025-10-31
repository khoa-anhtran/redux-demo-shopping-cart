import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { userLogined } from "./authSlice"
import { useGetUsersQuery } from "../users/usersSlice"
import { hide, showError, showLoading } from "../ui/statusOverlaySlice"

export default function LoginView() {

    const { data: users, isFetching } = useGetUsersQuery()

    const [selectedId, setSelectedId] = useState<string>('')
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const shownLoading = useRef(false)

    useEffect(() => {
        if (isFetching) {
            if (!shownLoading.current) {
                dispatch(showLoading('Loading …'))
                shownLoading.current = true
            }
        } else {
            if (shownLoading.current) {
                dispatch(hide())
                shownLoading.current = false
            }
        }
    }, [isFetching, dispatch])

    const onLogin = useCallback((selectedUser: any) => {
        const { id: userId, name } = selectedUser
        dispatch(userLogined({ userId: Number(userId), name }))
        navigate('/')

    }, [dispatch, navigate])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const selectedUser = users?.find(u => String(u.id) === selectedId)

        if (!selectedUser) return
        setSubmitting(true)
        try {
            // Simulate network delay
            await new Promise(r => setTimeout(r, 600))

            onLogin(selectedUser)
        } finally {
            setSubmitting(false)
        }
    }

    if (!users)
        return <></>


    return (
        <div className="login">
            <div className="login__card" role="region" aria-label="Login">
                <h1 className="login__title">{ }</h1>


                <form onSubmit={handleSubmit} className="login__form">
                    <div className="login__field">
                        <label htmlFor="user" className="login__label">Choose a user</label>
                        <select
                            id="user"
                            className="login__select"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="" disabled>Select an account…</option>
                            {users!.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>


                    <button
                        type="submit"
                        className="login__submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>


                <p className="login__hint">
                    This is a demo login: it only stores the selected user to <code>Redux </code>
                    or calls the provided <code>onLogin</code> callback.
                </p>
            </div>
        </div>
    )
}