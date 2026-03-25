import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { adminApi, type AcademySettings } from "@/lib/api";
import { toast } from "sonner";

const AdminSettings = () => {
  const [settings, setSettings] = useState<AcademySettings>({
    academyName:  "",
    contactEmail: "",
    phone:        "",
    about:        "",
    logoUrl:      "",
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    adminApi
      .getSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message ?? "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof AcademySettings, value: string) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!settings.academyName.trim()) {
      toast.error("Academy name is required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await adminApi.updateSettings(settings);
      setSettings(updated);
      toast.success("Settings saved successfully.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your academy.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-lg">General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Academy Name *</Label>
            <Input
              value={settings.academyName}
              onChange={(e) => handleChange("academyName", e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange("contactEmail", e.target.value)}
              disabled={saving}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={saving}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label>About</Label>
            <Textarea
              value={settings.about}
              onChange={(e) => handleChange("about", e.target.value)}
              rows={4}
              disabled={saving}
              placeholder="Describe your academy..."
            />
          </div>
          <div>
            <Label>Logo URL</Label>
            <Input
              value={settings.logoUrl ?? ""}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              disabled={saving}
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-hero text-primary-foreground hover:opacity-90"
      >
        {saving
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
          : <><Save className="w-4 h-4 mr-2" />Save Settings</>}
      </Button>
    </div>
  );
};

export default AdminSettings;