import { Box, Container, Link, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import NextLink from 'next/link'

import ShadowedBox from '@/components/ShadowedBox'

// import Link from '@/components/Link'

type NavbarLinkPillProps = {
  href: string
  label: string
}

const StyledLink = styled(Link)({
  color: '#333',
  width: '100%',
  backgroundColor: 'rgb(247, 249, 252)',
  padding: '8px 20px',
  borderRadius: 6,
  textDecoration: 'none',
  fontSize: '1.2rem',
  // transition: 'box-shadow 0.2s ease-in-out',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover': {
    // boxShadow: '0 0 20px 2px rgba(130, 130, 130, 0.13)',
    backgroundColor: 'rgb(201, 230, 252)',
  },
}) as typeof Link

function NavbarLinkPill(props: NavbarLinkPillProps) {
  return (
    <StyledLink component={NextLink} href={props.href}>
      <Typography variant="body1" fontWeight="bold">
        {props.label}
      </Typography>
    </StyledLink>
  )
}

export default function Navbar() {
  return (
    <Stack direction="column" spacing={1} width={240}>
      <NavbarLinkPill href="/chat" label="Chat" />
      <NavbarLinkPill href="/profile" label="Profile" />
      <ShadowedBox>
        <Typography variant="body1">
          <i>Value Question</i>: How can models be trained to avoid harmful
          stereotypes and produce more inclusive representations?
        </Typography>
      </ShadowedBox>
    </Stack>
  )
}
