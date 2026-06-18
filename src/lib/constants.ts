export const BUSINESS_TYPES = [
    { id: "medical", label: "Medical", icon: "💊", color: "from-blue-600/20 to-cyan-600/20", border: "border-blue-500/30", text: "text-blue-400" },
    { id: "garments", label: "Garments", icon: "👕", color: "from-purple-600/20 to-pink-600/20", border: "border-purple-500/30", text: "text-purple-400" },
    { id: "kirana", label: "Kirana", icon: "🛒", color: "from-orange-600/20 to-yellow-600/20", border: "border-orange-500/30", text: "text-orange-400" },
    { id: "restaurant", label: "Restaurant", icon: "🍴", color: "from-red-600/20 to-orange-600/20", border: "border-red-500/30", text: "text-red-400" },
    { id: "electronics", label: "Electronics", icon: "💻", color: "from-zinc-600/20 to-slate-600/20", border: "border-zinc-500/30", text: "text-zinc-400" },
];

export function getBusinessType(id: string | null | undefined) {
    return BUSINESS_TYPES.find(t => t.id === id) || BUSINESS_TYPES[4]; // Default to electronics
}
