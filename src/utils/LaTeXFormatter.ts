import katex from 'katex'

export function ltx(expression: string) {
  return katex.renderToString(expression, { throwOnError: false, output: 'mathml' })
}
