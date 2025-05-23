"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDebounce } from "@/lib/hooks/useDebounce";

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
      setResults(data.slice(0, 5)); // condensed result
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
    <div className="space-y-4">
      <Input
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className=" grid md:grid-cols-2 space-y-2">
        {results.map((resource) => (
          <Card
            key={resource._id}
            className="p-2 cursor-pointer hover:bg-muted"
            onClick={() => handleAdd(resource)}
          >
            <p className="font-medium text-sm truncate">{resource.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {resource.description}
            </p>
            <div className="flex gap-1 mt-1 flex-wrap">
              {resource.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Selected Resources</h4>
        {selected.map((resource) => (
          <Card
            key={resource._id}
            className="flex items-center justify-between px-2 py-1"
          >
            <p className="truncate text-sm">{resource.title}</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleRemove(resource._id)}
            >
              <X className="w-4 h-4 text-destructive" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
