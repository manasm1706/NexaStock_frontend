import { useState } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card/GlassCard";
import { Loader2, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: any[];
  locations: any[];
  onSuccess: () => void;
}

export function InviteUserModal({ isOpen, onClose, roles, locations, onSuccess }: InviteUserModalProps) {
  const [step, setStep] = useState<"basic" | "profile">("basic");
  
  // Basic info
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [department, setDepartment] = useState("");
  
  // Profile fields
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [workSchedule, setWorkSchedule] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [notes, setNotes] = useState("");
  
  const [inviting, setInviting] = useState(false);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const resetForm = () => {
    setStep("basic");
    setEmail("");
    setFullName("");
    setRoleId("");
    setSelectedLocations([]);
    setDepartment("");
    setJobTitle("");
    setPhoneNumber("");
    setHireDate("");
    setEmploymentType("");
    setWorkSchedule("");
    setDateOfBirth("");
    setEmergencyContact("");
    setEmergencyPhone("");
    setNationalId("");
    setSkills([]);
    setSkillInput("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!email.trim() || !fullName.trim() || !roleId) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setInviting(true);
    try {
      const userProfile: any = {};
      if (jobTitle) userProfile.jobTitle = jobTitle;
      if (phoneNumber) userProfile.phoneNumber = phoneNumber;
      if (hireDate) userProfile.hireDate = hireDate;
      if (employmentType) userProfile.employmentType = employmentType;
      if (workSchedule) userProfile.workSchedule = workSchedule;
      if (dateOfBirth) userProfile.dateOfBirth = dateOfBirth;
      if (emergencyContact) userProfile.emergencyContact = emergencyContact;
      if (emergencyPhone) userProfile.emergencyPhone = emergencyPhone;
      if (nationalId) userProfile.nationalId = nationalId;
      if (skills.length > 0) userProfile.skills = skills;
      if (notes) userProfile.notes = notes;

      const result = await api.inviteUser(email, fullName, roleId, {
        assignedLocations: selectedLocations,
        department: department || undefined,
        userProfile: Object.keys(userProfile).length > 0 ? userProfile : undefined
      });

      toast.success(
        <div>
          <span className="font-semibold">User Invited Successfully!</span>
          <p className="text-[10px] text-muted-foreground mt-1 select-all font-mono bg-black/30 p-1 rounded border border-white/5">
            Link: {window.location.origin + result.inviteLink}
          </p>
        </div>,
        { duration: 15000 }
      );

      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const selectedRole = roles.find(r => r.id === roleId);
  const requiresLocations = selectedRole && !["business_owner", "super_admin"].includes(selectedRole.code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border-white/10 shadow-premium relative">
        <div className="flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-sm pb-3 border-b border-white/5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Invite New Team Member</h3>
            <p className="text-xs text-muted-foreground">Add a new employee with complete profile details</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex gap-2">
          <button
            onClick={() => setStep("basic")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              step === "basic" 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "bg-white/2 text-muted-foreground border border-white/5 hover:bg-white/5"
            }`}
          >
            1. Basic Info & Role
          </button>
          <button
            onClick={() => setStep("profile")}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              step === "profile" 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "bg-white/2 text-muted-foreground border border-white/5 hover:bg-white/5"
            }`}
          >
            2. Employee Profile (Optional)
          </button>
        </div>

        {/* Step 1: Basic Info */}
        {step === "basic" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Full Name *</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Email Address *</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  type="email"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Role *</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="">Select a role...</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Department</label>
                <input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Sales, Operations, etc."
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {requiresLocations && (
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">
                  Assign Locations {requiresLocations && <span className="text-destructive">*</span>}
                </label>
                <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto border border-white/10 rounded-xl p-2 bg-black/20">
                  {locations.map((loc: any) => (
                    <label key={loc.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/3 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, loc.id]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(id => id !== loc.id));
                          }
                        }}
                        className="rounded border-white/10 bg-white/2 text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="font-medium">{loc.name}</span>
                      <span className="text-[9px] text-muted-foreground">({loc.type})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep("profile")} className="text-xs h-8">
                Next: Employee Profile →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Employee Profile */}
        {step === "profile" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Job Title</label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Store Manager"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Phone Number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91-9876543210"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Hire Date</label>
                <input
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  type="date"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="">Select...</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Date of Birth</label>
                <input
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  type="date"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Work Schedule</label>
                <input
                  value={workSchedule}
                  onChange={(e) => setWorkSchedule(e.target.value)}
                  placeholder="9 AM - 6 PM, Mon-Fri"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">National ID</label>
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Aadhaar / SSN"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Emergency Contact Name</label>
                <input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Emergency Contact Phone</label>
                <input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91-9876543210"
                  className="mt-1.5 h-9 w-full rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Skills</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                  placeholder="e.g. Inventory Management"
                  className="flex-1 h-9 rounded-xl border border-white/10 bg-white/2 px-3 text-xs text-foreground outline-none focus:border-primary transition-all"
                />
                <Button type="button" onClick={handleAddSkill} size="sm" variant="outline" className="h-9 px-3 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {skills.map(skill => (
                    <span key={skill} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-medium">
                      {skill}
                      <button onClick={() => handleRemoveSkill(skill)} className="hover:text-primary/60">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground font-semibold">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional employee notes..."
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/2 p-2 text-xs text-foreground outline-none focus:border-primary font-sans resize-none"
              />
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setStep("basic")} className="text-xs h-8">
                ← Back to Basic Info
              </Button>
              <Button variant="premiumGradient" size="sm" onClick={handleSubmit} disabled={inviting} className="text-xs h-8">
                {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send Invitation"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
