export function jsonRPC(id: number, method: string, result: object) {
  return JSON.stringify({
    id,
    method,
    result,
  });
}

export function jsonRPCError(id: number, method: string, error: object) {
  return JSON.stringify({
    id,
    method,
    error,
  });
}
