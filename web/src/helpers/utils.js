export const toReal = val => {
  return isNaN(val) ? val : `R$ ${Number(val)
    .toFixed(2).replace('.', ',')
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`
}

export const fromReal = val => typeof (val) === 'string' ? Number((val || '').replace(/[^0-9,]/g, '').replace(',', '.') || 0) : val

export const toPercent = val => `${isNaN(val) ? '0,00' : Number(val).toFixed(2).replace('.', ',')}%`

export const dateToString = date => {
  if (!date)
    return ''
  // Datas 'YYYY-MM-DD' são interpretadas como UTC por `new Date(string)`; construir a
  // partir das partes evita que o fuso horário local jogue a data um dia para trás.
  let d
  if (typeof date === 'string') {
    const [year, month, day] = date.split('-').map(Number)
    d = new Date(year, month - 1, day)
  } else {
    d = date
  }
  let day = d.getDate()
  day = day > 9 ? day : '0' + day
  let month = d.getMonth() + 1
  month = month > 9 ? month : '0' + month
  return `${day}/${month}/${d.getFullYear()}`
}

export const yearMonthLabel = yearMonth => {
  const [year, month] = yearMonth.split('-')
  const Months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${Months[Number(month) - 1]}/${year.slice(2)}`
}
