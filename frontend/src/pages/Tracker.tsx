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

const COLUMNS: { id: TrackerStage; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'online_test', label: 'Online test' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Archived' },
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
      className="p-3 rounded-lg border border-border bg-surface hover:bg-surface-elevated transition-colors cursor-grab active:cursor-grabbing space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[11px] font-mono text-secondary block truncate">
            {listing.company}
          </span>
          <h4 className="font-medium text-xs text-foreground truncate">
            {listing.title}
          </h4>
        </div>
        <a
          href={listing.canonical_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
          title="Open original posting"
          aria-label="Open original posting"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Deadline indicator if present */}
      {listing.deadline && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className={isUrgent ? 'text-removed font-medium' : 'text-muted-foreground'}>
            {deadlineLabel}
          </span>
          {isUrgent && <AlertCircle className="w-3 h-3 text-removed" />}
        </div>
      )}

      {/* Notes preview */}
      {trackerItem.notes && (
        <div className="p-1.5 rounded bg-surface-elevated border border-border text-[11px] text-muted-foreground flex items-start gap-1.5">
          <FileText className="w-3 h-3 text-secondary shrink-0 mt-0.5" />
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

    const targetColumn = COLUMNS.find((col) => col.id === overId);
    let newStage: TrackerStage | null = targetColumn ? targetColumn.id : null;

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
              toast.success(`Moved to ${newStage.replace('_', ' ')}`);
            },
          }
        );
      }
    }
  };

  const activeDragListing = listings.find((l) => l.entity_id === activeDragId);
  const activeDragTracker = trackerList.find((t) => t.entity_id === activeDragId);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border text-secondary flex items-center justify-center">
              <KanbanIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-medium text-foreground tracking-tight">
              Application tracker
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize internship applications between interview stages with drag-and-drop
          </p>
        </div>

        <Link
          to="/listings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-elevated hover:bg-surface border border-border text-foreground transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5 text-secondary" />
          <span>Browse listings</span>
        </Link>
      </div>

      {/* Kanban Board Container */}
      {isTrackerLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 rounded-xl bg-surface border border-border" />
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-4">
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
                  className="rounded-xl border border-border bg-surface-elevated/40 p-3 flex flex-col min-h-[460px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                    <span className="text-xs font-medium text-foreground">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-secondary">
                      {columnListings.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <SortableContext
                    id={col.id}
                    items={columnListings.map((c) => c.listing.entity_id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 flex-1 min-h-[100px]">
                      {columnListings.length === 0 ? (
                        <div className="h-28 rounded-lg border border-dashed border-border flex items-center justify-center p-3 text-center">
                          <span className="text-[11px] text-muted-foreground">
                            Drop listings here
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
              <div className="p-3 rounded-lg border border-secondary bg-surface shadow-lg pointer-events-none">
                <span className="text-[11px] font-mono text-secondary block">
                  {activeDragListing.company}
                </span>
                <h4 className="font-medium text-xs text-foreground">
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
