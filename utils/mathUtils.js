export function randomIntFromInterval(min,max)
{
  return Math.floor(Math.random()*(max-min+1)+min);
}

export function getRandomArrayElement(arr) {
  return arr[ randomIntFromInterval(0, arr.length - 1)]
}