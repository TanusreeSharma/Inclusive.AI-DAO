export type ProfileAgeRange = 'under_18' | '18_24' | '25_34' | '45_54' | '55_64' | '65_up'

export enum ProfileGenderIdentity {
  MALE,
  FEMALE,
  NON_BINARY,
  PREFER_NO_DISCLOSE,
  OTHER
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

export type ProfilePrimaryLanguage = 'English' | 'Other'