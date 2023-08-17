import { Box, Link, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import NextLink from 'next/link'

type NavbarLinkTabProps = {
  href: string
  label: string
}

const StyledLink = styled(Link)({
  color: '#333',
  width: '100%',
  backgroundColor: 'rgb(247, 249, 252)',
  padding: '8px 20px',
  // borderRadius: 6,
  textDecoration: 'none',
  fontSize: '1.2rem',
  // transition: 'box-shadow 0.2s ease-in-out',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    // boxShadow: '0 0 20px 2px rgba(130, 130, 130, 0.13)',
    backgroundColor: 'rgb(201, 230, 252)',
  },
}) as typeof Link

function NavbarLinkTab(props: NavbarLinkTabProps) {
  return (
    <StyledLink component={NextLink} href={props.href} maxWidth={300}>
      <Typography variant="body1" fontWeight="bold" align="center">
        {props.label}
      </Typography>
    </StyledLink>
  )
}

export function Navbar(props: { isHidden: boolean }) {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      width="100%"
      display={props.isHidden ? 'none' : 'flex'}
      borderRadius={4}
      overflow="hidden"
    >
      <NavbarLinkTab href="/" label="Home" />
      <NavbarLinkTab href="/discuss" label="Discussion" />
      <NavbarLinkTab href="/vote" label="Vote" />
      <NavbarLinkTab href="/profile" label="Profile" />
    </Stack>
  )
}
