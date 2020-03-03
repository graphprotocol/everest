import moment from 'moment'

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

export const remainingTime = date => {
  const endTime = moment.unix(parseInt(date))
  const now = moment()
  const diffMinutes = endTime.diff(now, 'minutes')
  const diffHours = endTime.diff(now, 'hours')
  const diffDays = endTime.diff(now, 'days')

  if (endTime - now <= 0) {
    return '0d 0h 0m'
  } else {
    return `${diffDays}d ${diffHours % 24}h ${diffMinutes % 60}m`
  }
}
