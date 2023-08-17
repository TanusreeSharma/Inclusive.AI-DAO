import { Box } from '@mui/material'

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
      px={6}
    >
      {children}
    </Box>
  )
}