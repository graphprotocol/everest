import numeral from 'numeral'

export const formatNumber = number => numeral(number).format(0, 0)
