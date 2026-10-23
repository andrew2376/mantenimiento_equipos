
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  // El login no necesita enviar el token
  if (req.url.endsWith('/login')) {
    return next(req);
  }

  // Si no hay token, dejamos pasar la petición
  // para que el backend responda 401 si corresponde
  if (!token) {
    return next(req);
  }

  // Si la petición ya tiene Authorization, la conservamos.
  // Si no lo tiene, agregamos el token guardado.
  const requestConToken = req.headers.has('Authorization')
    ? req
    : req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

  return next(requestConToken);
};
