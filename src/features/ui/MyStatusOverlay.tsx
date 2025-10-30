import StatusOverlay from '@/component/StatusOverlay'
import { hide, selectStatusOverlay } from './statusOverlaySlice'
import { acceptConfirm, cancelConfirm, selectUIConfirm } from './uiConfirmSlice'
import { useDispatch, useSelector } from 'react-redux'

export default function MyStatusOverlay() {
    const s = useSelector(selectStatusOverlay)
    const dispatch = useDispatch()
    if (!s.open) return null

    return (
        <StatusOverlay
            open
            kind={s.kind}
            title={s.title}
            message={s.message}
            primaryText={s.primaryText}
            onClose={() => dispatch(hide())}
            // closeOnOverlay: loading should not close; others may.
            closeOnOverlay={s.kind !== 'loading'}
        />
    )
}
