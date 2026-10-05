import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  className?: string
}

export function Pagination({ currentPage, totalPages, basePath, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push('...')
    }
  }

  const renderPages = pages.filter((p, i, arr) => p !== '...' || arr[i - 1] !== '...')

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <a
            href={currentPage > 1 ? `${basePath}?page=${currentPage - 1}` : '#'}
            aria-label="Go to previous page"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              currentPage <= 1 && "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </a>
        </li>
        {renderPages.map((page, i) => (
          <li key={i}>
            {page === '...' ? (
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              <a
                href={`${basePath}?page=${page}`}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: page === currentPage ? "outline" : "ghost",
                    size: "icon",
                  })
                )}
              >
                {page}
              </a>
            )}
          </li>
        ))}
        <li>
          <a
            href={currentPage < totalPages ? `${basePath}?page=${currentPage + 1}` : '#'}
            aria-label="Go to next page"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              currentPage >= totalPages && "pointer-events-none opacity-50"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </a>
        </li>
      </ul>
    </nav>
  )
}
