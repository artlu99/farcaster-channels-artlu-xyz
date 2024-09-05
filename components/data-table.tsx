"use client";

import * as React from "react";
import Image from "next/image";
import { ArrowUpDownIcon } from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Channel } from "@/app/types";

const columns: ColumnDef<Channel>[] = [
  {
    accessorKey: "channel_logo",
    header: "",
    cell: ({ row }) => channelLogo(row),
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div className="font-bold">
          {row.getValue("name")}{" "}
          <span className="text-violet-500 italic">/{row.original.id}</span>
        </div>
        <div className="dark:text-violet-600 italic text-xs max-w-[140px] truncate">{row.original.description}</div>
      </div>
    ),
  },
  {
    accessorKey: "followerCount",
    header: ({ column }) => {
      return (
        <div className="w-[124px] text-right truncate">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDownIcon className="ml-2 h-4 w-4 mx-2" />
            Followers
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const followerCount = parseInt(row.getValue("followerCount")).toLocaleString();
      return <div className="w-[124px] text-center font-medium">{followerCount}</div>; 
    },
    meta: {
      filterVariant: "range",
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDownIcon className="ml-2 h-4 w-4 mx-2" />
            Created
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const timestamp = parseInt(row.getValue("createdAt"));

      // Format the timestamp in local time
      const date = new Date(timestamp * 1000);
      const formatted = date.toLocaleDateString();

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

const channelLogo = (row: Row<Channel>) => {
  const { index } = row;
  const { imageUrl, id } = row.original;

  return (
    <div className="w-[30px] h-[30px] flex-shrink-0">
      <div className="w-[30px] h-[30px] absolute">
        <Image
          className="rounded-full"
          src={imageUrl}
          sizes="(max-width: 768px) 30px, 30px"
          priority={index < 30}
          quality={75}
          alt={id}
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};

export const DataTable = (props: {
  data: Channel[];
  onClickAction: (ch: Channel) => void;
}) => {
  const { data, onClickAction } = props;
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0, // initial page index
    pageSize: 100,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination, // update the pagination state when internal APIs mutate the pagination state
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
  });

  const column = table.getColumn("followerCount");
  const [minFollowerCount, maxFollowerCount] =
    column?.getFacetedMinMaxValues() ?? [0, 0];

  const [followersLowerBound, setFollowersLowerBound] = React.useState(1);
  const [followersUpperBound, setFollowersUpperBound] =
    React.useState(maxFollowerCount);

  React.useEffect(
    () => setFollowersUpperBound(maxFollowerCount),
    [maxFollowerCount]
  );

  return (
    <div>
      <div className="flex items-center py-4">
        {data.length ? (
          <>
            <Input
              autoFocus
              type="search"
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="w-[400px] cursor-pointer ring-violet-500 focus:ring-1 outline-none max-w-full bg-violet-50 border border-violet-200 text-violet-900 text-sm rounded focus:border-violet-300 block p-2 dark:bg-violet-950 dark:border-violet-600 dark:placeholder-violet-400 dark:text-violet-300"
              placeholder={`Search ${
                table.getFilteredRowModel().rows.length
              } channel names`}
            />
            <div className="w-full px-2">
              <DualRangeSlider
                label={(value) => value}
                labelPosition="bottom"
                value={[followersLowerBound]}
                onValueChange={(value: number[]) => {
                  setFollowersLowerBound(value[0]);
                  column?.setFilterValue([value[0], followersUpperBound]);
                }}
                min={minFollowerCount}
                max={100}
              />
            </div>
          </>
        ) : null}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
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
                  onClick={() => onClickAction(row.original)}
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
                  loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {data.length > 0 ? (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
