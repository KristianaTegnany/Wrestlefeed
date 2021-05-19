
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