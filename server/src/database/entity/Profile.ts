import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import AppDataSource from '@/database/data-source'
import { User } from '@/database/entity'
import * as ety from '@/database/entity-types'
import { CreateUserProfileParams } from '@/types'

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @OneToOne((type) => User, (user) => user.profile)
  @JoinColumn() // Profile owns the relationship, have a foreign key column named `user`
  user: User

  //
  // Questions
  //

  // What is your age range?
  // below 18 years (q: under the age of 18)
  // 18-24 years
  // 25-34 years
  // 35-44 years
  // 45-54 years
  // 55-64 years
  // 65 years and above (q: older adult)
  @Column({
    type: 'enum',
    enum: ['under_18', '18_24', '25_34', '35_44', '45_54', '55_64', '65_up'], // values of ProfileAgeRange
    default: '18_24'
  })
  ageRange: ety.ProfileAgeRange

  // What is your gender identity?
  // Male
  // Female
  // Non-binary
  // Prefer not to disclose
  // Other (please specify)
  @Column({
    type: 'enum',
    enum: ety.ProfileGenderIdentity,
    default: ety.ProfileGenderIdentity.OTHER
  })
  genderIdentity: ety.ProfileGenderIdentity

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  genderIdentityOther: string

  // Do you have any visual impairment?
  // true => Yes, false => No
  @Column('boolean')
  hasVisualImpairment: boolean

  // Which of the following describe your vision level?
  // Totally Blind
  // Some Light Perception
  // Legally Blind
  // None of the Above
  @Column({
    type: 'enum',
    enum: ety.ProfileVisionLevel,
    default: ety.ProfileVisionLevel.NONE_ABOVE
  })
  visionLevel: ety.ProfileVisionLevel

  // Please select your racial or ethnic background (check all that apply):
  // White/Caucasian
  // Black/African American
  // Asian/Asian American
  // Hispanic/Latino/Latina
  // Native American/Indigenous
  // Pacific Islander
  // Mixed race
  // Other (please specify)
  @Column({
    type: 'enum',
    enum: ety.ProfileEthnicBackground,
    default: ety.ProfileEthnicBackground.OTHER
  })
  ethnicBackground: ety.ProfileEthnicBackground

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  ethnicBackgroundOther: string

  // What country are you currently residing in?
  // __________________ (open-ended text)
  @Column({
    type: 'varchar',
    length: 255
  })
  countryResideIn: string

  // Are you currently enrolled in any educational institution?
  // true => Yes, false => No
  @Column('boolean')
  isEnrolledInEducation: boolean

  // What is your highest level of education completed?
  // Less than high school
  // High school graduate or equivalent
  // Some college or vocational training
  // Bachelor's degree
  // Master's degree
  // Doctorate or professional degree
  @Column({
    type: 'enum',
    enum: ety.ProfileEducationLevel,
    default: ety.ProfileEducationLevel.BACHELOR
  })
  highestLevelEducation: ety.ProfileEducationLevel

  // What is your employment status?
  // Employed full-time
  // Employed part-time
  // Unemployed
  // Student
  // Retired
  // Other (please specify) __________
  @Column({
    type: 'enum',
    enum: ety.ProfileEmploymentStatus,
    default: ety.ProfileEmploymentStatus.OTHER
  })
  employmentStatus: ety.ProfileEmploymentStatus

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  employmentStatusOther: string

  // How frequently do you use technology or digital devices in your daily life?
  // Very frequently
  // Frequently
  // Occasionally
  // Rarely
  // Never
  @Column({
    type: 'enum',
    enum: ety.ProfileDeviceUsageFrequency,
    default: ety.ProfileDeviceUsageFrequency.FREQUENTLY
  })
  deviceUsageFrequency: ety.ProfileDeviceUsageFrequency

  // What is your Household Income?
  // Under $20,000
  // $20,000 to $40,000
  // $40,000 to $60,000
  // $60,000 to $80,000
  // $80,000 to $100,000
  // Over $100,000
  @Column({
    type: 'enum',
    enum: ety.ProfileHouseholdIncome,
    default: ety.ProfileHouseholdIncome.OVER_100K
  })
  householdIncome: ety.ProfileHouseholdIncome

  // What is your preferred Language of Communication?
  // English
  // Other (please specify) __________
  @Column({
    type: 'enum',
    enum: ['English', 'Other'], // values of ProfileLanguage
    default: 'English'
  })
  language: ety.ProfileLanguage

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  languageOther: string

  // Are you from a country located in the Global South? (Countries in Africa, Latin America, Asia, and Oceania)
  // true => Yes, false => No
  @Column('boolean')
  fromGlobalSouth: boolean

  // How did you hear about this study? (open-ended text)
  @Column('text')
  studyHearAbout: string

  static async createProfileForUser(
    params: Omit<CreateUserProfileParams, 'user'> & { userId: string }
  ): Promise<Profile> {
    const profile = new Profile()
    console.log(params)

    // Since enums are sotred using index, we need to convert the string value (from frontend) to index value

    const user = await AppDataSource.getRepository(User).findOne({ where: { id: params.userId } })
    // console.log(user)

    profile.createdAt = new Date()
    profile.user = user
    profile.ageRange = params.ageRange
    profile.genderIdentity =
      ety.ProfileGenderIdentity[params.genderIdentity as unknown as keyof typeof ety.ProfileGenderIdentity]
    profile.genderIdentityOther = params.genderIdentityOther
    profile.hasVisualImpairment = params.hasVisualImpairment
    profile.visionLevel = ety.ProfileVisionLevel[params.visionLevel as unknown as keyof typeof ety.ProfileVisionLevel]
    profile.ethnicBackground =
      ety.ProfileEthnicBackground[params.ethnicBackground as unknown as keyof typeof ety.ProfileEthnicBackground]
    profile.ethnicBackgroundOther = params.ethnicBackgroundOther
    profile.countryResideIn = params.countryResideIn
    profile.isEnrolledInEducation = params.isEnrolledInEducation
    profile.highestLevelEducation =
      ety.ProfileEducationLevel[params.highestLevelEducation as unknown as keyof typeof ety.ProfileEducationLevel]
    profile.employmentStatus =
      ety.ProfileEmploymentStatus[params.employmentStatus as unknown as keyof typeof ety.ProfileEmploymentStatus]
    profile.employmentStatusOther = params.employmentStatusOther
    profile.deviceUsageFrequency =
      ety.ProfileDeviceUsageFrequency[
        params.deviceUsageFrequency as unknown as keyof typeof ety.ProfileDeviceUsageFrequency
      ]
    profile.householdIncome =
      ety.ProfileHouseholdIncome[params.householdIncome as unknown as keyof typeof ety.ProfileHouseholdIncome]
    profile.language = params.language
    profile.languageOther = params.languageOther
    profile.fromGlobalSouth = params.fromGlobalSouth
    profile.studyHearAbout = params.studyHearAbout

    return profile.save()
  }
}
