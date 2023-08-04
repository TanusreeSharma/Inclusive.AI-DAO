import { Box, Container, Stack, Typography } from '@mui/material'

export default function Topbar() {
  return (
    <Box position="fixed" top={0} left={0} right={0} py={2}>
      <Container maxWidth="lg">
        <Stack alignItems="center" justifyContent="center">
          <Typography variant="h6" fontWeight="bold" color="rgb(80, 130, 235)">
            Inclusive AI
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
