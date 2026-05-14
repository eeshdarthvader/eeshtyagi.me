import { useMDXComponents as getThemeComponents } from 'nextra-theme-blog'

export function useMDXComponents(components) {
  return {
    ...getThemeComponents(),
    ...components
  }
}
