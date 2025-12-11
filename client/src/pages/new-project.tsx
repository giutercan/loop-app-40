import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, TrendingUp, Search, Check, ChevronsUpDown, ArrowLeft, Loader2, X, Pencil, FolderOpen } from "lucide-react";
import type { Account } from "@shared/schema";
import { Link } from "wouter";

const createProjectSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  sector: z.string().optional(),
  companyLogoUrl: z.string().url().optional().or(z.literal("")),
  accountId: z.number().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface CompanySuggestion {
  name: string;
  domain: string;
  logo?: string;
}

export default function NewProject() {
  const [, setLocation] = useLocation();
  const searchString = useSearch() || "";
  const { toast } = useToast();
  const [companySearch, setCompanySearch] = useState("");
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const urlParams = new URLSearchParams(searchString);
  const accountIdParam = urlParams.get("accountId");
  const initialAccountId = accountIdParam && !isNaN(parseInt(accountIdParam)) ? parseInt(accountIdParam) : undefined;

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      companyName: "",
      sector: "",
      companyLogoUrl: "",
      accountId: initialAccountId,
    },
  });

  useEffect(() => {
    if (initialAccountId !== undefined) {
      form.setValue("accountId", initialAccountId);
    }
  }, [initialAccountId, form]);

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      const res = await apiRequest("POST", "/api/projects", {
        name: data.companyName,
        companyName: data.companyName,
        sector: data.sector || null,
        companyLogoUrl: data.companyLogoUrl || null,
        currentPhase: "discovery",
        status: "active",
        accountId: data.accountId || null,
      });
      return await res.json();
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"], refetchType: "active" });
      if (project.accountId) {
        queryClient.invalidateQueries({ queryKey: ["/api/accounts", project.accountId, "projects"], refetchType: "active" });
      }
      toast({
        title: "Initiative Created",
        description: `Successfully created initiative for ${project.companyName}`,
      });
      if (project.accountId) {
        setLocation(`/accounts/${project.accountId}/sales`);
      } else {
        setLocation(`/projects/${project.id}/discovery`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const searchCompanies = async (query: string) => {
    if (!query || query.length < 2) {
      setCompanySuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setCompanySuggestions(data);
      }
    } catch (error) {
      console.error("Company search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCompany = (company: CompanySuggestion) => {
    form.setValue("companyName", company.name);
    form.setValue("companyLogoUrl", company.logo || "");
    setOpen(false);
  };

  const onSubmit = (data: CreateProjectForm) => {
    createProjectMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1 -mx-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Korn Ferry</span>
                <p className="text-xs text-muted-foreground hidden lg:block">Loop</p>
              </div>
            </Link>
            
            <Link href="/accounts">
              <div className="inline-flex">
                <Button variant="outline" size="lg" data-testid="button-back-to-accounts">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Accounts
                </Button>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-3xl px-4 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Create New Initiative</h1>
                <p className="text-muted-foreground">Start a new client engagement</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Initiative Details</CardTitle>
              <CardDescription>
                Enter the client company information to begin your discovery process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Account Selector */}
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          Parent Account
                        </FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-account">
                              <SelectValue placeholder="Select an account (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem 
                                key={account.id} 
                                value={account.id.toString()}
                                data-testid={`option-account-${account.id}`}
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-muted-foreground" />
                                  <span>{account.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link this initiative to a client account for organized tracking
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Company Name *</FormLabel>
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-3 px-3 py-2 border rounded-md bg-muted/30">
                              {form.watch("companyLogoUrl") && (
                                <img
                                  src={form.watch("companyLogoUrl")}
                                  alt={field.value}
                                  className="w-6 h-6 rounded"
                                />
                              )}
                              <span className="font-medium" data-testid="text-selected-company">{field.value}</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                field.onChange("");
                                form.setValue("companyLogoUrl", "");
                                setCompanySearch("");
                                setCompanySuggestions([]);
                                setOpen(true);
                              }}
                              data-testid="button-change-company"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="w-full justify-between font-normal"
                                  data-testid="button-company-search"
                                >
                                  <span className="flex items-center gap-2 text-muted-foreground">
                                    <Search className="w-4 h-4" />
                                    Search for a company...
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder="Type company name..."
                                  value={companySearch}
                                  onValueChange={(value) => {
                                    setCompanySearch(value);
                                    searchCompanies(value);
                                  }}
                                  data-testid="input-company-search"
                                />
                                <CommandEmpty>
                                  {isSearching ? (
                                    <div className="flex items-center justify-center py-6">
                                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                    </div>
                                  ) : companySearch.length >= 2 ? (
                                    <div className="py-6 text-center text-sm">
                                      <p className="text-muted-foreground mb-2">No companies found</p>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          field.onChange(companySearch);
                                          setOpen(false);
                                        }}
                                        data-testid="button-use-manual-entry"
                                      >
                                        Use "{companySearch}"
                                      </Button>
                                    </div>
                                  ) : (
                                    "Type at least 2 characters to search..."
                                  )}
                                </CommandEmpty>
                                {companySuggestions.length > 0 && (
                                  <CommandGroup>
                                    {companySuggestions.map((company) => (
                                      <CommandItem
                                        key={company.domain}
                                        value={company.name}
                                        onSelect={() => selectCompany(company)}
                                        data-testid={`option-company-${company.domain}`}
                                      >
                                        <div className="flex items-center gap-3 w-full">
                                          {company.logo && (
                                            <img
                                              src={company.logo}
                                              alt={company.name}
                                              className="w-6 h-6 rounded"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{company.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                              {company.domain}
                                            </p>
                                          </div>
                                          <Check
                                            className={`ml-auto h-4 w-4 ${
                                              field.value === company.name
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`}
                                          />
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </Command>
                            </PopoverContent>
                          </Popover>
                        )}
                        <FormDescription>
                          Search for the client company or enter manually
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry / Sector</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Technology, Healthcare, Financial Services"
                            {...field}
                            data-testid="input-sector"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Helps AI generate industry-specific insights
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Link href="/accounts" className="flex-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createProjectMutation.isPending}
                      data-testid="button-create-initiative"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4 mr-2" />
                          Create Initiative
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
