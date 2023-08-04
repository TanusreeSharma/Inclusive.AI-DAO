import { Typography } from '@mui/material'

import { useAppSelector } from '@/hooks'
import { selectProfile } from '@/slices/profile'

export default function ProfilePage() {
  const userProfile = useAppSelector(selectProfile)

  return (
    <>
      <Typography variant="h6" fontWeight="bold" pb={2}>
        Profile
      </Typography>
      <Typography variant="body1" pb={2}>
        Name: {userProfile.name}
      </Typography>
      <Typography variant="body1" pb={2}>
        Email: {userProfile.email}
      </Typography>
    </>
  )
}
