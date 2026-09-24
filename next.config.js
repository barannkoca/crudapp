/** @type {import('next').NextConfig} */
const nextConfig = {
  // PDFKit kendi dahili standart font modüllerini Node çözümlemesiyle yükler.
  // Bundle içine alınırsa bu modüller Vercel üretiminde bulunamayabiliyor.
  serverExternalPackages: ['pdfkit'],
  outputFileTracingIncludes: {
    '/api/analytics/monthly-statement/pdf': [
      './node_modules/pdfkit/js/standard-fonts/**/*',
      './node_modules/pdfjs-dist/standard_fonts/LiberationSans-Regular.ttf',
      './node_modules/pdfjs-dist/standard_fonts/LiberationSans-Bold.ttf',
    ],
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
}

module.exports = nextConfig 
