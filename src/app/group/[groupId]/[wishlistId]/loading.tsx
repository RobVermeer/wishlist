import { LoaderIcon } from "lucide-react"

export default async function Loading() {
  return (
    <div className="grid place-content-center py-6 text-primary">
      <LoaderIcon className="animate-spin" />
    </div>
  )
}
