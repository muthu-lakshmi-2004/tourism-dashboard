import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Field {
  name: string;
  label: string;
  type?: string;
}

interface DataEntrySheetProps {
  title: string;
  fields: Field[];
  onSubmit?: (data: Record<string, string>) => void;
}

export function DataEntrySheet({ title, fields, onSubmit }: DataEntrySheetProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
    toast.success("Entry added successfully");
    setValues({});
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="saffron-pulse gap-2" size="sm">
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Entry
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card">
        <SheetHeader>
          <SheetTitle className="font-display">{title}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm">{field.label}</Label>
              <Input
                id={field.name}
                type={field.type || "text"}
                value={values[field.name] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="rounded-md"
              />
            </div>
          ))}
          <Button type="submit" className="w-full saffron-pulse mt-6">
            Save Entry
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
