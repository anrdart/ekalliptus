export const organizationAuthor = {
  name: 'Ekalliptus Digital',
  id: 'https://ekalliptus.com#organization',
  url: 'https://ekalliptus.com/about',
  bio: 'Artikel ini disusun oleh Ekalliptus Digital, penyedia layanan pengembangan website, aplikasi mobile, serta maintenance server dan web di Indonesia.'
} as const

export function resolveAuthor(_sourceAuthor?: string | null) {
  return organizationAuthor
}
