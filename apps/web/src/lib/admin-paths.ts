export const isLoginPath = (pathname: string) => pathname === '/admin/login' || pathname === '/api/admin/login'

export const isProtectedPath = (pathname: string) =>
  !isLoginPath(pathname) && (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/'))
