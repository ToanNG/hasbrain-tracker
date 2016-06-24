export default function apiMiddleware() {
  return (next) => (action) => {
    const { api, types, ...rest } = action;
    if (!api) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ ...rest, type: REQUEST });

    return api.then(response =>
      response.json()
    ).then(result => {
      if (result.error) {
        const error = new Error(result.error_description);
        next({ ...rest, error, type: FAILURE });
      } else {
        next({ ...rest, result, type: SUCCESS });
      }
    });
  };
}
