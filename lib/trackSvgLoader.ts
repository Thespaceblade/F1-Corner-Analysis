// Utility to load inline SVG content for track maps.
// Uses webpack's ?raw suffix to import the file contents as a string at build time.

const svgLoaders: Record<string, () => Promise<string>> = {
  'abudhabi.svg': async () => (await import('../public/Tracks/abudhabi.svg?raw')).default,
  'australia.svg': async () => (await import('../public/Tracks/australia.svg?raw')).default,
  'austria.svg': async () => (await import('../public/Tracks/austria.svg?raw')).default,
  'azerbaijan.svg': async () => (await import('../public/Tracks/azerbaijan.svg?raw')).default,
  'bahrain.svg': async () => (await import('../public/Tracks/bahrain.svg?raw')).default,
  'brazil.svg': async () => (await import('../public/Tracks/brazil.svg?raw')).default,
  'canada.svg': async () => (await import('../public/Tracks/canada.svg?raw')).default,
  'china.svg': async () => (await import('../public/Tracks/china.svg?raw')).default,
  'hungary.svg': async () => (await import('../public/Tracks/hungary.svg?raw')).default,
  'imola.svg': async () => (await import('../public/Tracks/imola.svg?raw')).default,
  'japan.svg': async () => (await import('../public/Tracks/japan.svg?raw')).default,
  'las_vegas.svg': async () => (await import('../public/Tracks/las_vegas.svg?raw')).default,
  'mexico.svg': async () => (await import('../public/Tracks/mexico.svg?raw')).default,
  'miami.svg': async () => (await import('../public/Tracks/miami.svg?raw')).default,
  'monaco.svg': async () => (await import('../public/Tracks/monaco.svg?raw')).default,
  'monza.svg': async () => (await import('../public/Tracks/monza.svg?raw')).default,
  'netherlands.svg': async () => (await import('../public/Tracks/netherlands.svg?raw')).default,
  'portugal.svg': async () => (await import('../public/Tracks/portugal.svg?raw')).default,
  'qatar.svg': async () => (await import('../public/Tracks/qatar.svg?raw')).default,
  'saudi_arabia.svg': async () => (await import('../public/Tracks/saudi_arabia.svg?raw')).default,
  'silverstone.svg': async () => (await import('../public/Tracks/silverstone.svg?raw')).default,
  'singapore.svg': async () => (await import('../public/Tracks/singapore.svg?raw')).default,
  'spa.svg': async () => (await import('../public/Tracks/spa.svg?raw')).default,
  'spain.svg': async () => (await import('../public/Tracks/spain.svg?raw')).default,
  'usa.svg': async () => (await import('../public/Tracks/usa.svg?raw')).default,
}

export async function loadTrackSvg(svgFile: string): Promise<string> {
  const loader = svgLoaders[svgFile]
  if (!loader) {
    throw new Error(`Unsupported track SVG: ${svgFile}`)
  }

  return loader()
}
