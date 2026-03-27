import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi, type PaymentSession } from "@/lib/api";
import { toast } from "sonner";

const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPayments({ page, pageSize: 20, status: status || undefined, search: search || undefined });
      setPayments(res.items);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, status]);

  const review = async (paymentId: string, approve: boolean) => {
    setReviewingId(paymentId);
    try {
      const updated = await adminApi.reviewPayment(paymentId, { approve });
      setPayments((prev) => prev.map((p) => (p.id === paymentId ? updated : p)));
      toast.success(approve ? "Payment approved and enrollment unlocked." : "Payment rejected.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not review payment.");
    } finally {
      setReviewingId(null);
    }
  };

  const badgeClass = (s: PaymentSession["status"]) => {
    if (s === "Paid") return "bg-green-50 text-green-700 border-green-200";
    if (s === "UnderReview") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "Rejected") return "bg-red-50 text-red-700 border-red-200";
    if (s === "Expired") return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Payment Verification</h1>
        <p className="text-muted-foreground mt-1">Review pending payment submissions before enrollment is activated.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search payment reference"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                loadPayments();
              }
            }}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="UnderReview">UnderReview</option>
          <option value="Paid">Paid</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
        <Button variant="outline" onClick={() => { setPage(1); loadPayments(); }}>
          Search
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead className="hidden md:table-cell">Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Submitted Ref</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payments found.</TableCell>
                  </TableRow>
                ) : payments.map((p) => {
                  const canReview = p.status === "UnderReview" || p.status === "Pending";
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{p.referenceCode}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString("en-IN")}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{p.courseTitle}</TableCell>
                      <TableCell className="text-sm">₹{p.amount.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Badge className={`border ${badgeClass(p.status)}`}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{p.submittedReference || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-700 hover:bg-green-50"
                            disabled={!canReview || reviewingId === p.id}
                            onClick={() => review(p.id, true)}
                          >
                            {reviewingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-700 hover:bg-red-50"
                            disabled={!canReview || reviewingId === p.id}
                            onClick={() => review(p.id, false)}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2 flex items-center">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
