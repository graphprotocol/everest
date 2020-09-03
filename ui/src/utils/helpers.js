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

export const stripPrefix = (value, text) => {
  if (value.startsWith(`https://${text}`)) {
    return value.replace(`https://${text}`, '')
  }
  if (value.startsWith(`http://${text}`)) {
    return value.replace(`http://${text}`, '')
  }
  if (value.startsWith(`www.${text}`)) {
    return value.replace(`www.${text}`, '')
  }
  if (value.startsWith('@')) {
    return value.replace('@', '')
  }

  if (value.startsWith(text)) {
    return value.replace(text, '')
  }
  return value
}

export const socialUrl = (value, text) => {
  const regex = /^(https:|http:|www\.)\S*/
  if (value.match(regex)) {
    return value
  }
  if (value.startsWith(text)) {
    return `https://${value}`
  }
  if (value.startsWith('@')) {
    return `https://${text}${value.replace('@', '')}`
  }
  return `https://${text}${value}`
}

export const getBreadcrumbs = item => {
  let breadcrumbs = []
  let parent = item && item.parentCategory
  while (parent) {
    breadcrumbs = breadcrumbs.concat({
      name: parent.name,
      url: `/category/${parent.id}/`,
    })
    parent = parent.parentCategory
  }
  return breadcrumbs
}

export const pickCategories = categories => {
  let projectCategories = categories ? [...categories] : []
  if (projectCategories.length > 0) {
    for (const pc of categories) {
      if (pc.parentCategory) {
        // if there is a parent of a selected category, remove it from the list
        const parentIndex = projectCategories.findIndex(
          pcat => pcat.id === pc.parentCategory.id,
        )
        if (parentIndex > -1) {
          projectCategories.splice(parentIndex, 1)
        }
      }
    }
  }
  return projectCategories
}
