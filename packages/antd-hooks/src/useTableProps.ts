import { TableProps } from "antd";
import { createContext, useContext, useEffect, useState } from "react";
import { Observable } from "rxjs";
import { useStateBy } from "@mono/control-hooks";

export const ControlTableContext = createContext({
  firstPageIndex: 1,
  defaultPageSize: 8,
})

export function useTableProps<T>(
  reset: Iterable<any>,
  getSource: (params: {
    page: { skip: number, take: number },
  }) => Observable<{ data: T[], total: number }>
): TableProps<{ skip: number, rawData: T }> {
  const { firstPageIndex, defaultPageSize } = useContext(ControlTableContext)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [{ pageIndex, _getSource }, setState] = useStateBy([pageSize, ...reset], () => {
    return {
      pageIndex: firstPageIndex,
      _getSource: getSource,
    }
  })

  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [dataSource, setDataSource] = useState(() => new Array<{ skip: number, rawData: T }>())

  useEffect(() => {
    setLoading(true)
    const subscribtion = _getSource({
      page: {
        skip: (pageIndex - firstPageIndex) * pageSize,
        take: pageSize,
      }
    }).subscribe((res) => {
      setLoading(false)
      setTotal(res.total)
      setDataSource(res.data.map((rawData, i) => ({ skip: pageIndex * pageSize + i, rawData })))
    })
    return () => subscribtion.unsubscribe()
  }, [pageIndex, pageSize, _getSource])
  return {
    pagination: { current: pageIndex, pageSize, total },
    dataSource,
    loading,
    onChange: (pagination) => {
      setPageSize(pagination.pageSize || defaultPageSize)
      setState({
        _getSource,
        pageIndex: pagination.current || firstPageIndex,
      })
    }
  }
}