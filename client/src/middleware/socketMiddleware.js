export default function socketMiddleware(socketObj) {
  return ({dispatch, getState}) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    /*
     * Socket middleware usage.
     * promise: (socket) => socket.emit('MESSAGE', 'hello world!')
     * type: always 'socket'
     * types: [REQUEST, SUCCESS, FAILURE]
     */
    const { promise, type, types, ...rest } = action;

    const { socket, param } = socketObj

    if (type !== param || !promise) {
      // Move on! Not a socket request or a badly formed one.
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({...rest, type: REQUEST});

    return promise(socket)
      .then((result) => {
        return next({...rest, payload: result, type: SUCCESS });
      })
      .catch((error) => {
        return next({...rest, payload: error, type: FAILURE });
      })
  };
}
