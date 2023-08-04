import { Box, Stack } from '@mui/material'

import Navbar from '@/components/Navbar'

export function MainLayout({
  children,
  className,
}: React.PropsWithChildren & { className?: string }) {
  return (
    <Box
      height="100vh"
      maxHeight="100vh"
      overflow="hidden"
      className={className}
      pt={8}
      pb={3}
      px={8}
    >
      {children}
    </Box>
  )
}

export function BodyLayout({ children }: React.PropsWithChildren) {
  return (
    <Stack
      position="relative"
      height="100%"
      bgcolor="#fff"
      borderRadius={6}
      py={{ xs: 2, sm: 4 }}
      px={{ xs: 3, sm: 4 }}
      direction="row"
      alignItems="flex-start"
      justifyContent="flex-start"
      spacing={6}
    >
      <Navbar />
      <Box width="100%" height="100%">
        {children}
      </Box>
    </Stack>
  )
}
