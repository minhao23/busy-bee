import { useRef, useState } from "react";
import { Task } from "../types";
import Icon from "./Icon";

export const quadrants = [
  { id: 1, title: "Do now", description: "Urgent & important" },
  { id: 2, title: "Plan ahead", description: "Important, not urgent" },
  { id: 3, title: "Handle soon", description: "Urgent, less important" },
  { id: 4, title: "Low priority", description: "Not urgent or important" },
] as const;
export type Importance = 1 | 2 | 3 | 4;

type Props = {
  task: Task;
  disabled: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onMove: (importance: Importance) => void;
  onDrag: (id: number | null, quadrant: Importance | null) => void;
};

export default function TaskCard({ task, disabled, onComplete, onDelete, onMove, onDrag }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const gesture = useRef<{ x: number; y: number; moved: boolean; target: Importance | null } | null>(null);
  const suppressClick = useRef(false);
  const moveButton = useRef<HTMLButtonElement>(null);

  const endGesture = (cancel = false) => {
    const current = gesture.current;
    gesture.current = null;
    setDragging(false);
    onDrag(null, null);
    if (!cancel && current?.moved && current.target) onMove(current.target);
  };

  return (
    <div data-task-id={task.id} className={`task ${task.finished_at ? "task-completed" : ""} ${dragging ? "task-dragging" : ""}`}>
      <div className="task-main">
        <label className="task-check">
          <input type="checkbox" checked={!!task.finished_at} disabled={disabled}
            onChange={onComplete} aria-label={`${task.finished_at ? "Reopen" : "Complete"} ${task.task_name}`} />
        </label>
        <span className="task-name">{task.task_name}</span>
      </div>
      <button ref={moveButton} className="task-move" disabled={disabled}
        aria-label={`Move or manage ${task.task_name}`} aria-expanded={expanded}
        onClick={() => {
          // A pointer drag is followed by click; only taps should open the controls.
          if (suppressClick.current) { suppressClick.current = false; return; }
          setExpanded(!expanded);
        }}
        onPointerDown={(event) => {
          if (event.button !== 0 || task.finished_at) return;
          suppressClick.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
          gesture.current = { x: event.clientX, y: event.clientY, moved: false, target: null };
        }}
        onPointerMove={(event) => {
          const current = gesture.current;
          if (!current) return;
          if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8) return;
          current.moved = true;
          suppressClick.current = true;
          const zone = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-quadrant]");
          current.target = zone ? Number(zone.dataset.quadrant) as Importance : null;
          setPosition({ x: event.clientX, y: event.clientY });
          setDragging(true);
          onDrag(task.id, current.target);
          if (event.clientY > window.innerHeight - 100) window.scrollBy(0, 10);
          if (event.clientY < 80) window.scrollBy(0, -10);
        }}
        onPointerUp={() => endGesture()}
        onPointerCancel={() => endGesture(true)}
        onLostPointerCapture={() => { if (gesture.current) endGesture(true); }}
        onKeyDown={(event) => { if (event.key === "Escape") { endGesture(true); setExpanded(false); } }}>
        <Icon name="grip" />
        <span className="sr-only">Drag to another quadrant, or tap to choose</span>
      </button>
      {expanded && (
        <div className="task-actions">
          {!task.finished_at && (
            <label className="task-destination">
              Move to
              <select value={task.importance} disabled={disabled} aria-label={`Quadrant for ${task.task_name}`}
                onChange={(event) => {
                  onMove(Number(event.target.value) as Importance);
                  setExpanded(false);
                  requestAnimationFrame(() => moveButton.current?.focus({ preventScroll: true }));
                }}>
                {quadrants.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
              </select>
            </label>
          )}
          <button className="task-delete" disabled={disabled} onClick={onDelete}>
            <Icon name="trash" /> Delete task
          </button>
        </div>
      )}
      {dragging && (
        <div className="task-drag-preview" style={{ left: position.x, top: position.y }} aria-hidden="true">
          {task.task_name}
        </div>
      )}
    </div>
  );
}
