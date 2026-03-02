import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadCardProps {
    label: string;
    description: string;
    required?: boolean;
    accept?: string;
    multiple?: boolean;
    files: File[];
    onFilesChange: (files: File[]) => void;
}

export const FileUploadCard = ({
    label,
    description,
    required = false,
    accept = '.pdf,.jpg,.jpeg,.png,.heic',
    multiple = false,
    files,
    onFilesChange,
}: FileUploadCardProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (multiple) {
                onFilesChange([...files, ...droppedFiles]);
            } else {
                onFilesChange(droppedFiles.slice(0, 1));
            }
        },
        [files, multiple, onFilesChange]
    );

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (multiple) {
                onFilesChange([...files, ...selectedFiles]);
            } else {
                onFilesChange(selectedFiles.slice(0, 1));
            }
        }
    };

    const removeFile = (index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />;
        return <FileText className="w-4 h-4 text-red-500" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${isDragging
                        ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
                        : files.length > 0
                            ? 'border-emerald-300 bg-emerald-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleSelect}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-2">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}
                    >
                        <Upload className={`w-5 h-5 ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">{description}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                        Drag & drop or click to browse
                    </p>
                </div>
            </div>

            {/* File previews */}
            <AnimatePresence>
                {files.map((file, index) => (
                    <motion.div
                        key={`${file.name}-${index}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3"
                    >
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                            }}
                            className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            aria-label={`Remove ${file.name}`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
