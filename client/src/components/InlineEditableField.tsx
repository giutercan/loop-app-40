import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";

interface InlineEditableFieldProps {
  value: string | number | null;
  onSave: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  type?: "text" | "number";
  label?: string;
}

export function InlineEditableField({
  value,
  onSave,
  placeholder = "Enter value",
  suffix,
  prefix,
  className = "",
  inputClassName = "",
  disabled = false,
  type = "text",
  label
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value?.toString() || "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
        <Input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={`h-6 text-xs w-20 ${inputClassName}`}
          data-testid="input-inline-edit"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5"
          onClick={handleSave}
          data-testid="button-inline-save"
        >
          <Check className="h-3 w-3 text-emerald-500" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          data-testid="button-inline-cancel"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && setIsEditing(true)}
      className={`group flex items-center gap-1 text-xs hover-elevate rounded px-1 py-0.5 transition-all ${disabled ? "cursor-default" : "cursor-pointer"} ${className}`}
      disabled={disabled}
      data-testid="button-inline-edit-trigger"
      title={disabled ? undefined : "Click to edit"}
    >
      {label && <span className="text-muted-foreground mr-1">{label}</span>}
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      <span className="font-medium">
        {value !== null && value !== undefined && value !== "" ? value : placeholder}
      </span>
      {suffix && <span className="text-muted-foreground ml-0.5">{suffix}</span>}
      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
      )}
    </button>
  );
}

interface InlineEditableBaselineProps {
  baseline: string | number | null;
  target: string | number | null;
  unit?: string;
  onBaselineSave: (value: string) => void;
  onTargetSave: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function InlineEditableBaseline({
  baseline,
  target,
  unit,
  onBaselineSave,
  onTargetSave,
  disabled = false,
  className = ""
}: InlineEditableBaselineProps) {
  const [editingField, setEditingField] = useState<"baseline" | "target" | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  const handleStartEdit = (field: "baseline" | "target") => {
    if (disabled) return;
    setEditingField(field);
    setEditValue(field === "baseline" ? (baseline?.toString() || "") : (target?.toString() || ""));
  };

  const handleSave = () => {
    if (editingField === "baseline") {
      onBaselineSave(editValue);
    } else if (editingField === "target") {
      onTargetSave(editValue);
    }
    setEditingField(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`} data-testid="inline-editable-baseline">
      {editingField === "baseline" ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Baseline"
            className="h-6 text-xs w-16"
            data-testid="input-baseline"
          />
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSave}>
            <Check className="h-3 w-3 text-emerald-500" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-5 w-5" 
            onMouseDown={(e) => {
              e.preventDefault();
              handleCancel();
            }}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleStartEdit("baseline")}
          className={`group flex items-center gap-0.5 hover-elevate rounded px-1 py-0.5 ${disabled ? "cursor-default" : "cursor-pointer"}`}
          disabled={disabled}
          title={disabled ? undefined : "Click to edit baseline"}
          data-testid="button-edit-baseline"
        >
          <span className="font-medium">{baseline ?? "—"}</span>
          {!disabled && <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
      )}
      
      <span className="text-muted-foreground">→</span>
      
      {editingField === "target" ? (
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Target"
            className="h-6 text-xs w-16"
            data-testid="input-target"
          />
          <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSave}>
            <Check className="h-3 w-3 text-emerald-500" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-5 w-5" 
            onMouseDown={(e) => {
              e.preventDefault();
              handleCancel();
            }}
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => handleStartEdit("target")}
          className={`group flex items-center gap-0.5 hover-elevate rounded px-1 py-0.5 ${disabled ? "cursor-default" : "cursor-pointer"}`}
          disabled={disabled}
          title={disabled ? undefined : "Click to edit target"}
          data-testid="button-edit-target"
        >
          <span className="font-medium">{target ?? "—"}</span>
          {!disabled && <Pencil className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
      )}
      
      {unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
    </div>
  );
}

export default InlineEditableField;
