import type { TimelineItem } from "./types";

export function isFutureTimelineItem(item: TimelineItem, now = new Date()) {
  if (!item.event.defaultVisibleFrom) {
    return false;
  }

  return new Date(item.event.defaultVisibleFrom).getTime() > now.getTime();
}

export function sortNotesForTimeline(items: TimelineItem[]) {
  return [...items].sort((left, right) => {
    const rightDate = new Date(`${right.event.date}T00:00:00.000Z`).getTime();
    const leftDate = new Date(`${left.event.date}T00:00:00.000Z`).getTime();

    if (rightDate !== leftDate) {
      return rightDate - leftDate;
    }

    return right.event.dateLabel.localeCompare(left.event.dateLabel);
  });
}

export function findNextReadableTimelineIndex(items: TimelineItem[], currentIndex: number, now = new Date()) {
  const nextIndex = items.findIndex((item, index) => index > currentIndex && !isFutureTimelineItem(item, now));

  return nextIndex === -1 ? null : nextIndex;
}
