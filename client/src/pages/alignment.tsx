import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Send, 
  FileText,
  Lightbulb
} from "lucide-react";
import type { Project, ValueHypothesis, CompanyDataPoint } from "@shared/schema";
import ValueHypothesisBuilder from "@/components/ValueHypothesisBuilder";
import ValueHypothesisCard from "@/components/ValueHypothesisCard";

export default function AlignmentPage() {
  const [, params] = useRoute("/projects/:id/alignment");
  const projectId = parseInt(params?.id || "0");
  
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<ValueHypothesis | null>(null);

  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  const { data: hypotheses = [] } = useQuery<ValueHypothesis[]>({
    queryKey: [`/api/projects/${projectId}/value-hypotheses`],
  });

  const { data: insights = [] } = useQuery<CompanyDataPoint[]>({
    queryKey: [`/api/projects/${projectId}/company-data`],
  });

  const draftHypotheses = hypotheses.filter(h => h.status === "draft");
  const sentHypotheses = hypotheses.filter(h => h.status === "sent");
  const approvedHypotheses = hypotheses.filter(h => h.status === "approved");

  const handleCreate = () => {
    setEditingHypothesis(null);
    setIsBuilderOpen(true);
  };

  const handleEdit = (hypothesis: ValueHypothesis) => {
    setEditingHypothesis(hypothesis);
    setIsBuilderOpen(true);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    setEditingHypothesis(null);
  };

  if (!project) {
    return <div className="p-6">Loading project...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold mb-1">
                Alignment Phase
              </h1>
              <p className="text-sm text-muted-foreground">
                Build and refine value hypotheses with {project.companyName}
              </p>
            </div>
            <Button 
              onClick={handleCreate}
              size="default"
              data-testid="button-create-hypothesis"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Value Hypothesis
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hypotheses</p>
                    <p className="text-2xl font-bold mt-1">{hypotheses.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Draft</p>
                    <p className="text-2xl font-bold mt-1">{draftHypotheses.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold mt-1">{sentHypotheses.length}</p>
                  </div>
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card className="no-default-hover-elevate">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold mt-1">{approvedHypotheses.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {hypotheses.length === 0 ? (
          <Card className="max-w-2xl mx-auto mt-12">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center">Build Your First Value Hypothesis</CardTitle>
              <CardDescription className="text-center">
                Use insights from Discovery to create quantified value hypotheses.
                Select a Korn Ferry capability, input assumptions, and calculate financial impact.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={handleCreate} data-testid="button-create-first-hypothesis">
                <Plus className="h-4 w-4 mr-2" />
                Create Value Hypothesis
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({hypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="draft" data-testid="tab-draft">
                Draft ({draftHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="sent" data-testid="tab-sent">
                Sent ({sentHypotheses.length})
              </TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">
                Approved ({approvedHypotheses.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4">
                {hypotheses.map(hypothesis => (
                  <ValueHypothesisCard
                    key={hypothesis.id}
                    hypothesis={hypothesis}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-6">
              <div className="grid gap-4">
                {draftHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No draft hypotheses
                  </p>
                ) : (
                  draftHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-6">
              <div className="grid gap-4">
                {sentHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No sent hypotheses
                  </p>
                ) : (
                  sentHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="grid gap-4">
                {approvedHypotheses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No approved hypotheses
                  </p>
                ) : (
                  approvedHypotheses.map(hypothesis => (
                    <ValueHypothesisCard
                      key={hypothesis.id}
                      hypothesis={hypothesis}
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Value Hypothesis Builder Dialog */}
      {isBuilderOpen && (
        <ValueHypothesisBuilder
          projectId={projectId}
          insights={insights}
          hypothesis={editingHypothesis}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
