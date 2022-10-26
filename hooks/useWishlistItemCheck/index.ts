import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useWishlistItemCheck = ({ wishlistId, onError }) => {
  const queryClient = useQueryClient()

  const mutation = useMutation(
    async (id) => {
      try {
        const response = await fetch(
          `/api/wishlists/${wishlistId}/item/${id}/check`,
          { method: "put" }
        )
        const data = await response.json()

        if ("error" in data) {
          throw data.error
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", wishlistId])
      },
      onError,
    }
  )

  return mutation
}
