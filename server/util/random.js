export function generateSecret() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(var i=0; i < 9; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

export function generatePercentage() {
  return 100 * Math.random()
}
