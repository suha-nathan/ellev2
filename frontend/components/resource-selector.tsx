"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export type Resource = {
  _id: string;
  title: string;
  description?: string;
  tags?: string[];
  source: string;
  contentType: string;
  url: string;
};

interface Props {
  selected: Resource[];
  onSelect: (resources: Resource[]) => void;
}

export function ResourceSelector({ selected, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Resource[]>([]);
  const debounced = useDebounce(search, 400);

  useEffect(() => {
    const fetchResources = async () => {
      const params = new URLSearchParams();
      if (debounced) params.set("q", debounced);
      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResults(data.slice(0, 10));
    };
    fetchResources();
  }, [debounced]);

  const handleAdd = (resource: Resource) => {
    if (!selected.find((r) => r._id === resource._id)) {
      onSelect([...selected, resource]);
    }
  };

  const handleRemove = (id: string) => {
    onSelect(selected.filter((r) => r._id !== id));
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {results.map((resource) => (
            <Tooltip key={resource._id}>
              <TooltipTrigger asChild>
                <Card
                  className="p-2 cursor-pointer hover:bg-muted transition text-sm"
                  onClick={() => handleAdd(resource)}
                >
                  <div className="font-medium truncate">{resource.title}</div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-xs space-y-1">
                <p className="font-medium">{resource.title}</p>
                {resource.description && (
                  <p className="line-clamp-5 text-primary-foreground">
                    {resource.description}
                  </p>
                )}
                <p className="">
                  Source: {resource.source}, Type: {resource.contentType}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Selected Resources</h4>
          <div className="flex flex-wrap gap-2">
            {selected.map((resource) => (
              <div
                key={resource._id}
                className="bg-muted px-2 py-1 rounded flex items-center gap-1 max-w-xs truncate text-xs"
              >
                <span className="truncate">{resource.title}</span>
                <button onClick={() => handleRemove(resource._id)}>
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
