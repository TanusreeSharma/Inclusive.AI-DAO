import { CircularProgress, Stack, Typography } from '@mui/material'

export function LoadingScreen() {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      position="fixed"
      top={0}
      right={0}
      bottom={0}
      left={0}
      height="100vh"
      width="100vw"
      bgcolor="#f7f9fc"
      zIndex={99999}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        pb={4}
        color="rgb(80, 130, 235)"
      >
        Inclusive AI
      </Typography>
      <CircularProgress size={60} thickness={5} sx={{ mb: 10 }} />
    </Stack>
  )
}
