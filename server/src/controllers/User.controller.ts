import { Authorized, Body, Get, JsonController, Post, CurrentUser } from 'routing-controllers'

import { User } from '@/database/entity'
import { UserRole } from '@/database/entity/User'
import { assignPodRoundRobin, assignProfilePicForUser } from '@/utils'

type UserRegisterParams = {
  name: string
  role: UserRole
  userId: string
  appPubkey: string
  address: string
}

@JsonController('/user')
export default class UserController {
  @Get('/') // GET '/user/' (need authorization)
  @Authorized()
  async getUser(@CurrentUser({ required: true }) user: User) {
    const userData = await User.findOne({
      where: { id: user.id },
      relations: ['profile', 'pod', 'pod.valueQuestion'],
      // cache: true,
    })

    if (!userData) return { error: 'user-not-found', payload: null }

    return {
      error: null,
      payload: {
        user: {
          id: userData.id,
          role: userData.role,
          address: userData.address,
          aiSurveyCompleted: userData.aiSurveyCompleted,
          votingEarly: userData.votingEarly,
          votingTokenReceivedBlockNumber: userData.votingTokenReceivedBlockNumber
        },
        pod: userData.pod,
        profile: userData.profile
      }
    }
  }

  // TODO: Validate that JWT's `sub` matches `userId` (email) in body (to prevent spoofing)
  @Post('/pre') // POST '/user/pre'
  @Authorized()
  async preInitUser(
    @Body({ required: true })
    body: UserRegisterParams
  ) {
    let ret = { error: 'user-not-created', payload: null }

    try {
      const user = await User.findOne({ where: { id: body.userId } }) //cache: true

      if (!!user) {
        ret = { error: 'user-already-exists', payload: null }
      } else {
        const user = User.create({
          id: body.userId,
          name: body.name,
          role: body.role,
          appPubkey: body.appPubkey,
          address: body.address
        })

        await user.save()

        ret = { error: null, payload: 'success' }
      }
    } catch (err: any) {
      console.log(err)
    }

    return ret
  }

  // TODO: Validate that JWT's `sub` matches `userId` (email) in body (to prevent spoofing)
  @Post('/') // POST '/user/'
  // @Authorized() // turn on after testing implementation
  async createUser(
    @Body({ required: true })
    body: UserRegisterParams // & Omit<CreateUserProfileParams, 'user'>
  ) {
    // console.log(body)
    let user = await User.findOne({ where: { id: body.userId }, relations: ['profile'], cache: true })

    // Create User if doesn't exist
    if (!user) {
      const pod = await assignPodRoundRobin()
      user = User.create({
        id: body.userId,
        name: body.name,
        role: body.role,
        appPubkey: body.appPubkey,
        address: body.address,
        pod
      })

      await user.save()

      await assignProfilePicForUser(body.userId)

      return { error: null, payload: 'success' }
    }

    return { error: 'user-already-exists', payload: null }

    // Assign Pod if doesn't exist
    // if (!user.pod) {
    //   const pod = await assignPodRoundRobin()
    //   user.pod = pod
    //   await user.save()
    // }
    // console.log(user)


    // // If profile already exists (which only should happen if user also exists), then return
    // if (user && !!user.profile) {
    //   return { error: 'user-already-exists', payload: null }
    // }

    // let ret = { error: 'user-not-created', payload: null }

    // const newProfileData = { user, ...body } as CreateUserProfileParams

    // try {
    //   await Profile.createProfileForUser(newProfileData)
    //   ret = { error: null, payload: 'success' }
    // } catch (err: any) {
    //   console.log(err)
    //   if (typeof err?.detail === 'string' && err.detail.includes('already exists')) {
    //     ret = { error: 'user-already-exists', payload: null }
    //   }
    // }

    // return ret
  }
}
