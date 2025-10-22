// Utility to load inline SVG content for track maps.
// Uses webpack's ?raw suffix to import the file contents as a string at build time.

type SvgModule = string | { default: string }

const svgLoaders: Record<string, () => Promise<SvgModule>> = {
  'abudhabi.svg': () => import('../public/Tracks/abudhabi.svg?raw'),
  'australia.svg': () => import('../public/Tracks/australia.svg?raw'),
  'austria.svg': () => import('../public/Tracks/austria.svg?raw'),
  'azerbaijan.svg': () => import('../public/Tracks/azerbaijan.svg?raw'),
  'bahrain.svg': () => import('../public/Tracks/bahrain.svg?raw'),
  'brazil.svg': () => import('../public/Tracks/brazil.svg?raw'),
  'canada.svg': () => import('../public/Tracks/canada.svg?raw'),
  'china.svg': () => import('../public/Tracks/china.svg?raw'),
  'hungary.svg': () => import('../public/Tracks/hungary.svg?raw'),
  'imola.svg': () => import('../public/Tracks/imola.svg?raw'),
  'japan.svg': () => import('../public/Tracks/japan.svg?raw'),
  'las_vegas.svg': () => import('../public/Tracks/las_vegas.svg?raw'),
  'mexico.svg': () => import('../public/Tracks/mexico.svg?raw'),
  'miami.svg': () => import('../public/Tracks/miami.svg?raw'),
  'monaco.svg': () => import('../public/Tracks/monaco.svg?raw'),
  'monza.svg': () => import('../public/Tracks/monza.svg?raw'),
  'netherlands.svg': () => import('../public/Tracks/netherlands.svg?raw'),
  'portugal.svg': () => import('../public/Tracks/portugal.svg?raw'),
  'qatar.svg': () => import('../public/Tracks/qatar.svg?raw'),
  'saudi_arabia.svg': () => import('../public/Tracks/saudi_arabia.svg?raw'),
  'silverstone.svg': () => import('../public/Tracks/silverstone.svg?raw'),
  'singapore.svg': () => import('../public/Tracks/singapore.svg?raw'),
  'spa.svg': () => import('../public/Tracks/spa.svg?raw'),
  'spain.svg': () => import('../public/Tracks/spain.svg?raw'),
  'usa.svg': () => import('../public/Tracks/usa.svg?raw'),
}

export async function loadTrackSvg(svgFile: string): Promise<string> {
  const loader = svgLoaders[svgFile]
  if (!loader) {
    throw new Error(`Unsupported track SVG: ${svgFile}`)
  }

  const mod = await loader()

  if (typeof mod === 'string') {
    return mod
  }

  if (mod && typeof mod === 'object' && typeof mod.default === 'string') {
    return mod.default
  }

  throw new Error(`Failed to resolve SVG contents for ${svgFile}`)
}
