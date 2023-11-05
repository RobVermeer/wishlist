import { useMutation, useQueryClient } from "@tanstack/react-query"

interface UseWishlistItemCheckProps {
  wishlistId: string
  onError: (error: Error) => void
}

export const useWishlistItemCheck = ({
  wishlistId,
  onError,
}: UseWishlistItemCheckProps) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await fetch(
          `/api/wishlists/${wishlistId}/item/${id}/check`,
          { method: "put" }
        )
        const data = await response.json()

        if ("error" in data) {
          throw data.error
        }
      } catch (error: any) {
        throw new Error(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlists", wishlistId])
    },
    onError,
  })

  return mutation
}
