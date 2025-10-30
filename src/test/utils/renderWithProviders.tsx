import React from 'react'
import { render } from '@testing-library/react'
import { makeStore, makeProviders } from './testStore'

export function renderWithStore(ui: React.ReactElement, preloaded?: Parameters<typeof makeStore>[0]) {
    const store = makeStore(preloaded)
    const Wrapper = makeProviders(store)
    return { ...render(<Wrapper>{ui}</Wrapper>), store }
}
