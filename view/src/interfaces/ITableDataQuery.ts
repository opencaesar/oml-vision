import ITableData from "./ITableData";

type ITableDataQuery = {
  data: ITableData[]
  meta: {
    totalRowCount: number
  }
}

export default ITableDataQuery;