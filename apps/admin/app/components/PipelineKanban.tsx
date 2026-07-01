import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import type { Lead, LeadStage } from "@ekalliptus/core";
import { LEAD_STAGE_LABELS, LEAD_STAGE_ORDER, formatIDR } from "@ekalliptus/core";

interface PipelineKanbanProps {
  board: Record<LeadStage, Lead[]>;
  onLeadUpdated: () => void;
}

const SERVICE_LABEL: Record<string, string> = { 
  website: "Web", 
  mobile: "Mobile", 
  service_device: "Maintenance" 
};

export default function PipelineKanban({ board: initialBoard, onLeadUpdated }: PipelineKanbanProps) {
  const [board, setBoard] = useState(initialBoard);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedStage, setDraggedStage] = useState<LeadStage | null>(null);
  const [activeDragCol, setActiveDragCol] = useState<string | null>(null);
  
  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  // Sync board prop updates
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  const fmt = (n: number | null) => (n ? formatIDR(n) : "");
  const stageColor = (stage: LeadStage) => `hsl(var(--status-${stage}))`;

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string, stage: LeadStage) => {
    setDraggedId(id);
    setDraggedStage(stage);
    e.dataTransfer.setData("text/plain", id);
    e.currentTarget.classList.add("moving");
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("moving");
    setDraggedId(null);
    setDraggedStage(null);
    setActiveDragCol(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    setActiveDragCol(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setActiveDragCol(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    setActiveDragCol(null);
    if (!draggedId || !draggedStage || draggedStage === targetStage) return;

    try {
      const res = await fetch(`/api/admin/leads/${draggedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage })
      });

      if (res.ok) {
        // Optimistic UI update
        const sourceLeads = board[draggedStage].filter((l) => l.id !== draggedId);
        const movedLead = board[draggedStage].find((l) => l.id === draggedId);
        if (movedLead) {
          const updatedLead = { ...movedLead, stage: targetStage };
          const targetLeads = [...board[targetStage], updatedLead];
          
          setBoard({
            ...board,
            [draggedStage]: sourceLeads,
            [targetStage]: targetLeads
          });
        }
        
        toast(`✓ Dipindah ke ${LEAD_STAGE_LABELS[targetStage]}`);
        onLeadUpdated();
      } else {
        const { error } = await res.json().catch(() => ({ error: "Gagal" }));
        toast(`✗ Gagal: ${error}`, true);
      }
    } catch (err) {
      toast("✗ Gagal memindahkan lead", true);
    }
  };

  // Toast implementation
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  const toast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastError(isError);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // Modal actions
  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setEditOpen(true);
    if (editDialogRef.current) {
      editDialogRef.current.showModal();
    }
  };

  const closeEditModal = () => {
    setEditOpen(false);
    setEditingLead(null);
    if (editDialogRef.current) {
      editDialogRef.current.close();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingLead) return;

    const fd = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(fd);
    if (data.estimated_value) data.estimated_value = Number(data.estimated_value);

    try {
      const res = await fetch(`/api/admin/leads/${editingLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        closeEditModal();
        onLeadUpdated();
      } else {
        toast("✗ Gagal memperbarui lead", true);
      }
    } catch (err) {
      toast("✗ Gagal memperbarui lead", true);
    }
  };

  const handleDeleteLead = async () => {
    if (!editingLead || !confirm("Hapus lead ini?")) return;

    try {
      const res = await fetch(`/api/admin/leads/${editingLead.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        closeEditModal();
        onLeadUpdated();
      } else {
        toast("✗ Gagal menghapus lead", true);
      }
    } catch (err) {
      toast("✗ Gagal menghapus lead", true);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar" id="kanban-board">
      {LEAD_STAGE_ORDER.map((stage) => (
        <div key={stage} className="kanban-col flex-shrink-0 w-64 glass-panel rounded-2xl p-3" data-stage={stage}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: stageColor(stage) }}></span>
              <span className="text-xs font-bold uppercase tracking-wider">{LEAD_STAGE_LABELS[stage]}</span>
              <span className="text-xs text-muted-foreground count-badge">({board[stage]?.length || 0})</span>
            </div>
          </div>
          
          <div 
            className={`kanban-list space-y-2 min-h-[150px] rounded-lg p-1 transition-colors ${
              activeDragCol === stage ? "bg-primary/80 outline-dashed outline-2 outline-primary/40 outline-offset-[-2px]" : ""
            }`}
            data-stage={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage)}
          >
            {(!board[stage] || board[stage].length === 0) ? (
              <div className="empty-state text-center py-6 text-xs text-muted-foreground/50 border border-dashed border-border/50 rounded-lg">
                Kosong
              </div>
            ) : (
              board[stage].map((lead) => (
                <div
                  key={lead.id}
                  className="kanban-card rounded-lg bg-card border border-border p-2.5 cursor-grab transition-all hover:shadow-md hover:border-primary/30 active:cursor-grabbing text-left"
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, lead.id, stage)}
                  onDragEnd={handleDragEnd}
                  onClick={() => openEditModal(lead)}
                  style={{ borderLeft: `3px solid ${stageColor(stage)}` }}
                >
                  <div className="font-medium text-sm text-foreground">{lead.name}</div>
                  {lead.service_interest && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {SERVICE_LABEL[lead.service_interest] ?? lead.service_interest}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    {lead.estimated_value ? (
                      <div className="text-[11px] font-semibold" style={{ color: stageColor(stage) }}>
                        {fmt(Number(lead.estimated_value))}
                      </div>
                    ) : (
                      <div></div>
                    )}
                    <span className="text-[10px] text-muted-foreground/40 opacity-0 hover:opacity-100 transition-opacity">
                      edit
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      {/* Toast feedback */}
      {toastMsg && (
        <div 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-4 py-2 text-xs font-medium shadow-lg transition-all duration-300"
          style={{ color: toastError ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
        >
          {toastMsg}
        </div>
      )}

      {/* Edit modal */}
      <dialog ref={editDialogRef} className="rounded-2xl p-0 backdrop:bg-black/50 max-w-[90vw]">
        {editingLead && (
          <form onSubmit={handleEditSubmit} className="glass-panel p-5 w-[380px] max-w-[90vw]">
            <h3 className="text-sm font-semibold mb-3">Edit Lead</h3>
            <input type="hidden" name="id" value={editingLead.id} />
            <div className="space-y-2.5">
              <input 
                name="name" 
                required
                defaultValue={editingLead.name}
                placeholder="Nama" 
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
              <input 
                name="whatsapp" 
                defaultValue={editingLead.whatsapp || ""}
                placeholder="WhatsApp" 
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
              <input 
                name="company" 
                defaultValue={editingLead.company || ""}
                placeholder="Perusahaan" 
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
              <select 
                name="service_interest" 
                defaultValue={editingLead.service_interest || ""}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Pilih layanan...</option>
                <option value="website">Website</option>
                <option value="mobile">Mobile App</option>
                <option value="service_device">Maintenance</option>
              </select>
              <input 
                name="estimated_value" 
                type="number" 
                defaultValue={editingLead.estimated_value || ""}
                placeholder="Estimasi nilai (Rp)" 
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
              <textarea 
                name="notes" 
                defaultValue={editingLead.notes || ""}
                placeholder="Catatan" 
                rows={2} 
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <div className="mt-4 flex justify-between gap-2">
              <button 
                type="button" 
                onClick={handleDeleteLead}
                className="rounded-lg border border-destructive/40 text-destructive px-3 py-1.5 text-xs hover:bg-destructive/10 transition cursor-pointer"
              >
                Hapus
              </button>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={closeEditModal}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent/40 transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
