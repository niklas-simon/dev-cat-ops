"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Slider } from "@heroui/slider";
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useCallback, useState } from "react";
import { Filter, X } from "react-feather";

import { defaultFilter, FilterOptions } from "./defaults";

function getSearchFilter(search: ReadonlyURLSearchParams) {
  return {
    search: search.get("search") || defaultFilter.search,
    rating: [
      Number(search.get("minRating")) || defaultFilter.rating[0],
      Number(search.get("maxRating")) || defaultFilter.rating[1],
    ],
    sort: search.get("sort") || defaultFilter.sort,
  };
}

export default function FilterMenu() {
  const search = useSearchParams();
  const router = useRouter();

  const searchFilter = getSearchFilter(search);

  const [filter, setFilter] = useState(searchFilter);
  const [open, setOpen] = useState(false);

  const applyFilter = useCallback(
    (filter: FilterOptions) => {
      router.push(
        encodeURI(
          `/?search=${filter.search}&minRating=${filter.rating[0]}&maxRating=${filter.rating[1]}&sort=${filter.sort}`
        )
      );
    },
    [router]
  );

  return (
    <Popover isOpen={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button isIconOnly>
          <Filter />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 gap-4 items-end">
        <Input
          label="Suchbegriff"
          labelPlacement="outside"
          placeholder="Katze"
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
        <Slider
          label="Bewertung"
          maxValue={10}
          minValue={1}
          step={1}
          value={filter.rating}
          onChange={(e) => setFilter({ ...filter, rating: e as number[] })}
        />
        <Select
          label="Sortierung"
          selectedKeys={[filter.sort]}
          onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
        >
          <SelectItem key="alpha_asc">Alphabetisch (A-Z)</SelectItem>
          <SelectItem key="alpha_desc">Alphabetisch (Z-A)</SelectItem>
          <SelectItem key="rating_asc">Bewertung (1-10)</SelectItem>
          <SelectItem key="rating_desc">Bewertung (10-1)</SelectItem>
        </Select>
        <div className="flex flex-row justify-end gap-4">
          <Button
            data-testid="clear-button"
            isIconOnly
            color="default"
            onPress={() => {
              setFilter({
                ...defaultFilter,
              });
              setOpen(false);
              applyFilter(defaultFilter);
            }}
          >
            <X />
          </Button>
          <Button
            data-testid="apply-button"
            isIconOnly
            color="primary"
            onPress={() => {
              setOpen(false);
              applyFilter(filter);
            }}
          >
            <Filter />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
