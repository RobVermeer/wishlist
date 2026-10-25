import { shuffle } from "@/lib/utils"

export const maxParticipants = 30

// Shuffles until nobody draws themselves. Returns for each participant the
// index of the participant they drew.
export function drawLots(count: number) {
  const indexes = [...Array(count).keys()]
  let receivers: number[]

  do {
    receivers = shuffle([...indexes])
  } while (receivers.some((receiver, index) => receiver === index))

  return receivers
}
