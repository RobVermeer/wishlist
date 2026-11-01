// Today's date in the time zone of the app, like a date input fills it in.
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(
    new Date()
  )
