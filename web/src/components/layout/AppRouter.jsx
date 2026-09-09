import React from 'react'
import { Route, Routes } from 'react-router-dom'

import { Dashboard } from '../../scenes/dashboard/Dashboard'
import { Assets } from '../../scenes/assets/Assets'
import { Contributions } from '../../scenes/contributions/Contributions'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/contributions" element={<Contributions />} />
    </Routes>
  )
}
