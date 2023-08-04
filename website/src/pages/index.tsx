'use client'

import { Box, Typography } from '@mui/material'
import Router from 'next/router'
import { useEffect, useState } from 'react'

export default function IndexPage() {
  useEffect(() => {
    Router.push('/chat')
  })

  return <></>
}
