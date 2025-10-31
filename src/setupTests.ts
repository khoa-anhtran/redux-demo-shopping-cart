// import dependencies
import React from 'react'

// import API mocking utilities from Mock Service Worker
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { server } from '@/test/msw/server'

// import react-testing methods
import { render, fireEvent, screen, renderHook } from '@testing-library/react'

// add custom jest matchers from jest-dom
import '@testing-library/jest-dom'

import 'whatwg-fetch' // adds fetch, Request, Response, Headers to jsdom

import productsSlice, { Product, useGetProductsQuery } from "@/features/products/productsSlice"
import uiReducer from "@/features/ui/uiConfirmSlice"
import statusOverlayReducer from "@/features/ui/statusOverlaySlice"

import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import Header from './component/Header'
import CartView from './features/cart/CartView'
import ProductsView from './features/products/ProductsView'
import MyConfirmDialog from './features/ui/MyConfirmDialog'
import MyStatusOverlay from './features/ui/MyStatusOverlay'
import { JSX } from 'react'
import LoginView from './features/auth/LoginView'
import { TextEncoder, TextDecoder } from 'util'
    ; (global as any).TextEncoder = TextEncoder
    ; (global as any).TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder


// MSW lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
