import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, DollarSign } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface YearData {
  year: number;
  incrementalCashFlow: number;
  cumulative: number;
  npv: number;
  notes: string;
  calculation?: string;
}

interface FinancialAppendixProps {
  data: YearData[];
  totalNPV: number;
  paybackMonths: number;
  discountRate: number;
}

export default function FinancialAppendix({ data, totalNPV, paybackMonths, discountRate }: FinancialAppendixProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [showArithmetic, setShowArithmetic] = useState(false);

  const toggleRow = (year: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedRows(newExpanded);
    console.log('Row toggled:', year);
  };

  return (
    <Card data-testid="card-financial-appendix">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" />
              Financial Appendix
            </CardTitle>
            <CardDescription className="mt-2">
              Year-by-year incremental cash flows with NPV calculation
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total NPV</p>
              <p className="text-3xl font-bold font-mono text-primary">${(totalNPV / 1000000).toFixed(2)}M</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Payback</p>
              <p className="text-3xl font-bold font-mono">{paybackMonths} mo</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <Badge variant="secondary">Discount Rate: {discountRate}%</Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              setShowArithmetic(!showArithmetic);
              console.log('Show arithmetic toggled:', !showArithmetic);
            }}
            data-testid="button-show-arithmetic"
          >
            {showArithmetic ? "Hide" : "Show"} Arithmetic
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showArithmetic && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">NPV Formula</p>
            <code className="text-xs font-mono block">
              NPV = Σ (Cash Flow_t / (1 + r)^t) where r = {discountRate}%
            </code>
          </div>
        )}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Incremental Cash Flow</TableHead>
                <TableHead className="text-right">Cumulative</TableHead>
                <TableHead className="text-right">NPV</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <>
                  <TableRow 
                    key={row.year} 
                    className="hover-elevate cursor-pointer"
                    onClick={() => toggleRow(row.year)}
                    data-testid={`row-year-${row.year}`}
                  >
                    <TableCell>
                      {row.calculation && (
                        expandedRows.has(row.year) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">{row.year}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${(row.incrementalCashFlow / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${(row.cumulative / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      ${(row.npv / 1000000).toFixed(2)}M
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.notes}</TableCell>
                  </TableRow>
                  {expandedRows.has(row.year) && row.calculation && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/50">
                        <div className="p-4">
                          <p className="text-sm font-medium mb-2">Calculation Steps</p>
                          <code className="text-xs font-mono block whitespace-pre-wrap">
                            {row.calculation}
                          </code>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
