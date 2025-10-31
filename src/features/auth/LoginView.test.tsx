import { AppTestStore, makeProviders, withCart } from "@/test/utils/testStore"
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Header from "@/component/Header";
import LoginView from "./LoginView";
import ProductsView from "../products/ProductsView";

let store: AppTestStore;

const setup = () => {
    const Wrapper = makeProviders(store)
    render(<MemoryRouter initialEntries={['/login']}>
        <Routes>
            <Route path="/" element={<>
                <Header />
                <ProductsView />
            </>} />
            <Route path="/login" element={<LoginView />} />
        </Routes>
    </MemoryRouter>, { wrapper: Wrapper })
}

describe("user interact with login form", () => {
    beforeEach(() => {
        store = withCart({})

        setup()
    })

    test("sign in successfully when user click sign in btn", async () => {
        const user = { id: '1', name: 'Trần Anh Khoa' }

        // Select user
        const select = screen.getByRole('combobox', { name: /choose a user/i })

        await userEvent.selectOptions(select, user.id)

        // Click sign in button
        const button = screen.getByRole('button', { name: /sign in/i })
        await userEvent.click(button)

        const cartBtn = await screen.findByRole('button', { name: /cart/i })
        expect(cartBtn).toBeInTheDocument()
    })
})