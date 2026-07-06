import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { FileText, Upload, Trash2, AlertCircle, File, Image as ImageIcon, FileJson } from "lucide-react"

import { Button } from "@/components/ui/button"

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export interface FileUploadProps extends Omit<DropzoneOptions, 'onDrop'> {
  value?: File[];
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
  isLoading?: boolean;
  onReorder?: (index: number, direction: -1 | 1) => void;
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 1,
  maxSize,
  accept,
  isLoading,
  onReorder,
  ...dropzoneProps
}: FileUploadProps) {
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null);
      if (fileRejections.length > 0) {
        const err = fileRejections[0].errors[0];
        if (err.code === "file-too-large") {
          setError(`File is too large.`);
        } else if (err.code === "file-invalid-type") {
          setError(`Invalid file type.`);
        } else {
          setError(err.message);
        }
        return;
      }
      
      if (maxFiles === 1) {
        onChange?.([acceptedFiles[0]]);
      } else {
        onChange?.([...value, ...acceptedFiles].slice(0, maxFiles));
      }
    },
    [maxFiles, onChange, value]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept,
    ...dropzoneProps
  });

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange?.(newFiles);
  };

  const handleClearAll = () => {
    onChange?.([]);
    setError(null);
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="h-5 w-5 text-red-400" />;
    if (type.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-400" />;
    if (type.includes("json")) return <FileJson className="h-5 w-5 text-yellow-400" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  if (value.length > 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Uploaded Files</span>
          {value.length > 1 && (
             <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8 text-muted-foreground hover:text-destructive">
               Clear all
             </Button>
          )}
        </div>
        <div className="space-y-2">
          {value.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 bg-surface-2/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-3 overflow-hidden">
                {getFileIcon(file.type)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onReorder && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onReorder(i, -1)} disabled={i === 0 || isLoading}>
                      <span className="text-lg leading-none">↑</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onReorder(i, 1)} disabled={i === value.length - 1 || isLoading}>
                      <span className="text-lg leading-none">↓</span>
                    </Button>
                  </>
                )}
                {maxFiles === 1 && (
                  <Button variant="ghost" size="sm" className="h-8" onClick={() => handleClearAll()} disabled={isLoading}>
                    Replace
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(i)} disabled={isLoading}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {maxFiles > 1 && value.length < maxFiles && (
          <div {...getRootProps()} className="cursor-pointer border-2 border-dashed border-border/60 rounded-xl p-4 text-center hover:bg-surface-2/30 transition-colors">
             <input {...getInputProps()} />
             <p className="text-sm text-muted-foreground">+ Add more files (Max {maxFiles})</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
          isDragActive ? "border-brand bg-brand/5" : "border-border/60 hover:bg-surface-2/30"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        <Upload className={`h-8 w-8 mb-4 ${isDragActive ? "text-brand" : "text-muted-foreground"}`} />
        <p className="font-medium text-sm">
          {isDragActive ? "Drop the files here..." : "Drag 'n' drop files here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isLoading ? "Uploading..." : "Support for PDF, DOCX, TXT, JSON, Images"}
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg border border-destructive/20 mt-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
