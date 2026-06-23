'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessor: keyof T | ((item: T) => React.ReactNode)
  className?: string
}

interface DataTableContainerProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
}

export function DataTableContainer<T extends { id: string | number }>({ 
  columns, 
  data, 
  isLoading,
  onRowClick
}: DataTableContainerProps<T>) {
  return (
    <div className="rounded-[32px] bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            {columns.map((column, idx) => (
              <TableHead 
                key={idx} 
                className={cn(
                  "py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8",
                  column.className
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-slate-50">
                  {columns.map((_, idx) => (
                    <TableCell key={idx} className="px-8 py-6">
                      <div className="h-4 w-full bg-slate-100 animate-pulse rounded-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-medium">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIdx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: rowIdx * 0.05 }}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    "group border-slate-50 transition-colors hover:bg-slate-50/50 cursor-pointer",
                    rowIdx === data.length - 1 ? "border-0" : "border-b"
                  )}
                >
                  {columns.map((column, colIdx) => (
                    <TableCell 
                      key={colIdx} 
                      className="px-8 py-6 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors"
                    >
                      {typeof column.accessor === 'function' 
                        ? column.accessor(item) 
                        : (item[column.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  )
}
