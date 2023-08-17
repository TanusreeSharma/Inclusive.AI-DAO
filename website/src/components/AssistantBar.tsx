import { Box, Container, Link, Stack, Typography } from '@mui/material'
import { styled } from '@mui/system'
import NextLink from 'next/link'

import ShadowedBox from '@/components/ShadowedBox'

export function AssistantBar() {
  return (
    <Stack direction="column" justifyContent="stretch" spacing={3}>
      <ShadowedBox>
        <Typography variant="body1" fontStyle="italic">Value Question</Typography>
        <Typography variant="body1">
          How can models be trained to avoid harmful stereotypes and produce more inclusive representations?
        </Typography>
      </ShadowedBox>
      <ShadowedBox>
        <Typography variant="body1" fontStyle="italic">Assistant</Typography>
        <Typography variant="body1">
          
        </Typography>
      </ShadowedBox>
    </Stack>
  )
}
