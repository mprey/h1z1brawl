export function findSocketById(io, id) {
  for (var index in io.sockets.connected) {
    var socket = io.sockets.connected[index];
    if (socket.decoded_token && socket.decoded_token.id == id) {
      return socket;
    }
  }
  return null
}
