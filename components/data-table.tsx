"use client"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  FilterFn,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Download } from "lucide-react"
import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DataTableProps<TData, TValue> {
  columns: (ColumnDef<TData, TValue> & { 
    searchable?: boolean
    exportToExcel?: boolean
    exportToPdf?: boolean
  })[]
  data: TData[]
  exportFileName?: string
}

const customGlobalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const column = row.column.columnDef as ColumnDef<any> & { searchable?: boolean }
  if (column.searchable === false) return true
  const value = row.getValue(columnId)?.toString().toLowerCase()
  return value?.includes(filterValue.toLowerCase()) ?? false
}

export function DataTable<TData, TValue>({
  columns,
  data,
  exportFileName = 'export',
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: customGlobalFilterFn,
  })

  const exportToExcel = async () => {
    try {
      const exportColumns = columns.filter(col => col.exportToExcel !== false)
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Sheet1')

      // Add headers
      worksheet.addRow(exportColumns.map(col => col.header?.toString() || ''))

      // Add data
      table.getFilteredRowModel().rows.forEach(row => {
        worksheet.addRow(exportColumns.map(col => {
          const cellValue = row.getValue(col.accessorKey as string)
          return typeof cellValue === 'object' ? JSON.stringify(cellValue) : cellValue
        }))
      })

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${exportFileName}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
    }
  }

  const exportToPdf = () => {
    try {
      const exportColumns = columns.filter(col => col.exportToPdf !== false)
      const headers = exportColumns.map(col => col.header?.toString() || '')
      const rows = table.getFilteredRowModel().rows.map(row => {
        return exportColumns.map(col => {
          const cellValue = row.getValue(col.accessorKey as string)
          // Convert to string if it's an object or array
          if (typeof cellValue === 'object') {
            return JSON.stringify(cellValue)
          }
          // Handle other non-string values
          return cellValue !== null && cellValue !== undefined ? cellValue.toString() : ''
        })
      })

      const doc = new jsPDF()
      
      // Add title
      doc.text(`${exportFileName}`, 14, 10)
      
      // Generate table
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 20,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 'auto' }
        }
      })

      doc.save(`${exportFileName}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="Search all columns..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPdf}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>
      
      {/* Table implementation remains the same */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnDef = header.column.columnDef as ColumnDef<TData> & {
                    enableSorting?: boolean
                  }
                  const isSortable = columnDef.enableSorting !== false
                  
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div className={isSortable ? "flex items-center cursor-pointer" : ""}>
                          {flexRender(
                            columnDef.header,
                            header.getContext()
                          )}
                          {isSortable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-8 w-8 p-0"
                              onClick={() => header.column.toggleSorting()}
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls remain the same */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s)
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="hidden sm:flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="hidden sm:flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

