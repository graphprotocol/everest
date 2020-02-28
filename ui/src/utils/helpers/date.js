export const convertDate = date => {
  const dateObj = new Date(date * 1000)
  return (
    dateObj.getMonth() +
    1 +
    '-' +
    dateObj.getDate() +
    '-' +
    dateObj.getFullYear()
  )
}
