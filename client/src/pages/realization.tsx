import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { format } from "date-fns";
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  FileText, 
  ExternalLink, 
  Trash2, 
  Edit, 
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Award,
  Target,
  Users,
  MessageSquare
} from "lucide-react";
import type { BusinessReview, KPIActual, SuccessStory, JobThemeWithKPIs, Project } from "@shared/schema";

export default function RealizationPage() {
  const [, params] = useRoute("/projects/:id/realisation");
  const projectId = params?.id ? parseInt(params.id) : 0;
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("reviews");

  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
  });

  // Fetch finalized jobs for Progress Tracking
  const { data: finalizedData } = useQuery<{
    finalized: boolean;
    jobs: JobThemeWithKPIs[];
    transferredAt: Date;
  }>({
    queryKey: ["/api/projects", projectId, "alignment", "finalized-jobs"],
  });

  // Fetch business reviews
  const { data: reviews = [] } = useQuery<BusinessReview[]>({
    queryKey: ["/api/projects", projectId, "business-reviews"],
  });

  // Fetch success stories
  const { data: stories = [] } = useQuery<SuccessStory[]>({
    queryKey: ["/api/projects", projectId, "success-stories"],
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p data-testid="text-loading">Loading project...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href={`/projects/${projectId}`} data-testid="link-back-to-project">
                  <Button variant="ghost" size="sm">← Back to Discovery</Button>
                </Link>
              </div>
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">
                {project.companyName} - Value Realization
              </h1>
              <p className="text-sm text-muted-foreground">
                Track progress, manage business reviews, and reference success stories
              </p>
            </div>
            <Badge variant="secondary" data-testid="badge-phase">
              Realization Phase
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3" data-testid="tabs-realization">
              <TabsTrigger value="reviews" data-testid="tab-business-reviews">
                <Calendar className="w-4 h-4 mr-2" />
                Business Reviews
              </TabsTrigger>
              <TabsTrigger value="progress" data-testid="tab-progress-tracking">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress Tracking
              </TabsTrigger>
              <TabsTrigger value="stories" data-testid="tab-success-stories">
                <Award className="w-4 h-4 mr-2" />
                Success Stories
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              <BusinessReviewsTab projectId={projectId} reviews={reviews} />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <ProgressTrackingTab projectId={projectId} finalizedData={finalizedData} />
            </TabsContent>

            <TabsContent value="stories" className="mt-6">
              <SuccessStoriesTab projectId={projectId} stories={stories} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Business Reviews Tab
// ============================================================================
function BusinessReviewsTab({ projectId, reviews }: { projectId: number; reviews: BusinessReview[] }) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${projectId}/business-reviews`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "business-reviews"],
        refetchType: 'active'
      });
      setIsCreating(false);
      toast({ title: "Business review created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create business review", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/business-reviews/${id}`, data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "business-reviews"],
        refetchType: 'active'
      });
      setEditingId(null);
      toast({ title: "Business review updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update business review", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/business-reviews/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ 
        queryKey: ["/api/projects", projectId, "business-reviews"],
        refetchType: 'active'
      });
      toast({ title: "Business review deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete business review", description: error.message, variant: "destructive" });
    },
  });

  const completedReviews = reviews.filter(r => r.status === "completed");
  const upcomingReviews = reviews.filter(r => r.status === "scheduled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Business Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Regular client meetings to validate alignment and track progress
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} data-testid="button-create-review">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Review
        </Button>
      </div>

      {isCreating && (
        <BusinessReviewForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreating(false)}
          isPending={createMutation.isPending}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Completed Reviews ({completedReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-completed-reviews">
                No completed reviews yet
              </p>
            ) : (
              completedReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isEditing={editingId === review.id}
                  onEdit={() => setEditingId(review.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={(data) => updateMutation.mutate({ id: review.id, data })}
                  onDelete={() => deleteMutation.mutate(review.id)}
                  isPending={updateMutation.isPending || deleteMutation.isPending}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Upcoming Reviews ({upcomingReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-upcoming-reviews">
                No upcoming reviews scheduled
              </p>
            ) : (
              upcomingReviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isEditing={editingId === review.id}
                  onEdit={() => setEditingId(review.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={(data) => updateMutation.mutate({ id: review.id, data })}
                  onDelete={() => deleteMutation.mutate(review.id)}
                  isPending={updateMutation.isPending || deleteMutation.isPending}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BusinessReviewForm({ 
  review, 
  onSubmit, 
  onCancel, 
  isPending 
}: { 
  review?: BusinessReview; 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    reviewDate: review?.reviewDate ? format(new Date(review.reviewDate), "yyyy-MM-dd") : "",
    reviewType: (review?.reviewType || "monthly") as "monthly" | "quarterly" | "milestone" | "ad_hoc",
    attendees: review?.attendees || "",
    agenda: review?.agenda || "",
    notes: review?.notes || "",
    keyDecisions: review?.keyDecisions || "",
    clientSentiment: review?.clientSentiment?.toString() || "",
    sentimentNotes: review?.sentimentNotes || "",
    status: (review?.status || "scheduled") as "scheduled" | "completed" | "cancelled",
    nextReviewDate: review?.nextReviewDate ? format(new Date(review.nextReviewDate), "yyyy-MM-dd") : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      reviewDate: new Date(formData.reviewDate),
      nextReviewDate: formData.nextReviewDate ? new Date(formData.nextReviewDate) : null,
      clientSentiment: formData.clientSentiment ? parseInt(formData.clientSentiment) : null,
    };
    onSubmit(submitData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{review ? "Edit" : "Create"} Business Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date *</Label>
              <Input
                id="reviewDate"
                type="date"
                value={formData.reviewDate}
                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                required
                data-testid="input-review-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reviewType">Review Type</Label>
              <Select
                value={formData.reviewType}
                onValueChange={(value) => setFormData({ ...formData, reviewType: value as "monthly" | "quarterly" | "milestone" | "ad_hoc" })}
              >
                <SelectTrigger data-testid="select-review-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="ad_hoc">Ad Hoc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees</Label>
            <Input
              id="attendees"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              placeholder="John Doe, Jane Smith"
              data-testid="input-attendees"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda</Label>
            <Textarea
              id="agenda"
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              placeholder="Meeting agenda and topics"
              data-testid="textarea-agenda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Meeting Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Discussion points and notes"
              data-testid="textarea-notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyDecisions">Key Decisions</Label>
            <Textarea
              id="keyDecisions"
              value={formData.keyDecisions}
              onChange={(e) => setFormData({ ...formData, keyDecisions: e.target.value })}
              placeholder="Important decisions made"
              data-testid="textarea-key-decisions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientSentiment">Client Sentiment (1-10)</Label>
              <Input
                id="clientSentiment"
                type="number"
                min="1"
                max="10"
                value={formData.clientSentiment}
                onChange={(e) => setFormData({ ...formData, clientSentiment: e.target.value })}
                placeholder="Rate client mood"
                data-testid="input-client-sentiment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as "scheduled" | "completed" | "cancelled" })}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sentimentNotes">Sentiment Notes</Label>
            <Textarea
              id="sentimentNotes"
              value={formData.sentimentNotes}
              onChange={(e) => setFormData({ ...formData, sentimentNotes: e.target.value })}
              placeholder="Qualitative feedback on client mood"
              data-testid="textarea-sentiment-notes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextReviewDate">Next Review Date</Label>
            <Input
              id="nextReviewDate"
              type="date"
              value={formData.nextReviewDate}
              onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
              data-testid="input-next-review-date"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} data-testid="button-submit-review">
              {isPending ? "Saving..." : review ? "Update Review" : "Create Review"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-review">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ 
  review, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onUpdate, 
  onDelete, 
  isPending 
}: { 
  review: BusinessReview;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  if (isEditing) {
    return (
      <BusinessReviewForm
        review={review}
        onSubmit={onUpdate}
        onCancel={onCancelEdit}
        isPending={isPending}
      />
    );
  }

  const reviewDate = review.reviewDate ? new Date(review.reviewDate) : new Date();
  const nextReviewDate = review.nextReviewDate ? new Date(review.nextReviewDate) : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              {format(reviewDate, "PPP")}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{review.reviewType}</Badge>
              {review.clientSentiment && (
                <Badge variant="secondary">
                  Sentiment: {review.clientSentiment}/10
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={onEdit} data-testid={`button-edit-review-${review.id}`}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onDelete} data-testid={`button-delete-review-${review.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {review.attendees && (
          <div>
            <span className="font-medium">Attendees:</span> {review.attendees}
          </div>
        )}
        {review.agenda && (
          <div>
            <span className="font-medium">Agenda:</span>
            <p className="text-muted-foreground mt-1">{review.agenda}</p>
          </div>
        )}
        {review.keyDecisions && (
          <div>
            <span className="font-medium">Key Decisions:</span>
            <p className="text-muted-foreground mt-1">{review.keyDecisions}</p>
          </div>
        )}
        {nextReviewDate && (
          <div className="pt-2 border-t">
            <span className="font-medium">Next Review:</span> {format(nextReviewDate, "PPP")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Progress Tracking Tab
// ============================================================================
function ProgressTrackingTab({ 
  projectId, 
  finalizedData 
}: { 
  projectId: number; 
  finalizedData?: { finalized: boolean; jobs: JobThemeWithKPIs[] };
}) {
  const { toast } = useToast();
  const [selectedKPI, setSelectedKPI] = useState<{ id: number; name: string; unit: string } | null>(null);

  if (!finalizedData?.finalized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Discovery Not Finalized
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You need to finalize the Discovery phase and select KPIs before tracking progress.
          </p>
          <Link href={`/projects/${projectId}`}>
            <Button data-testid="button-go-to-discovery">
              Go to Discovery
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">KPI Progress Tracking</h2>
        <p className="text-sm text-muted-foreground">
          Track baseline → actual → target values for selected KPIs
        </p>
      </div>

      <div className="space-y-4">
        {finalizedData.jobs.map((job) => {
          const selectedKPIs = job.kpis.filter(k => k.isSelected);
          if (selectedKPIs.length === 0) return null;

          return (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {job.jobName}
                </CardTitle>
                <CardDescription>{job.capabilityName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedKPIs.map((kpi) => (
                  <KPIActualsCard
                    key={kpi.id}
                    kpi={kpi}
                    onSelectKPI={() => setSelectedKPI({ id: kpi.id, name: kpi.kpiName, unit: kpi.unit })}
                  />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedKPI && (
        <KPIActualFormDialog
          kpi={selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </div>
  );
}

function KPIActualsCard({ 
  kpi, 
  onSelectKPI 
}: { 
  kpi: any;
  onSelectKPI: () => void;
}) {
  const { data: actuals = [] } = useQuery<KPIActual[]>({
    queryKey: ["/api/job-theme-kpis", kpi.id, "actuals"],
  });

  const latestActual = actuals[0];

  return (
    <div className="p-4 border rounded-lg hover-elevate">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium">{kpi.kpiName}</h4>
          <p className="text-sm text-muted-foreground">{kpi.unit}</p>
        </div>
        <Button size="sm" onClick={onSelectKPI} data-testid={`button-add-actual-${kpi.id}`}>
          <Plus className="w-4 h-4 mr-1" />
          Add Actual
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Baseline</p>
          <p className="font-semibold">{kpi.baselineValue || "—"}</p>
          {kpi.baselineSource && (
            <p className="text-xs text-muted-foreground">{kpi.baselineSource}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Latest Actual</p>
          <p className="font-semibold text-blue-600">
            {latestActual ? latestActual.actualValue : "—"}
          </p>
          {latestActual?.actualDate && (
            <p className="text-xs text-muted-foreground">
              {format(latestActual.actualDate instanceof Date ? latestActual.actualDate : new Date(latestActual.actualDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Target</p>
          <p className="font-semibold text-green-600">{kpi.targetValue || "—"}</p>
        </div>
      </div>

      {actuals.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs font-medium mb-2">History ({actuals.length} entries)</p>
          <div className="space-y-2">
            {actuals.slice(0, 3).map((actual) => (
              <div key={actual.id} className="flex items-center justify-between text-sm">
                <span>{actual.actualValue}</span>
                <span className="text-muted-foreground">
                  {format(actual.actualDate instanceof Date ? actual.actualDate : new Date(actual.actualDate), "MMM d, yyyy")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KPIActualFormDialog({ 
  kpi, 
  onClose 
}: { 
  kpi: { id: number; name: string; unit: string };
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    actualValue: "",
    actualDate: format(new Date(), "yyyy-MM-dd"),
    actualSource: "",
    notes: "",
    validatedBy: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/job-theme-kpis/${kpi.id}/actuals`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-theme-kpis", kpi.id, "actuals"] });
      onClose();
      toast({ title: "KPI actual value recorded successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to record KPI actual", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      actualDate: new Date(formData.actualDate),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Actual Value - {kpi.name}</CardTitle>
        <CardDescription>Unit: {kpi.unit}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actualValue">Actual Value *</Label>
              <Input
                id="actualValue"
                value={formData.actualValue}
                onChange={(e) => setFormData({ ...formData, actualValue: e.target.value })}
                placeholder="e.g., 85"
                required
                data-testid="input-actual-value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualDate">Measurement Date *</Label>
              <Input
                id="actualDate"
                type="date"
                value={formData.actualDate}
                onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                required
                data-testid="input-actual-date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="actualSource">Data Source</Label>
            <Input
              id="actualSource"
              value={formData.actualSource}
              onChange={(e) => setFormData({ ...formData, actualSource: e.target.value })}
              placeholder="e.g., Client HRIS Report, Survey Results"
              data-testid="input-actual-source"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validatedBy">Validated By</Label>
            <Input
              id="validatedBy"
              value={formData.validatedBy}
              onChange={(e) => setFormData({ ...formData, validatedBy: e.target.value })}
              placeholder="Name of person who validated this data"
              data-testid="input-validated-by"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional context about this measurement"
              data-testid="textarea-actual-notes"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-actual">
              {createMutation.isPending ? "Recording..." : "Record Value"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-actual">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Success Stories Tab
// ============================================================================
function SuccessStoriesTab({ projectId, stories }: { projectId: number; stories: SuccessStory[] }) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", `/api/projects/${projectId}/success-stories`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-stories"] });
      setIsCreating(false);
      toast({ title: "Success story added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add success story", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/success-stories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-stories"] });
      toast({ title: "Success story removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove success story", description: error.message, variant: "destructive" });
    },
  });

  const toggleHighlightMutation = useMutation({
    mutationFn: async ({ id, isHighlighted }: { id: number; isHighlighted: boolean }) => {
      return await apiRequest("PATCH", `/api/success-stories/${id}`, { isHighlighted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "success-stories"] });
    },
  });

  const highlightedStories = stories.filter(s => s.isHighlighted);
  const otherStories = stories.filter(s => !s.isHighlighted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Korn Ferry Success Stories</h2>
          <p className="text-sm text-muted-foreground">
            Reference relevant case studies to demonstrate proven results
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} data-testid="button-add-story">
          <Plus className="w-4 h-4 mr-2" />
          Add Story
        </Button>
      </div>

      {isCreating && (
        <SuccessStoryForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setIsCreating(false)}
          isPending={createMutation.isPending}
        />
      )}

      {highlightedStories.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Highlighted Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlightedStories.map(story => (
              <SuccessStoryCard
                key={story.id}
                story={story}
                onDelete={() => deleteMutation.mutate(story.id)}
                onToggleHighlight={() => toggleHighlightMutation.mutate({ id: story.id, isHighlighted: !story.isHighlighted })}
              />
            ))}
          </div>
        </div>
      )}

      {otherStories.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">All Stories ({otherStories.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherStories.map(story => (
              <SuccessStoryCard
                key={story.id}
                story={story}
                onDelete={() => deleteMutation.mutate(story.id)}
                onToggleHighlight={() => toggleHighlightMutation.mutate({ id: story.id, isHighlighted: !story.isHighlighted })}
              />
            ))}
          </div>
        </div>
      )}

      {stories.length === 0 && !isCreating && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground" data-testid="text-no-stories">
              No success stories added yet. Add relevant case studies to demonstrate proven value.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SuccessStoryForm({ 
  onSubmit, 
  onCancel, 
  isPending 
}: { 
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    category: "",
    industry: "",
    capabilityName: "",
    solutionArea: "",
    relevanceReason: "",
    excerpt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      solutionArea: formData.solutionArea || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Success Story</CardTitle>
        <CardDescription>
          Link a Korn Ferry case study from{" "}
          <a 
            href="https://www.kornferry.com/about-us/business-impact/client-stories" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            kornferry.com/client-stories
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Story Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Sales Transformation at Global Tech Company"
              required
              data-testid="input-story-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Story URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://www.kornferry.com/..."
              required
              data-testid="input-story-url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sales Transformation"
                data-testid="input-story-category"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology, Healthcare"
                data-testid="input-story-industry"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capabilityName">Related Capability</Label>
              <Input
                id="capabilityName"
                value={formData.capabilityName}
                onChange={(e) => setFormData({ ...formData, capabilityName: e.target.value })}
                placeholder="e.g., Sales Acceleration"
                data-testid="input-story-capability"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="solutionArea">Solution Area</Label>
              <Select
                value={formData.solutionArea}
                onValueChange={(value) => setFormData({ ...formData, solutionArea: value })}
              >
                <SelectTrigger data-testid="select-story-solution-area">
                  <SelectValue placeholder="Select solution area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSESS">Assess</SelectItem>
                  <SelectItem value="DEVELOP">Develop</SelectItem>
                  <SelectItem value="TRANSFORM">Transform</SelectItem>
                  <SelectItem value="REWARD">Reward</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="ANALYTICS">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relevanceReason">Why Relevant to This Project?</Label>
            <Textarea
              id="relevanceReason"
              value={formData.relevanceReason}
              onChange={(e) => setFormData({ ...formData, relevanceReason: e.target.value })}
              placeholder="Explain how this case study relates to the current engagement"
              data-testid="textarea-story-relevance"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Key Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief quote or key outcome from the case study"
              data-testid="textarea-story-excerpt"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} data-testid="button-submit-story">
              {isPending ? "Adding..." : "Add Story"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-story">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SuccessStoryCard({ 
  story, 
  onDelete, 
  onToggleHighlight 
}: { 
  story: SuccessStory;
  onDelete: () => void;
  onToggleHighlight: () => void;
}) {
  return (
    <Card className={story.isHighlighted ? "border-yellow-500 border-2" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex-1">{story.title}</CardTitle>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleHighlight}
              data-testid={`button-toggle-highlight-${story.id}`}
            >
              <Star className={`w-4 h-4 ${story.isHighlighted ? "fill-yellow-500 text-yellow-500" : ""}`} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              data-testid={`button-delete-story-${story.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {story.category && <Badge variant="outline">{story.category}</Badge>}
          {story.industry && <Badge variant="secondary">{story.industry}</Badge>}
          {story.solutionArea && <Badge>{story.solutionArea}</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {story.capabilityName && (
          <div className="text-sm">
            <span className="font-medium">Capability:</span> {story.capabilityName}
          </div>
        )}
        {story.relevanceReason && (
          <div className="text-sm">
            <span className="font-medium">Relevance:</span>
            <p className="text-muted-foreground mt-1">{story.relevanceReason}</p>
          </div>
        )}
        {story.excerpt && (
          <div className="text-sm italic border-l-4 border-primary pl-3 py-1">
            {story.excerpt}
          </div>
        )}
        <a
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          data-testid={`link-story-${story.id}`}
        >
          View Case Study <ExternalLink className="w-3 h-3" />
        </a>
      </CardContent>
    </Card>
  );
}
