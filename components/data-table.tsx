"use client";

import { Channel } from "@/app/types";
import { Button } from "@/components/ui/button";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDownIcon } from "lucide-react";
import Image from "next/image";
import { debounce } from "radash";
import * as React from "react";

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
      <HoverCard>
        <HoverCardTrigger>
          <div className="font-bold">
            {row.getValue("name")}{" "}
            <span className="text-violet-500 italic">/{row.original.id}</span>
          </div>
          <div className="dark:text-violet-600 italic text-xs max-w-[140px] truncate">
            {row.original.description}
          </div>
        </HoverCardTrigger>
        <HoverCardContent>{row.original.description}</HoverCardContent>
      </HoverCard>
    ),
  },
  {
    accessorKey: "memberCount",
    header: ({ column }) => {
      return (
        <div className="w-[124px] text-right truncate">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <ArrowUpDownIcon className="ml-2 h-4 w-4 mx-2" />
            Members
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const memberCount = parseInt(
        row.getValue("memberCount")
      ).toLocaleString();
      return (
        <div className="w-[124px] text-center font-medium">{memberCount}</div>
      );
    },
    meta: {
      filterVariant: "range",
    },
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
      const followerCount = parseInt(
        row.getValue("followerCount")
      ).toLocaleString();
      return (
        <div className="w-[124px] text-center font-medium">{followerCount}</div>
      );
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
      const long = date.toLocaleString(undefined, { timeZoneName: "short" });

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="text-right font-medium">{formatted}</div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{long}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
];

const channelLogo = (row: Row<Channel>) => {
  const { index } = row;
  const { imageUrl, id } = row.original;

  return (
    <div className="w-[36px] h-[36px] flex-shrink-0">
      <div className="w-[36px] h-[36px] absolute">
        <Image
          className="rounded-full"
          src={imageUrl}
          sizes="(max-width: 768px) 36px, 36px"
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
  const [sorting, setSorting] = React.useState<SortingState>([
    { desc: true, id: "createdAt" },
  ]);
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

  const column = table.getColumn("memberCount");
  const [minMemberCount, maxMemberCount] =
    column?.getFacetedMinMaxValues() ?? [0, 0];

  const [membersLowerBound, setMembersLowerBound] = React.useState(1);
  const [inputFormLowerBound, setInputFormLowerBound] = React.useState(1);
  const [membersUpperBound, setMembersUpperBound] =
    React.useState(maxMemberCount);

  React.useEffect(
    () => setMembersUpperBound(maxMemberCount),
    [maxMemberCount]
  );

  const handleTextInput = React.useCallback(
    (value: string) => {
      const numValue = parseInt(value);
      if (numValue > membersUpperBound) {
        setInputFormLowerBound(membersUpperBound);
      } else if (numValue < 1) {
        setInputFormLowerBound(1);
      } else {
        setInputFormLowerBound(numValue);
      }

      setMembersLowerBound(numValue);
      column?.setFilterValue([numValue, membersUpperBound]);
    },
    [membersUpperBound, column]
  );

  const debouncedHandleTextInput = React.useMemo(
    () => debounce({ delay: 300 }, (value: string) => handleTextInput(value)),
    [handleTextInput]
  );

  return (
    <div>
      <div className="flex items-center py-4">
        {data.length ? (
          <>
            <Input
              autoFocus
              type="search"
              value={
                (table.getColumn("name")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="w-[400px] cursor-pointer ring-violet-500 focus:ring-1 outline-none max-w-full bg-violet-50 border border-violet-200 text-violet-900 text-sm rounded focus:border-violet-300 block p-2 dark:bg-violet-950 dark:border-violet-600 dark:placeholder-violet-400 dark:text-violet-300"
              placeholder={`Search ${table
                .getFilteredRowModel()
                .rows.length.toLocaleString()} channels`}
            />
            <div className="w-full px-4">
              <DualRangeSlider
                label={(value) =>
                  value ? (value > 100 ? "100+" : value) : undefined
                }
                labelPosition="bottom"
                value={[membersLowerBound]}
                onValueChange={(value: number[]) => {
                  setMembersLowerBound(value[0]);
                  column?.setFilterValue([value[0], membersUpperBound]);
                  setInputFormLowerBound(value[0]);
                }}
                min={minMemberCount}
                max={100}
              />
            </div>
            <Input
              type="text"
              value={inputFormLowerBound.toLocaleString()}
              onChange={(event) => {
                const value = event.target.value;
                setInputFormLowerBound(parseInt(value) || 0);
                debouncedHandleTextInput(value);
              }}
              className="w-[60px] cursor-pointer ring-violet-500 focus:ring-1 outline-none max-w-full bg-violet-50 border border-violet-200 text-violet-900 text-sm rounded focus:border-violet-300 block p-2 dark:bg-violet-950 dark:border-violet-600 dark:placeholder-violet-400 dark:text-violet-300"
              placeholder={membersLowerBound.toLocaleString()}
            />
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
