import React, { useState } from 'react'
import { Button } from 'antd'
import { useEffect } from 'react'
import { Test } from './test'

function App() {
  console.log('render0')
  const [count, setCount] = useState(0)
  2..times((i) => console.log('times', i))
  return (
    <>
      <Button onClick={() => setCount(count + 1)}>{count}</Button>
      <Test />
    </>
  )
}

export default App
