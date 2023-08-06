import { BaseEntity, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

import { User } from '@/database/entity'

export type ProfileAgeRange = '18_24' | '25_34' | '45_54' | '55_64' | '65_up'

export enum ProfileGenderIdentity {
  MALE,
  FEMALE,
  NON_BINARY,
  PREFER_NO_DISCLOSE,
  OTHER
}

export enum ProfileVisionLevel {
  TOTALLY_BLIND,
  SOME_LIGHT_PERCEPTION,
  LEGALLY_BLIND,
  NONE_ABOVE
}

export enum ProfileEthnicBackground {
  WHITE_CAUCASIAN,
  BLACK_AFRICAN_AMERICAN,
  ASIAN_ASIAN_AMERICAN,
  HISPANIC_LATINO_LATINA,
  NATIVE_AMERICAN_INDIGENOUS,
  PACIFIC_ISLANDER,
  MIXED_RACE,
  OTHER
}

export enum ProfileEducationLevel {
  LESS_THAN_HIGH_SCHOOL,
  HIGH_SCHOOL_OR_EQUIVALENT,
  SOME_COLLEGE_OR_VOCATIONAL,
  BACHELOR,
  MASTER,
  DOCTORATE_OR_PROFESSIONAL
}

export enum ProfileEmploymentStatus {
  FULLTIME,
  PARTTIME,
  UNEMPLOYED,
  STUDENT,
  RETIRED,
  OTHER
}

export enum ProfileDeviceUsageFrequency {
  FREQUENTLY,
  OCCASIONALLY,
  RARELY,
  NEVER
}

export enum ProfileHouseholdIncome {
  UNDER_20K,
  BTW_20_40K,
  BTW_40_60K,
  BTW_60_80K,
  OVER_100K
}

export type ProfileLanguage = 'English' | 'Other'

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column('datetime')
  created: number

  @OneToOne((type) => User, (user) => user.profile)
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
    enum: ['below_18', '18_24', '25_34', '35_44', '45_54', '55_64', '65_up'], // values of ProfileAgeRange
    default: '18_24'
  })
  ageRange: ProfileAgeRange

  // What is your gender identity?
  // Male
  // Female
  // Non-binary
  // Prefer not to disclose
  // Other (please specify)
  @Column({
    type: 'enum',
    enum: ProfileGenderIdentity,
    default: ProfileGenderIdentity.OTHER
  })
  genderIdentity: ProfileGenderIdentity

  @Column({
    type: 'tinytext',
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
    enum: ProfileVisionLevel,
    default: ProfileVisionLevel.NONE_ABOVE
  })
  visionLevel: ProfileVisionLevel

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
    enum: ProfileEthnicBackground,
    default: ProfileEthnicBackground.OTHER
  })
  ethnicBackground: ProfileEthnicBackground

  @Column({
    type: 'tinytext',
    nullable: true
  })
  ethnicBackgroundOther: string

  // What country are you currently residing in?
  // __________________ (open-ended text)
  @Column('tinytext')
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
    enum: ProfileEducationLevel,
    default: ProfileEducationLevel.BACHELOR
  })
  highestLevelEducation: ProfileEducationLevel

  // What is your employment status?
  // Employed full-time
  // Employed part-time
  // Unemployed
  // Student
  // Retired
  // Other (please specify) __________
  @Column({
    type: 'enum',
    enum: ProfileEmploymentStatus,
    default: ProfileEmploymentStatus.OTHER
  })
  employmentStatus: ProfileEmploymentStatus

  @Column({
    type: 'tinytext',
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
    enum: ProfileDeviceUsageFrequency,
    default: ProfileDeviceUsageFrequency.FREQUENTLY
  })
  deviceUsageFrequency: ProfileDeviceUsageFrequency

  // What is your Household Income?
  // Under $20,000
  // $20,000 to $40,000
  // $40,000 to $60,000
  // $60,000 to $80,000
  // $80,000 to $100,000
  // Over $100,000
  @Column({
    type: 'enum',
    enum: ProfileHouseholdIncome,
    default: ProfileHouseholdIncome.OVER_100K
  })
  householdIncome: ProfileHouseholdIncome

  // What is your preferred Language of Communication?
  // English
  // Other (please specify) __________
  @Column({
    type: 'enum',
    enum: ['English', 'Other'], // values of ProfileLanguage
    default: 'English'
  })
  language: ProfileLanguage

  @Column({
    type: 'tinytext',
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

  static async createProfileForUser(data: {
    user: User
    ageRange: ProfileAgeRange
    genderIdentity: ProfileGenderIdentity
    genderIdentityOther: string
    hasVisualImpairment: boolean
    visionLevel: ProfileVisionLevel
    ethnicBackground: ProfileEthnicBackground
    ethnicBackgroundOther: string
    countryResideIn: string
    isEnrolledInEducation: boolean
    highestLevelEducation: ProfileEducationLevel
    employmentStatus: ProfileEmploymentStatus
    employmentStatusOther: string
    deviceUsageFrequency: ProfileDeviceUsageFrequency
    householdIncome: ProfileHouseholdIncome
    language: ProfileLanguage
    languageOther: string
    fromGlobalSouth: boolean
    studyHearAbout: string
  }): Promise<Profile> {
    const profile = new Profile()

    profile.created = Date.now()
    profile.ageRange = data.ageRange
    profile.genderIdentity = data.genderIdentity
    profile.genderIdentityOther = data.genderIdentityOther
    profile.hasVisualImpairment = data.hasVisualImpairment
    profile.visionLevel = data.visionLevel
    profile.ethnicBackground = data.ethnicBackground
    profile.ethnicBackgroundOther = data.ethnicBackgroundOther
    profile.countryResideIn = data.countryResideIn
    profile.isEnrolledInEducation = data.isEnrolledInEducation
    profile.highestLevelEducation = data.highestLevelEducation
    profile.employmentStatus = data.employmentStatus
    profile.employmentStatusOther = data.employmentStatusOther
    profile.deviceUsageFrequency = data.deviceUsageFrequency
    profile.householdIncome = data.householdIncome
    profile.language = data.language
    profile.languageOther = data.languageOther
    profile.fromGlobalSouth = data.fromGlobalSouth
    profile.studyHearAbout = data.studyHearAbout

    return profile.save()
  }
}
