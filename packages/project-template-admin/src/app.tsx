import React, { useState } from 'react'
import { Button } from 'antd'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}

