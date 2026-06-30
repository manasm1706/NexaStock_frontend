import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/app/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { SectionTitle } from "@/components/ui/typography";
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, authState } from "@/lib/api/client";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/users/$userId/profile")({
  head: () => ({ meta: [{ title: "User Profile · NexaStock" }] }),
  beforeLoad: ({ location }) => {
    if (!authState.isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => api.getUserProfile(userId)
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState("");
  const [languagesSpoken, setLanguagesSpoken] = useState<string[]>([]);
  const [langInput, setLangInput] = useState("");
  const [notes, setNotes] = useState("");

  // Initialize form when data loads
  useState(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      setJobTitle(p.jobTitle || "");
      setPhoneNumber(p.phoneNumber || "");
      setDateOfBirth(p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : "");
      setEmergencyContact(p.emergencyContact || "");
      setEmergencyPhone(p.emergencyPhone || "");
      setHireDate(p.hireDate ? new Date(p.hireDate).toISOString().split('T')[0] : "");
      setEmploymentType(p.employmentType || "");
      setWorkSchedule(p.workSchedule || "");
      setNationalId(p.nationalId || "");
      setPassportNumber(p.passportNumber || "");
      setTaxId(p.taxId || "");
      setBankAccountNumber(p.bankAccountNumber || "");
      setBankName(p.bankName || "");
      setBankBranch(p.bankBranch || "");
      setSkills(p.skills || []);
      setCertifications(p.certifications || []);
      setLanguagesSpoken(p.languagesSpoken || []);
      setNotes(p.notes || "");
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUserProfile(userId, {
        jobTitle,
        phoneNumber,
        dateOfBirth: dateOfBirth || null,
        emergencyContact,
        emergencyPhone,
        hireDate: hireDate || null,
        employmentType,
        workSchedule,
        nationalId,
        passportNumber,
        taxId,
        bankAccountNumber,
        bankName,
        bankBranch,
        skills: skills.length > 0 ? skills : null,
        certifications: certifications.length > 0 ? certifications : null,
        languagesSpoken: languagesSpoken.length > 0 ? languagesSpoken : null,
        notes
      });

      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("User profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleAddCert = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput("");
    }
  };

  const handleAddLang = () => {
    if (langInput.trim() && !languagesSpoken.includes(langInput.trim())) {
      setLanguagesSpoken([...languagesSpoken, langInput.trim()]);
      setLangInput("");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="User Profile" subtitle="Loading profile...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout title="User Profile" subtitle="Not found">
        <GlassCard className="p-6 text-center">
          <p className="text-muted-foreground">User profile not found.</p>
          <Button variant="outline" onClick={() => navigate({ to: "/settings" })} className="mt-4">
            Back to Settings
          </Button>
        </GlassCard>
      </DashboardLayout>
    );
  }

  const { fullName, email, role, locations, permissionOverrides } = profileData;

  return (
    <DashboardLayout 
      title={`${fullName}'s Profile`} 
      subtitle={`${role.name} · ${email}`}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate({ to: "/settings" })}
            className="h-9 text-xs flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Team
          </Button>
          
          {!isEditing ? (
            <Button 
              variant="premiumGradient" 
              onClick={() => setIsEditing(true)}
              className="h-9 text-xs"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button 
                variant="premiumGradient" 
                onClick={handleSave}
                disabled={saving}
                className="h-9 text-xs flex items-center gap-1"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
              </Button>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <GlassCard className="p-6">
          <SectionTitle>Basic Information</SectionTitle>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Full Name</label>
              <div className="mt-1.5 h-9 flex items-center px-3 rounded-xl border border-white/10 bg-black/20 text-xs text-foreground">
                {fullName}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Email</label>
              <div className="mt-1.5 h-9 flex items-center px-3 rounded-xl border border-white/10 bg-black/20 text-xs text-foreground font-mono">
                {email}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Role</label>
              <div className="mt-1.5 h-9 flex items-center px-3 rounded-xl border border-white/10 bg-black/20 text-xs text-foreground">
                {role.name}
              </div>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Assigned Locations</label>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {locations.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Global Access</span>
                ) : (
                  locations.map((loc: any) => (
                    <span key={loc.locationId} className="text-[10px] text-primary bg-primary/5 border border-primary/15 px-1.5 py-0.5 rounded-md font-semibold">
                      {loc.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Employment Details */}
        <GlassCard className="p-6">
          <SectionTitle>Employment Details</SectionTitle>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Phone Number</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Hire Date</label>
              <input
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                type="date"
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Employment Type</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select...</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Work Schedule</label>
              <input
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
                disabled={!isEditing}
                placeholder="9 AM - 6 PM"
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Date of Birth</label>
              <input
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                type="date"
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>
        </GlassCard>

        {/* Emergency & Documents */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <SectionTitle>Emergency Contact</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Contact Name</label>
                <input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Contact Phone</label>
                <input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle>Identity Documents</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">National ID</label>
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Aadhaar / SSN"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Passport Number</label>
                <input
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Tax ID</label>
                <input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  disabled={!isEditing}
                  placeholder="PAN / TIN"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Bank Details */}
        <GlassCard className="p-6">
          <SectionTitle>Bank Account Details</SectionTitle>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Account Number</label>
              <input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Branch</label>
              <input
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                disabled={!isEditing}
                className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>
        </GlassCard>

        {/* Skills & Languages */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <SectionTitle>Skills & Certifications</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Skills</label>
                {isEditing && (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                      placeholder="Add skill..."
                      className="flex-1 h-9 rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <Button type="button" onClick={handleAddSkill} size="sm" variant="outline" className="h-9 px-3">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium">
                      {skill}
                      {isEditing && (
                        <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-primary/60">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Certifications</label>
                {isEditing && (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCert())}
                      placeholder="Add certification..."
                      className="flex-1 h-9 rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <Button type="button" onClick={handleAddCert} size="sm" variant="outline" className="h-9 px-3">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {certifications.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success border border-success/20 text-[10px] font-medium">
                      {cert}
                      {isEditing && (
                        <button onClick={() => setCertifications(certifications.filter(c => c !== cert))} className="hover:text-success/60">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionTitle>Languages & Notes</SectionTitle>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Languages Spoken</label>
                {isEditing && (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      value={langInput}
                      onChange={(e) => setLangInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLang())}
                      placeholder="Add language..."
                      className="flex-1 h-9 rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary"
                    />
                    <Button type="button" onClick={handleAddLang} size="sm" variant="outline" className="h-9 px-3">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {languagesSpoken.map(lang => (
                    <span key={lang} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent/10 text-accent border border-accent/20 text-[10px] font-medium">
                      {lang}
                      {isEditing && (
                        <button onClick={() => setLanguagesSpoken(languagesSpoken.filter(l => l !== lang))} className="hover:text-accent/60">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/2 p-2 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed font-sans resize-none"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Permissions */}
        <GlassCard className="p-6">
          <SectionTitle>Effective Permissions</SectionTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {permissionOverrides && permissionOverrides.length > 0 ? (
              permissionOverrides.map((perm: any) => (
                <span 
                  key={perm.permissionId} 
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border ${
                    perm.allowed 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {perm.permissionName}: {perm.allowed ? "ALLOWED" : "DENIED"}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Inheriting all permissions from role</span>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
