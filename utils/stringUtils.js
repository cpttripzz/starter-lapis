export function ucFirst(str){
  return str.charAt(0).toUpperCase() + str.substr(1)
}
export function removeStringBeforeLastInstance(str, searchString) {
  var index = str.lastIndexOf(searchString);
  if(index != -1) return str.substring(index + 1);
  return str;
}