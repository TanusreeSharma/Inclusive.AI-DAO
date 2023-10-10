import { v2 as cloudinary } from 'cloudinary'
import identicon from 'identicon'
import streamifier from 'streamifier'

import { envVars } from '@/config'
import { sha256 } from '@/utils'
import { User } from '@/database/entity'

export async function assignProfilePicForUser(userEmail: string) {
  cloudinary.config({
    cloud_name: 'dkd5su87i',
    api_key: envVars.CLOUDINARY_KEY,
    api_secret: envVars.CLOUDINARY_SECRET,
    secure: envVars.NODE_ENV === 'production'
  })

  // const imageUrl = faker.image.urlLoremFlickr({ category: 'cats', width: 64, height: 64 })
  // const imageUrl = faker.image.dataUri({ width: 64, height: 64 })

  const userHash = sha256(userEmail)

  const buffer = identicon.generateSync({ id: userHash, size: 64 }) as Buffer

  // Create profile image for user
  try {
    await new Promise((resolve, reject) => {
      const cldUploadStream = cloudinary.uploader.upload_stream(
        { public_id: userHash }, // self tag = sha256(user email)
        function (error, result) {
          if (error) reject(error)
          else {
            console.log(result)
            resolve(result)
          }
        }
      )

      streamifier.createReadStream(buffer).pipe(cldUploadStream)
    })
    return { error: null, payload: true }
  } catch (err) {
    console.log(err)
    return { error: 'error-generating-user-image', payload: null }
  }
}

export async function assignProfilePics() {
  // iterate through all users and call assignProfilePicForUser
  const users = await User.find()
  for (const user of users) {
    await assignProfilePicForUser(user.id)
  }
}
