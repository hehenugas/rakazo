import { useLingui } from "@lingui/react/macro";
import type { Routine } from "@rakazo/contracts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rakazo/ui-web";
import { Pause, Pencil, Play, Trash2 } from "lucide-react";

export type RoutineMenuPosition = { x: number; y: number };

/** Row menu for a routine: the same actions the editor offers, one step closer. */
export function RoutineContextMenu({
  routine,
  position,
  onClose,
  onToggleActive,
  onTestRun,
  onEdit,
  onDelete,
}: {
  routine: Pick<Routine, "name" | "active">;
  position: RoutineMenuPosition;
  onClose: () => void;
  onToggleActive: () => void;
  onTestRun: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLingui();
  return (
    <DropdownMenu
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      {/* Invisible anchor at the pointer position; the menu itself carries the accessible name. */}
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            className="fixed size-0 p-0 opacity-0"
            style={{ left: position.x, top: position.y }}
          />
        }
      />
      <DropdownMenuContent
        aria-label={t`Actions for ${routine.name}`}
        align="start"
        sideOffset={0}
        className="w-[200px]"
        data-testid="routine-context-menu"
      >
        <DropdownMenuItem onClick={onToggleActive}>
          {routine.active ? <Pause /> : <Play />}
          {routine.active ? t`Pause` : t`Resume`}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onTestRun}>
          <Play />
          {t`Test run`}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          {t`Edit`}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 />
          {t`Delete`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
