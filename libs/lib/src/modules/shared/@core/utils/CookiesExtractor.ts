import { Request } from 'express';
import { IncomingMessage } from 'http';

export function cookiesExtractor(req: Request): Record<string, string> | null {
  let headers: IncomingMessage['headers'];
  if ('headers' in req) {
    headers = req.headers;
  } else {
    return null;
  }
  const cookieHeader = headers?.cookie;
  if (!cookieHeader) {
    return null;
  }
  const cookiesObject = cookieHeader.split(';').reduce(
    (acc, cookie) => {
      const [key, value] = cookie.split('=').map((part) => part.trim());
      if (key && value) acc[key] = value;
      return acc;
    },
    {} as Record<string, string>,
  );
  return cookiesObject;
}
