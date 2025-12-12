import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileText,
  File,
  Trash2,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  PenLine,
  ChevronDown,
  ChevronUp,
  Users,
  Lightbulb,
  AlertTriangle,
  Target
} from "lucide-react";

interface ArtifactUploadProps {
  projectId: number;
  meetingContext: "pre_meeting" | "post_meeting";
  title?: string;
  description?: string;
  compact?: boolean;
}

interface InteractionArtifact {
  id: number;
  projectId: number;
  artifactType: string;
  meetingContext: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  objectStorageKey: string | null;
  title: string | null;
  freeformNotes: string | null;
  extractedText: string | null;
  meetingDate: string | null;
  meetingType: string | null;
  attendees: string[] | null;
  aiProcessingStatus: string;
  aiExtractedInsights: any;
  aiSummary: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export function ArtifactUpload({ 
  projectId, 
  meetingContext, 
  title = "Meeting Materials",
  description,
  compact = false
}: ArtifactUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [expandedArtifact, setExpandedArtifact] = useState<number | null>(null);
  
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    meetingType: "",
    meetingDate: "",
    freeformNotes: ""
  });
  
  const [notesForm, setNotesForm] = useState({
    title: "",
    meetingType: "",
    meetingDate: "",
    freeformNotes: ""
  });

  const { data: artifacts = [], isLoading } = useQuery<InteractionArtifact[]>({
    queryKey: ["/api/projects", projectId, "interaction-artifacts", meetingContext],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/interaction-artifacts?context=${meetingContext}`, {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error(`${res.status}: ${await res.text()}`);
      }
      return res.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: typeof uploadForm) => {
      if (!data.file) throw new Error("No file selected");
      
      const reader = new FileReader();
      const base64Content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(data.file!);
      });
      
      return apiRequest("POST", `/api/projects/${projectId}/interaction-artifacts/upload`, {
        fileName: data.file.name,
        fileContent: base64Content,
        mimeType: data.file.type,
        fileSize: data.file.size,
        meetingContext,
        title: data.title || data.file.name,
        meetingType: data.meetingType || undefined,
        meetingDate: data.meetingDate || undefined,
        freeformNotes: data.freeformNotes || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts", meetingContext] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      setIsUploadDialogOpen(false);
      setUploadForm({ file: null, title: "", meetingType: "", meetingDate: "", freeformNotes: "" });
      toast({ title: "Document uploaded", description: "Your file has been uploaded and is being processed." });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    }
  });

  const createNotesMutation = useMutation({
    mutationFn: async (data: typeof notesForm) => {
      return apiRequest("POST", `/api/projects/${projectId}/interaction-artifacts`, {
        artifactType: "notes",
        meetingContext,
        title: data.title || "Meeting Notes",
        meetingType: data.meetingType || undefined,
        meetingDate: data.meetingDate || undefined,
        freeformNotes: data.freeformNotes,
        aiProcessingStatus: data.freeformNotes ? "pending" : "completed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts", meetingContext] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      setIsNotesDialogOpen(false);
      setNotesForm({ title: "", meetingType: "", meetingDate: "", freeformNotes: "" });
      toast({ title: "Notes saved", description: "Your meeting notes have been saved." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to save notes", description: error.message, variant: "destructive" });
    }
  });

  const processArtifactMutation = useMutation({
    mutationFn: async (artifactId: number) => {
      return apiRequest("POST", `/api/interaction-artifacts/${artifactId}/process`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts", meetingContext] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      toast({ title: "AI processing complete", description: "Insights have been extracted from your document." });
    },
    onError: (error: any) => {
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    }
  });

  const deleteArtifactMutation = useMutation({
    mutationFn: async (artifactId: number) => {
      return apiRequest("DELETE", `/api/interaction-artifacts/${artifactId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts", meetingContext] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "interaction-artifacts"] });
      toast({ title: "Deleted", description: "The artifact has been removed." });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({ title: "File too large", description: "Maximum file size is 10MB", variant: "destructive" });
        return;
      }
      setUploadForm(prev => ({ ...prev, file, title: file.name.replace(/\.[^/.]+$/, "") }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      case "processing": return <Loader2 className="w-3 h-3 animate-spin text-blue-600" />;
      case "pending": return <Clock className="w-3 h-3 text-amber-600" />;
      case "failed": return <AlertCircle className="w-3 h-3 text-red-600" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="w-4 h-4" />;
      case "transcript": return <MessageSquare className="w-4 h-4" />;
      case "notes": return <PenLine className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const contextLabel = meetingContext === "pre_meeting" ? "Pre-Meeting" : "Post-Meeting";

  if (compact) {
    return (
      <div className="space-y-3" data-testid={`artifact-upload-${meetingContext}`}>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium flex items-center gap-2">
            {meetingContext === "pre_meeting" ? (
              <Target className="w-4 h-4 text-blue-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            {title}
          </h4>
          <div className="flex gap-1">
            <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid={`button-add-notes-${meetingContext}`}>
                  <PenLine className="w-3 h-3 mr-1" />
                  Notes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {contextLabel} Notes</DialogTitle>
                  <DialogDescription>
                    Capture your thoughts, observations, or key points from the meeting.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      placeholder="e.g., Discovery Call Notes"
                      value={notesForm.title}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, title: e.target.value }))}
                      data-testid="input-notes-title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Meeting Type</Label>
                      <Select 
                        value={notesForm.meetingType} 
                        onValueChange={(v) => setNotesForm(prev => ({ ...prev, meetingType: v }))}
                      >
                        <SelectTrigger data-testid="select-notes-meeting-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discovery">Discovery Call</SelectItem>
                          <SelectItem value="stakeholder">Stakeholder Interview</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="qbr">QBR</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={notesForm.meetingDate}
                        onChange={(e) => setNotesForm(prev => ({ ...prev, meetingDate: e.target.value }))}
                        data-testid="input-notes-date"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      placeholder="Enter your meeting notes, observations, key points..."
                      className="min-h-[150px]"
                      value={notesForm.freeformNotes}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, freeformNotes: e.target.value }))}
                      data-testid="textarea-notes-content"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => createNotesMutation.mutate(notesForm)}
                    disabled={!notesForm.freeformNotes || createNotesMutation.isPending}
                    data-testid="button-save-notes"
                  >
                    {createNotesMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs" data-testid={`button-upload-doc-${meetingContext}`}>
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload {contextLabel} Document</DialogTitle>
                  <DialogDescription>
                    Upload transcripts, meeting notes, or relevant documents (PDF, Word, Text).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.csv,.json"
                      onChange={handleFileChange}
                    />
                    {uploadForm.file ? (
                      <div className="space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-blue-600" />
                        <p className="font-medium text-sm">{uploadForm.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadForm.file.size)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select a file</p>
                        <p className="text-xs text-muted-foreground">PDF, Word, Text (max 10MB)</p>
                      </div>
                    )}
                  </div>
                  
                  {uploadForm.file && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                          placeholder="Document title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                          data-testid="input-upload-title"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Meeting Type</Label>
                          <Select 
                            value={uploadForm.meetingType} 
                            onValueChange={(v) => setUploadForm(prev => ({ ...prev, meetingType: v }))}
                          >
                            <SelectTrigger data-testid="select-upload-meeting-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discovery">Discovery Call</SelectItem>
                              <SelectItem value="stakeholder">Stakeholder Interview</SelectItem>
                              <SelectItem value="presentation">Presentation</SelectItem>
                              <SelectItem value="qbr">QBR</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={uploadForm.meetingDate}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, meetingDate: e.target.value }))}
                            data-testid="input-upload-date"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Textarea 
                          placeholder="Any context about this document..."
                          value={uploadForm.freeformNotes}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, freeformNotes: e.target.value }))}
                          data-testid="textarea-upload-notes"
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => uploadMutation.mutate(uploadForm)}
                    disabled={!uploadForm.file || uploadMutation.isPending}
                    data-testid="button-confirm-upload"
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload Document</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            <FileText className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p>No {contextLabel.toLowerCase()} materials yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {artifacts.slice(0, 3).map((artifact) => (
              <div 
                key={artifact.id} 
                className="p-2 rounded-md border bg-card text-sm"
                data-testid={`artifact-item-${artifact.id}`}
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(artifact.artifactType)}
                  <span className="flex-1 truncate text-xs">{artifact.title || artifact.fileName}</span>
                  {getStatusIcon(artifact.aiProcessingStatus)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => deleteArtifactMutation.mutate(artifact.id)}
                    data-testid={`button-delete-artifact-${artifact.id}`}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
                {artifact.aiSummary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{artifact.aiSummary}</p>
                )}
              </div>
            ))}
            {artifacts.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">+{artifacts.length - 3} more</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card data-testid={`artifact-upload-card-${meetingContext}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {meetingContext === "pre_meeting" ? (
                <Target className="w-4 h-4 text-blue-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid={`button-add-notes-full-${meetingContext}`}>
                  <PenLine className="w-4 h-4 mr-2" />
                  Add Notes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {contextLabel} Notes</DialogTitle>
                  <DialogDescription>
                    Capture your thoughts, observations, or key points.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      placeholder="e.g., Discovery Call Notes"
                      value={notesForm.title}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Meeting Type</Label>
                      <Select 
                        value={notesForm.meetingType} 
                        onValueChange={(v) => setNotesForm(prev => ({ ...prev, meetingType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discovery">Discovery Call</SelectItem>
                          <SelectItem value="stakeholder">Stakeholder Interview</SelectItem>
                          <SelectItem value="presentation">Presentation</SelectItem>
                          <SelectItem value="qbr">QBR</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={notesForm.meetingDate}
                        onChange={(e) => setNotesForm(prev => ({ ...prev, meetingDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea 
                      placeholder="Enter your meeting notes, observations, key points..."
                      className="min-h-[150px]"
                      value={notesForm.freeformNotes}
                      onChange={(e) => setNotesForm(prev => ({ ...prev, freeformNotes: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => createNotesMutation.mutate(notesForm)}
                    disabled={!notesForm.freeformNotes || createNotesMutation.isPending}
                  >
                    {createNotesMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid={`button-upload-doc-full-${meetingContext}`}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload {contextLabel} Document</DialogTitle>
                  <DialogDescription>
                    Upload transcripts, meeting notes, or relevant documents (PDF, Word, Text).
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover-elevate"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.csv,.json"
                      onChange={handleFileChange}
                    />
                    {uploadForm.file ? (
                      <div className="space-y-2">
                        <FileText className="w-10 h-10 mx-auto text-blue-600" />
                        <p className="font-medium text-sm">{uploadForm.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(uploadForm.file.size)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to select a file</p>
                        <p className="text-xs text-muted-foreground">PDF, Word, Text (max 10MB)</p>
                      </div>
                    )}
                  </div>
                  
                  {uploadForm.file && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input 
                          placeholder="Document title"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Meeting Type</Label>
                          <Select 
                            value={uploadForm.meetingType} 
                            onValueChange={(v) => setUploadForm(prev => ({ ...prev, meetingType: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discovery">Discovery Call</SelectItem>
                              <SelectItem value="stakeholder">Stakeholder Interview</SelectItem>
                              <SelectItem value="presentation">Presentation</SelectItem>
                              <SelectItem value="qbr">QBR</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input 
                            type="date"
                            value={uploadForm.meetingDate}
                            onChange={(e) => setUploadForm(prev => ({ ...prev, meetingDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Notes</Label>
                        <Textarea 
                          placeholder="Any context about this document..."
                          value={uploadForm.freeformNotes}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, freeformNotes: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => uploadMutation.mutate(uploadForm)}
                    disabled={!uploadForm.file || uploadMutation.isPending}
                  >
                    {uploadMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" /> Upload Document</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No {contextLabel.toLowerCase()} materials yet</p>
            <p className="text-xs mt-1">Upload documents or add notes to enrich AI coaching</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <div 
                  key={artifact.id} 
                  className="rounded-lg border bg-card overflow-hidden"
                  data-testid={`artifact-card-${artifact.id}`}
                >
                  <div 
                    className="p-3 cursor-pointer hover-elevate"
                    onClick={() => setExpandedArtifact(expandedArtifact === artifact.id ? null : artifact.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                        {getTypeIcon(artifact.artifactType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{artifact.title || artifact.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {artifact.meetingType && <span>{artifact.meetingType}</span>}
                          {artifact.meetingDate && (
                            <>
                              <span>•</span>
                              <span>{new Date(artifact.meetingDate).toLocaleDateString()}</span>
                            </>
                          )}
                          {artifact.fileSize && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(artifact.fileSize)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {artifact.aiProcessingStatus === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              processArtifactMutation.mutate(artifact.id);
                            }}
                            disabled={processArtifactMutation.isPending}
                            data-testid={`button-process-artifact-${artifact.id}`}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Analyze
                          </Button>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getStatusIcon(artifact.aiProcessingStatus)}
                          <span className="ml-1 capitalize">{artifact.aiProcessingStatus.replace('_', ' ')}</span>
                        </Badge>
                        {expandedArtifact === artifact.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedArtifact === artifact.id && (
                    <div className="px-3 pb-3 pt-0 border-t bg-muted/30 space-y-3">
                      {artifact.freeformNotes && (
                        <div className="pt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                          <p className="text-sm whitespace-pre-wrap">{artifact.freeformNotes}</p>
                        </div>
                      )}
                      
                      {artifact.aiSummary && (
                        <div className="p-3 rounded-md bg-violet-500/5 border border-violet-500/20">
                          <div className="flex items-center gap-1 text-xs font-medium text-violet-700 mb-1">
                            <Sparkles className="w-3 h-3" />
                            AI Summary
                          </div>
                          <p className="text-sm">{artifact.aiSummary}</p>
                        </div>
                      )}
                      
                      {artifact.aiExtractedInsights && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {artifact.aiExtractedInsights.insights?.length > 0 && (
                            <div className="p-2 rounded-md bg-blue-500/5 border border-blue-500/10">
                              <div className="flex items-center gap-1 text-xs font-medium text-blue-700 mb-1">
                                <Lightbulb className="w-3 h-3" />
                                Key Insights
                              </div>
                              <ul className="text-xs space-y-1">
                                {artifact.aiExtractedInsights.insights.slice(0, 3).map((insight: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-blue-600">•</span>
                                    <span>{insight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {artifact.aiExtractedInsights.actionItems?.length > 0 && (
                            <div className="p-2 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                              <div className="flex items-center gap-1 text-xs font-medium text-emerald-700 mb-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Action Items
                              </div>
                              <ul className="text-xs space-y-1">
                                {artifact.aiExtractedInsights.actionItems.slice(0, 3).map((item: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-600">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {artifact.aiExtractedInsights.risks?.length > 0 && (
                            <div className="p-2 rounded-md bg-amber-500/5 border border-amber-500/10">
                              <div className="flex items-center gap-1 text-xs font-medium text-amber-700 mb-1">
                                <AlertTriangle className="w-3 h-3" />
                                Risks/Concerns
                              </div>
                              <ul className="text-xs space-y-1">
                                {artifact.aiExtractedInsights.risks.slice(0, 3).map((risk: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-amber-600">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {artifact.aiExtractedInsights.stakeholderMentions?.length > 0 && (
                            <div className="p-2 rounded-md bg-muted">
                              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                                <Users className="w-3 h-3" />
                                Stakeholders Mentioned
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {artifact.aiExtractedInsights.stakeholderMentions.map((name: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-[10px]">{name}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-end pt-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteArtifactMutation.mutate(artifact.id)}
                          data-testid={`button-delete-artifact-full-${artifact.id}`}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
