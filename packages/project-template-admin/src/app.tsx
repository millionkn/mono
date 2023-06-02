import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { client } from './globalConfig'

export const App: React.FC = () => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    client.test.helloWorld.query('hello').then((res)=>{
      console.log(res)
    })
  }, [])
  return (<>
    <Button onClick={() => setCount(count + 1)}>{count}</Button>
  </>)
}

