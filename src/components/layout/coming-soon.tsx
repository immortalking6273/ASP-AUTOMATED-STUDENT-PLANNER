import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";

export interface ComingSoonProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  modulePhase?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description,
  breadcrumbs = [],
  modulePhase = "Future Phase",
}) => {
  return (
    <div className="space-y-6">
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="w-fit gap-1 text-xs py-1 px-3">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {modulePhase}
        </Badge>
      </div>

      <Card className="border-dashed bg-card/60 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Coming Soon</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-1 text-sm">
            This module will be implemented in a future development phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-4">
          <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Modular Architecture Ready</span>
            <ArrowRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Module 1 Foundation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
