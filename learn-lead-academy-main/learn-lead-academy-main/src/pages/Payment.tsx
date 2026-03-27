import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userApi, type PaymentSession } from "@/lib/api";
import { toast } from "sonner";

const Payment = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [channel, setChannel] = useState<PaymentSession["channel"]>("QrUpi");
  const [transactionReference, setTransactionReference] = useState("");

  const loadPayment = async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await userApi.getPaymentById(id);
      setPayment(data);
      setChannel(data.channel || "QrUpi");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to load payment details.");
      navigate("/courses");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadPayment();
  }, [id]);

  useEffect(() => {
    if (!payment) return;
    if (payment.status === "Paid" || payment.status === "Rejected" || payment.status === "Expired") return;

    const timer = setInterval(() => {
      loadPayment(true);
    }, 12000);

    return () => clearInterval(timer);
  }, [payment?.status, id]);

  const statusTone = (status: PaymentSession["status"]) => {
    if (status === "Paid") return "bg-green-50 text-green-700 border-green-200";
    if (status === "UnderReview") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Rejected") return "bg-red-50 text-red-700 border-red-200";
    if (status === "Expired") return "bg-slate-100 text-slate-700 border-slate-200";
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const remaining = useMemo(() => {
    if (!payment) return "";
    const diff = new Date(payment.expiresAt).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s remaining`;
  }, [payment]);

  const submitForReview = async () => {
    if (!id) return;
    if (transactionReference.trim().length < 6) {
      toast.error("Enter a valid transaction reference.");
      return;
    }

    setSubmitting(true);
    try {
      const updated = await userApi.submitPayment(id, {
        channel,
        transactionReference: transactionReference.trim(),
      });
      setPayment(updated);
      toast.success("Payment submitted. Our admin team will verify it shortly.");
    } catch (err: any) {
      toast.error(err.message ?? "Could not submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <Link to={`/courses/${payment.courseId}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </Link>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-2xl font-display">Complete Payment</CardTitle>
                <Badge className={`border ${statusTone(payment.status)}`}>{payment.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-border p-4 space-y-1">
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-semibold text-foreground">{payment.courseTitle}</p>
                <p className="text-2xl font-bold text-primary">₹{payment.amount.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">Reference: {payment.referenceCode}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock3 className="w-3 h-3" /> {remaining}
                </p>
              </div>

              {payment.status === "Paid" ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 text-sm">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Payment confirmed
                  </div>
                  You can now start your learning journey.
                </div>
              ) : payment.status === "Rejected" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
                  Payment was rejected{payment.adminNote ? `: ${payment.adminNote}` : ". Please create a new payment session."}
                </div>
              ) : payment.status === "Expired" ? (
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-slate-700 text-sm">
                  This payment session expired. Please go back to the course and click Enroll again.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="channel">Payment Channel</Label>
                    <select
                      id="channel"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as PaymentSession["channel"])}
                    >
                      <option value="QrUpi">QR / UPI</option>
                      <option value="OnlineBanking">Online Banking / Gateway</option>
                      <option value="ManualBankTransfer">Manual Bank Transfer</option>
                    </select>
                  </div>

                  {payment.gatewayCheckoutUrl && (
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={payment.gatewayCheckoutUrl} target="_blank" rel="noreferrer">
                        Pay with Online Banking <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="txnRef">Transaction Reference / UTR</Label>
                    <Input
                      id="txnRef"
                      placeholder="Example: 549201832190"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={submitForReview}
                    disabled={submitting || payment.status === "UnderReview"}
                    className="w-full bg-gold-gradient text-accent-foreground font-semibold"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "I Have Paid - Submit for Verification"}
                  </Button>
                </>
              )}

              {payment.status === "Paid" && (
                <Button className="w-full" onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-display">Scan QR and Pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.qrImageBase64 ? (
                <div className="rounded-xl border border-border p-4 bg-white flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${payment.qrImageBase64}`}
                    alt="UPI payment QR"
                    className="w-64 h-64 object-contain"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  QR is unavailable because UPI settings are not configured yet.
                </p>
              )}

              <div className="text-sm text-muted-foreground space-y-2">
                <p>1. Scan the QR code in any UPI app and pay the exact amount.</p>
                <p>2. Copy your transaction reference / UTR from your banking app.</p>
                <p>3. Submit it on this page for admin verification.</p>
                <p>4. Enrollment unlocks automatically after approval.</p>
              </div>

              {payment.adminNote && (
                <div className="rounded-lg border border-border bg-secondary p-3 text-sm text-foreground">
                  Admin note: {payment.adminNote}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
