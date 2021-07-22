
export const chunk = (array, chunk_size = 2) => {
  const ret = [];
  for (let i = 0, j = array.length; i < j; i += chunk_size) {
    ret.push(array.slice(i, i + chunk_size));
  }
  return ret;
}


export const addZero = (nb, min = 2) => {
  nb = nb + "";
  return nb.padStart(min, "0");
}

export const toDate = (origDate, gmt = true) => {
  const d = new Date(origDate)
  const hour = `${addZero(d.getHours())}:${addZero(d.getMinutes())}`
  const date = `${addZero(d.getDate())}/${addZero(d.getMonth() + 1)}/${addZero(d.getFullYear())}`
  return `${hour}${gmt ? ' GMT' : ''}, ${date}`
}