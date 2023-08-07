import {
  Avatar,
  Box,
  Breadcrumbs,
  Container,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { useAppSelector } from '@/hooks'
import { selectProfile } from '@/slices/profile'

const breadcrumbNameMap: Record<string, string> = {
  '/chat': 'Chat',
  '/profile': 'Profile',
}

export default function Topbar() {
  const router = useRouter()
  const userProfile = useAppSelector(selectProfile)

  const pathnames = router.pathname.split('/').filter((x) => x)

  return (
    <Box position="fixed" top={0} left={0} right={0} py={2} px={{ xs: 10, md: 11 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight="bold" color="rgb(80, 130, 235)">
          Inclusive AI
        </Typography>
        <Breadcrumbs>
          <Link component={NextLink} underline="hover" color="inherit" href="/">
            Home
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1
            const to = `/${pathnames.slice(0, index + 1).join('/')}`

            return last ? (
              <Typography color="text.primary" key={to}>
                {breadcrumbNameMap[to]}
              </Typography>
            ) : (
              <Link
                component={NextLink}
                underline="hover"
                color="inherit"
                href={to}
                key={to}
              >
                {breadcrumbNameMap[to]}
              </Link>
            )
          })}
        </Breadcrumbs>
        <Avatar alt={userProfile.name} src={userProfile.pfp} />
      </Stack>
    </Box>
  )
}
