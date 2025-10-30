// ConfirmDialogRedux.tsx
import { acceptConfirm, cancelConfirm, selectUIConfirm } from './uiConfirmSlice'
import { ConfirmDialog } from '@/component/ConfirmDialog'
import { useDispatch, useSelector } from 'react-redux'

export default function MyConfirmDialog() {
    const d = useSelector(selectUIConfirm)
    const dispatch = useDispatch()
    if (!d.open) return null

    return (
        <ConfirmDialog
            open
            title={d.title}
            description={d.description}
            confirmText={d.confirmText}
            cancelText={d.cancelText}
            onConfirm={() => dispatch(acceptConfirm())}
            onCancel={() => dispatch(cancelConfirm())}
        />
    )
}
