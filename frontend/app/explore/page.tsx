"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Resource = {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  source: string;
  contentType: string;
};

export default function Explore() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [contentType, setContentType] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    const fetchResources = async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (source) params.set("source", source);
      if (contentType) params.set("contentType", contentType);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      setResources(data);
    };
    fetchResources();
  }, [debouncedSearch, source, contentType]);

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Explore Resources</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select onValueChange={setSource}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Coursera">Coursera</SelectItem>
            <SelectItem value="Google Books">Google Books</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setContentType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="book">Book</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {resources?.map((res) => (
          <Card key={res._id} className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">{res.title}</h2>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {res.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {res.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground italic">
              {res.source}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
