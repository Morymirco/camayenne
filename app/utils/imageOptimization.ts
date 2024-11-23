// import { getPlaiceholder } from 'plaiceholder'

// export const getBlurDataURL = async (imageUrl: string) => {
//   try {
//     const { base64 } = await getPlaiceholder(imageUrl)
//     return base64
//   } catch (err) {
//     return undefined
//   }
// }

// // Utilisation dans les composants avec Image de Next.js
// <Image
//   src={imageUrl}
//   alt={alt}
//   placeholder="blur" 
//   blurDataURL={blurDataURL}
//   priority={isPriority}
//   loading={isPriority ? "eager" : "lazy"}
// /> 