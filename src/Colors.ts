import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config.js'

const config: any = resolveConfig(tailwindConfig)

export const green = config.theme.colors.green[500] ?? '#00ff00'

export const sky = config.theme.colors.sky[200] ?? '#00ff00'
