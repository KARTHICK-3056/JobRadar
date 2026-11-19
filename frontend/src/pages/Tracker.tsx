import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Kanban as KanbanIcon,
  Clock,
  ExternalLink,
  PlusCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTracker, useListings, useUpdateTracker } from '../hooks/useJobRadar';
import { ListingDrawer } from '../components/listings/ListingDrawer';
import { getDaysRemaining } from '../lib/utils';
import type { TrackerStage, Listing, TrackerItem } from '../types';
import { toast } from 'sonner';

const COLUMNS: { id: TrackerStage; label: string; color: string; bg: string }[] = [
  { id: 'saved', label: 'Saved', color: 'text-cyan-400', bg: 'border-cyan-500/25 bg-cyan-500/5' },
  { id: 'applied', label: 'Applied', color: 'text-violet-400', bg: 'border-violet-500/25 bg-violet-500/5' },
  { id: 'online_test', label: 'Online Test (OA)', color: 'text-amber-400', bg: 'border-amber-500/25 bg-amber-500/5' },
  { id: 'interview', label: 'Interview', color: 'text-emerald-400', bg: 'border-emerald-500/25 bg-emerald-500/5' },
  { id: 'offer', label: 'Offer', color: 'text-teal-300', bg: 'border-teal-500/25 bg-teal-500/5' },
  { id: 'rejected', label: 'Archived / Rejected', color: 'text-slate-400', bg: 'border-slate-500/25 bg-slate-500/5' },
];

interface KanbanCardProps {
  listing: Listing;
  trackerItem: TrackerItem;
  onClick: () => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ listing, trackerItem, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: listing.entity_id,
    data: { listing, trackerItem },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const { label: deadlineLabel, isUrgent } = getDaysRemaining(listing.deadline);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3.5 rounded-xl border border-border bg-surface/90 hover:bg-surface-elevated hover:border-cyan-500/30 shadow-sm backdrop-blur-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-mono font-medium text-cyan-400 block truncate">
            {listing.company}
          </span>
          <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-cyan-300 transition-colors">
            {listing.title}
          </h4>
        </div>
        <a
          href={listing.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-muted-foreground hover:text-cyan-400 shrink-0"
          title="Open original posting"
          aria-label="Open original posting"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Deadline pill if present */}
      {listing.deadline && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className={isUrgent ? 'text-rose-400 font-semibold' : 'text-muted-foreground'}>
            {deadlineLabel}
          </span>
          {isUrgent && <AlertCircle className="w-3 h-3 text-rose-400" />}
        </div>
      )}

      {/* Notes preview */}
      {trackerItem.notes && (
        <div className="p-2 rounded-lg bg-surface-elevated/60 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-1.5 line-clamp-2">
          <FileText className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{trackerItem.notes}</p>
        </div>
      )}
    </div>
  );
};

export const Tracker: React.FC = () => {
  const { data: trackerList = [], isLoading: isTrackerLoading } = useTracker();
  const { data: listingsData } = useListings();
  const updateTrackerMutation = useUpdateTracker();

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const listings = listingsData?.items ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeEntityId = String(active.id);
    const overId = String(over.id);

    // If dropped onto a column container (e.g. "applied", "interview", etc.)
    const targetColumn = COLUMNS.find((col) => col.id === overId);
    let newStage: TrackerStage | null = targetColumn ? targetColumn.id : null;

    // If dropped onto another item in a column, find that item's column
    if (!newStage) {
      const overTrackerItem = trackerList.find((t) => t.entity_id === overId);
      if (overTrackerItem) {
        newStage = overTrackerItem.status;
      }
    }

    if (newStage) {
      const currentItem = trackerList.find((t) => t.entity_id === activeEntityId);
      if (currentItem && currentItem.status !== newStage) {
        updateTrackerMutation.mutate(
          {
            entityId: activeEntityId,
            status: newStage,
            notes: currentItem.notes,
          },
          {
            onSuccess: () => {
              toast.success(`Moved to "${newStage.replace('_', ' ').toUpperCase()}"`);
            },
          }
        );
      }
    }
  };

  const activeDragListing = listings.find((l) => l.entity_id === activeDragId);
  const activeDragTracker = trackerList.find((t) => t.entity_id === activeDragId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
              <KanbanIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Application Tracker
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop job cards between interview stages with optimistic updates
          </p>
        </div>

        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Jobs from Listings</span>
        </Link>
      </div>

      {/* Kanban Board Container */}
      {isTrackerLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-surface/50 border border-border/50" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
            {COLUMNS.map((col) => {
              const columnItems = trackerList.filter((t) => t.status === col.id);
              const columnListings = columnItems
                .map((t) => ({
                  tracker: t,
                  listing: listings.find((l) => l.entity_id === t.entity_id),
                }))
                .filter((item): item is { tracker: TrackerItem; listing: Listing } => !!item.listing);

              return (
                <div
                  key={col.id}
                  id={col.id}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[480px] backdrop-blur-xl ${col.bg}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/80">
                    <span className={`text-xs font-bold font-mono uppercase tracking-wider ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border text-foreground">
                      {columnListings.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <SortableContext
                    id={col.id}
                    items={columnListings.map((c) => c.listing.entity_id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2.5 flex-1 min-h-[100px]">
                      {columnListings.length === 0 ? (
                        <div className="h-32 rounded-xl border border-dashed border-border/60 flex items-center justify-center p-3 text-center">
                          <span className="text-[11px] text-muted-foreground">
                            Drag listings here
                          </span>
                        </div>
                      ) : (
                        columnListings.map(({ listing, tracker }) => (
                          <KanbanCard
                            key={listing.entity_id}
                            listing={listing}
                            trackerItem={tracker}
                            onClick={() => setSelectedListing(listing)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>
                </div>
              );
            })}
          </div>

          {/* Drag Overlay Ghost */}
          <DragOverlay>
            {activeDragListing && activeDragTracker ? (
              <div className="p-3.5 rounded-xl border border-cyan-500 bg-surface shadow-2xl scale-105 pointer-events-none">
                <span className="text-[11px] font-mono text-cyan-400 block">
                  {activeDragListing.company}
                </span>
                <h4 className="font-semibold text-xs text-foreground">
                  {activeDragListing.title}
                </h4>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Detailed Drawer when card is clicked */}
      <ListingDrawer
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
};
