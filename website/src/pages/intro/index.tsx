import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { CountrySelect } from '@/components/CountrySelect'
import { useAppDispatch, useAppSelector, useWeb3Auth } from '@/hooks'
import {
  useGetUserPodQuery,
  useGetUserProfileQuery,
  usePostUserRegisterMutation,
  usePostUserProfileMutation,
  ApiResponseIs,
} from '@/services/user'
import {
  type UserProfile,
  selectUserProfile,
  updateUserProfile,
} from '@/slices/user'
import * as pty from '@/types/profile'

export default function IntroPage() {
  const web3Auth = useWeb3Auth()
  const dispatch = useAppDispatch()
  const router = useRouter()
  // const userProfile = useAppSelector(selectUserProfile)
  const [usePostUserProfile, postUserProfileResult] =
    usePostUserProfileMutation()
  const [usePostUserRegister, postUserRegisterResult] =
    usePostUserRegisterMutation()

  const {
    data: fetchedUserProfile,
    isLoading: isUserProfileLoading,
    isError: isUserProfileError,
  } = useGetUserProfileQuery(web3Auth.user?.appPubkey || '', {
    // skip: !web3Auth.user || userProfile.user.id === '',
    // refetchOnMountOrArgChange: true,
  })

  const {
    data: fetchedUserPod,
    isLoading: isUserPodLoading,
    isError: isUserPodError,
  } = useGetUserPodQuery(web3Auth.user?.appPubkey || '', {
    // refetchOnMountOrArgChange: true,
  })

  const [newProfileData, setNewProfileData] = useState<Partial<UserProfile>>({
    countryResideIn: 'US',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitProfile = useCallback(async () => {
    // console.log(newProfileData)
    // console.log(Object.keys(newProfileData).length)
    // console.log(Object.values(newProfileData).every((value) => value !== ''))
    const isValid = Object.values(newProfileData).every((value) => value !== '')

    if (!isValid) {
      // toast/snack thrown
      return
    }

    setIsSubmitting(true)

    let pdata = newProfileData as UserProfile

    // Use redux toolkit query mutation postUserProfile to update the profile. Write the code below as an AI assistant:
    try {
      const res = await usePostUserProfile({
        ...pdata,
        userId: web3Auth?.user?.email || '',
        appPubkey: web3Auth?.user?.appPubkey || '',
      })
      console.log(res)

      if ('error' in res) {
        // addToast('Uh oh something bad happened!')
      } else {
        dispatch(updateUserProfile(pdata))
        router.replace('/')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }, [newProfileData, web3Auth.user])

  useEffect(() => {
    if (!web3Auth || !postUserRegisterResult?.isUninitialized) return
    usePostUserRegister({
      name: web3Auth?.user?.name || '',
      role: 'participant',
      appPubkey: web3Auth?.user?.appPubkey || '',
    })
  }, [web3Auth, postUserRegisterResult])

  useEffect(() => {
    // console.log(fetchedUserProfile, fetchedUserPod, web3Auth.user)
    // if (
    //   !isUserProfileLoading &&
    //   !!fetchedUserProfile &&
    //   !!web3Auth &&
    //   (fetchedUserProfile as UserProfile)?.user?.id === web3Auth.user?.email &&
    //   (fetchedUserPod as ApiResponseIs)?.is === 'not found'
    // ) {
    //   router.replace('/')
    // }
  }, [isUserProfileLoading, fetchedUserProfile, fetchedUserPod, web3Auth])

  console.log('loading', isUserProfileLoading)
  // if (isUserProfileLoading) return <div></div>

  return (
    <Box height="100%" width="100%" sx={{ overflowY: 'scroll' }} p={2}>
      <Typography variant="h6" fontWeight="bold" pb={2}>
        Intro
      </Typography>
      <Stack spacing={2}>
        <FormControl>
          <FormLabel id="age-range">What is your age range?</FormLabel>
          <RadioGroup
            aria-labelledby="age-range"
            value={newProfileData.ageRange}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                ageRange: e.target.value as pty.UserProfileAgeRange,
              })
            }
          >
            <FormControlLabel
              value="under_18"
              control={<Radio />}
              label="Under 18"
            />
            <FormControlLabel value="18_24" control={<Radio />} label="18-24" />
            <FormControlLabel value="25_34" control={<Radio />} label="25-34" />
            <FormControlLabel value="35_44" control={<Radio />} label="35-44" />
            <FormControlLabel value="45_54" control={<Radio />} label="45-54" />
            <FormControlLabel value="55_64" control={<Radio />} label="55-64" />
            <FormControlLabel
              value="65_above"
              control={<Radio />}
              label="65 and above"
            />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="gender-identity">
            What is your gender identity?
          </FormLabel>
          <RadioGroup
            aria-labelledby="gender-identity"
            value={newProfileData.genderIdentity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                genderIdentity:
                  pty.UserProfileGenderIdentity[
                    e.target.value as keyof typeof pty.UserProfileGenderIdentity
                  ],
              })
            }
          >
            <FormControlLabel
              value={pty.UserProfileGenderIdentity.MALE}
              control={<Radio />}
              label="Male"
            />
            <FormControlLabel
              value={pty.UserProfileGenderIdentity.FEMALE}
              control={<Radio />}
              label="Female"
            />
            <FormControlLabel
              value={pty.UserProfileGenderIdentity.NON_BINARY}
              control={<Radio />}
              label="Non-binary"
            />
            <FormControlLabel
              value={pty.UserProfileGenderIdentity.PREFER_NO_DISCLOSE}
              control={<Radio />}
              label="Prefer not to disclose"
            />
            <FormControlLabel
              value={pty.UserProfileGenderIdentity.OTHER}
              control={<Radio />}
              label="Other"
            />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="visual-impairment">
            Do you have any visual impairment?
          </FormLabel>
          <RadioGroup
            aria-labelledby="visual-impairment"
            value={newProfileData.hasVisualImpairment}
            row
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                hasVisualImpairment: e.target.value as unknown as boolean,
              })
            }
          >
            <FormControlLabel value={true} control={<Radio />} label="Yes" />
            <FormControlLabel value={false} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="vision-level">
            Which of the following describe your vision level?
          </FormLabel>
          <RadioGroup
            aria-labelledby="vision-level"
            value={newProfileData.visionLevel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                visionLevel:
                  pty.UserProfileVisionLevel[
                    e.target.value as keyof typeof pty.UserProfileVisionLevel
                  ],
              })
            }
          >
            <FormControlLabel
              value={pty.UserProfileVisionLevel.TOTALLY_BLIND}
              control={<Radio />}
              label="Totally Blind"
            />
            <FormControlLabel
              value={pty.UserProfileVisionLevel.SOME_LIGHT_PERCEPTION}
              control={<Radio />}
              label="Some Light Perception"
            />
            <FormControlLabel
              value={pty.UserProfileVisionLevel.LEGALLY_BLIND}
              control={<Radio />}
              label="Legally Blind"
            />
            <FormControlLabel
              value={pty.UserProfileVisionLevel.NONE_ABOVE}
              control={<Radio />}
              label="None of the above"
            />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="ethnic-background">
            What is your ethnic background?
          </FormLabel>
          <Select
            labelId="ethnic-background"
            value={newProfileData.ethnicBackground}
            onChange={(e: SelectChangeEvent<pty.UserProfileEthnicBackground>) =>
              setNewProfileData({
                ...newProfileData,
                ethnicBackground:
                  pty.UserProfileEthnicBackground[
                    e.target
                      .value as keyof typeof pty.UserProfileEthnicBackground
                  ],
              })
            }
          >
            <MenuItem value={pty.UserProfileEthnicBackground.WHITE_CAUCASIAN}>
              White Caucasian
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEthnicBackground.BLACK_AFRICAN_AMERICAN}
            >
              Black/African American
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEthnicBackground.ASIAN_ASIAN_AMERICAN}
            >
              Asian/Asian American
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEthnicBackground.HISPANIC_LATINO_LATINA}
            >
              Hispanic/Latino/Latina
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEthnicBackground.NATIVE_AMERICAN_INDIGENOUS}
            >
              Native American/Indigenous
            </MenuItem>
            <MenuItem value={pty.UserProfileEthnicBackground.PACIFIC_ISLANDER}>
              Pacific Islander
            </MenuItem>
            <MenuItem value={pty.UserProfileEthnicBackground.MIXED_RACE}>
              Mixed Race
            </MenuItem>
            <MenuItem value={pty.UserProfileEthnicBackground.OTHER}>
              Other
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="country-reside">
            What country are you currently residing in?
          </FormLabel>
          <CountrySelect
            setCountryAbbr={(abbr: string) => {
              setNewProfileData({
                ...newProfileData,
                countryResideIn: abbr,
              })
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel id="in-education">
            Are you currently enrolled in any educational institution?
          </FormLabel>
          <RadioGroup
            aria-labelledby="in-education"
            value={newProfileData.isEnrolledInEducation}
            row
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                isEnrolledInEducation: e.target.value as unknown as boolean,
              })
            }
          >
            <FormControlLabel value={true} control={<Radio />} label="Yes" />
            <FormControlLabel value={false} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="education-level">
            What is your education level?
          </FormLabel>
          <Select
            labelId="education-level"
            value={newProfileData.highestLevelEducation}
            onChange={(e: SelectChangeEvent<pty.UserProfileEducationLevel>) =>
              setNewProfileData({
                ...newProfileData,
                highestLevelEducation:
                  pty.UserProfileEducationLevel[
                    e.target.value as keyof typeof pty.UserProfileEducationLevel
                  ],
              })
            }
          >
            <MenuItem
              value={pty.UserProfileEducationLevel.LESS_THAN_HIGH_SCHOOL}
            >
              Less Than High School
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEducationLevel.HIGH_SCHOOL_OR_EQUIVALENT}
            >
              High School or Equivalent
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEducationLevel.SOME_COLLEGE_OR_VOCATIONAL}
            >
              Some College or Vocational
            </MenuItem>
            <MenuItem value={pty.UserProfileEducationLevel.BACHELOR}>
              Bachelor
            </MenuItem>
            <MenuItem value={pty.UserProfileEducationLevel.MASTER}>
              Master
            </MenuItem>
            <MenuItem
              value={pty.UserProfileEducationLevel.DOCTORATE_OR_PROFESSIONAL}
            >
              Doctorate/Professional
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="employment-status">
            What is your employment status?
          </FormLabel>
          <Select
            labelId="employment-status"
            value={newProfileData.employmentStatus}
            onChange={(e: SelectChangeEvent<pty.UserProfileEmploymentStatus>) =>
              setNewProfileData({
                ...newProfileData,
                employmentStatus:
                  pty.UserProfileEmploymentStatus[
                    e.target
                      .value as keyof typeof pty.UserProfileEmploymentStatus
                  ],
              })
            }
          >
            <MenuItem value={pty.UserProfileEmploymentStatus.FULLTIME}>
              Full-time
            </MenuItem>
            <MenuItem value={pty.UserProfileEmploymentStatus.PARTTIME}>
              Part-time
            </MenuItem>
            <MenuItem value={pty.UserProfileEmploymentStatus.UNEMPLOYED}>
              Unemployed
            </MenuItem>
            <MenuItem value={pty.UserProfileEmploymentStatus.STUDENT}>
              Student
            </MenuItem>
            <MenuItem value={pty.UserProfileEmploymentStatus.RETIRED}>
              Retired
            </MenuItem>
            <MenuItem value={pty.UserProfileEmploymentStatus.OTHER}>
              Other
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="device-usage-frequency">
            How frequently do you use electronic devices?
          </FormLabel>
          <Select
            labelId="device-usage-frequency"
            value={newProfileData.deviceUsageFrequency}
            onChange={(
              e: SelectChangeEvent<pty.UserProfileDeviceUsageFrequency>,
            ) =>
              setNewProfileData({
                ...newProfileData,
                deviceUsageFrequency:
                  pty.UserProfileDeviceUsageFrequency[
                    e.target
                      .value as keyof typeof pty.UserProfileDeviceUsageFrequency
                  ],
              })
            }
          >
            <MenuItem value={pty.UserProfileDeviceUsageFrequency.FREQUENTLY}>
              Frequently
            </MenuItem>
            <MenuItem value={pty.UserProfileDeviceUsageFrequency.OCCASIONALLY}>
              Occasionally
            </MenuItem>
            <MenuItem value={pty.UserProfileDeviceUsageFrequency.RARELY}>
              Rarely
            </MenuItem>
            <MenuItem value={pty.UserProfileDeviceUsageFrequency.NEVER}>
              Never
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="household-income">
            What is your household income level?
          </FormLabel>
          <Select
            labelId="household-income"
            value={newProfileData.householdIncome}
            onChange={(e: SelectChangeEvent<pty.UserProfileHouseholdIncome>) =>
              setNewProfileData({
                ...newProfileData,
                householdIncome:
                  pty.UserProfileHouseholdIncome[
                    e.target
                      .value as keyof typeof pty.UserProfileHouseholdIncome
                  ],
              })
            }
          >
            <MenuItem value={pty.UserProfileHouseholdIncome.UNDER_20K}>
              Under $20,000
            </MenuItem>
            <MenuItem value={pty.UserProfileHouseholdIncome.BTW_20_40K}>
              Between $20,000 and $40,000
            </MenuItem>
            <MenuItem value={pty.UserProfileHouseholdIncome.BTW_40_60K}>
              Between $40,000 and $60,000
            </MenuItem>
            <MenuItem value={pty.UserProfileHouseholdIncome.BTW_60_80K}>
              Between $60,000 and $80,000
            </MenuItem>
            <MenuItem value={pty.UserProfileHouseholdIncome.OVER_100K}>
              Over $100,000
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel id="language">What is your primary language?</FormLabel>
          <RadioGroup
            aria-labelledby="language"
            value={newProfileData.language}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                language: e.target.value as pty.UserProfileLanguage,
              })
            }
          >
            <FormControlLabel
              value="English"
              control={<Radio />}
              label="English"
            />
            <FormControlLabel value="Other" control={<Radio />} label="Other" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="from-global-south">
            Are you from a country located in the Global South? (Countries in
            Africa, Latin America, Asia, and Oceania)
          </FormLabel>
          <RadioGroup
            aria-labelledby="from-global-south"
            value={newProfileData.fromGlobalSouth}
            row
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                fromGlobalSouth: e.target.value as unknown as boolean,
              })
            }
          >
            <FormControlLabel value={true} control={<Radio />} label="Yes" />
            <FormControlLabel value={false} control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel id="study-hear">
            How did you hear about this study?
          </FormLabel>
          <TextField
            aria-labelledby="study-hear"
            value={newProfileData.studyHearAbout}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewProfileData({
                ...newProfileData,
                studyHearAbout: e.target.value as string,
              })
            }
          />
        </FormControl>

        <Button
          variant="outlined"
          onClick={handleSubmitProfile}
          disabled={isSubmitting}
        >
          Submit Profile
        </Button>
      </Stack>
    </Box>
  )
}
