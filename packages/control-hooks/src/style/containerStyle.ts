
export function containerStyle(
  direction: 'row' | 'column',
  opts?: {
    /**default:`center` */
    content?: 'stretch' | 'center'
  },
): React.CSSProperties {
  const optsContent = opts?.content || 'center'
  return {
    display: 'flex',
    flexDirection: direction,
    justifyContent: optsContent,
  }
}