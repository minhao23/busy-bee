import { useEffect, useRef, useState } from "react";
import { Task } from "../types";
import Icon from "./Icon";
import { Importance, quadrants } from "../utils/taskPriorities";

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
  const [showFullName, setShowFullName] = useState(false);
  const [nameOverflows, setNameOverflows] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const gesture = useRef<{ x: number; y: number; moved: boolean; target: Importance | null } | null>(null);
  const suppressClick = useRef(false);
  const moveButton = useRef<HTMLButtonElement>(null);
  const nameElement = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = nameElement.current;
    if (!element) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled || element.getClientRects().length === 0) return;
      const style = getComputedStyle(element);
      // Keep overflow detection stable while the full name is expanded.
      const limit = parseFloat(style.lineHeight) * 3
        + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      setNameOverflows(element.scrollHeight > limit + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [task.task_name, nameOverflows]);

  const endGesture = (cancel = false) => {
    const current = gesture.current;
    gesture.current = null;
    setDragging(false);
    onDrag(null, null);
    if (!cancel && current?.moved && current.target) onMove(current.target);
  };

  const name = (
    <span ref={nameElement} id={`task-name-${task.id}`}
      className={`task-name ${showFullName ? "task-name-expanded" : ""}`}>
      {task.task_name}
    </span>
  );

  return (
    <div data-task-id={task.id} className={`task ${task.finished_at ? "task-completed" : ""} ${dragging ? "task-dragging" : ""}`}>
      <div className="task-main">
        {nameOverflows ? (
          <button className="task-name-toggle" aria-expanded={showFullName}
            aria-controls={`task-name-${task.id}`}
            onClick={() => setShowFullName(!showFullName)}>
            {name}
            <span className="task-name-cue">{showFullName ? "Show less" : "Show more"}</span>
          </button>
        ) : name}
      </div>
      <div className="task-toolbar">
        <label className="task-check">
          <input type="checkbox" checked={!!task.finished_at} disabled={disabled}
            onChange={onComplete} aria-label={`${task.finished_at ? "Reopen" : "Complete"} ${task.task_name}`} />
        </label>
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
      </div>
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
