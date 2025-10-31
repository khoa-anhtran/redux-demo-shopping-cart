import { AppTestStore, withCart } from '@/test/utils/testStore';
import { userLoggedOut, userLogined } from './authSlice';

describe("auth slice action tests", () => {
    let store: AppTestStore;

    beforeEach(() => {
        store = withCart({})
    })

    test("user login action", () => {
        store.dispatch(userLogined({ userId: 1, name: 'Trần Anh Khoa' }))
        expect(store.getState().auth.userId).toEqual(1)
        expect(store.getState().auth.name).toEqual('Trần Anh Khoa')
    })

    test("user logout action", () => {
        store.dispatch(userLoggedOut())
        expect(store.getState().auth.userId).toEqual(null)
        expect(store.getState().auth.name).toEqual(null)
    })
})

