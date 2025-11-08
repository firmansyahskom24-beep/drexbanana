import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Theme, AppMode, UploadedImage, Prompt, OutputItem } from './types';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ActionButton from './components/ActionButton';
import OutputSection from './components/OutputSection';
import Footer from './components/Footer';
import { generateImageWithRetry } from './services/geminiService';

const API_CONCURRENCY_LIMIT = 2;

interface RequestQueueItem {
    outputId: number;
    sourceImageId: number;
    promptId: number;
}

function App() {
    const [theme, setTheme] = useState<Theme>('light');
    const [mode, setMode] = useState<AppMode>('vector');
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [vectorPrompt, setVectorPrompt] = useState('');
    const [outputs, setOutputs] = useState<OutputItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const nextId = useRef(0);
    const requestQueue = useRef<RequestQueueItem[]>([]);
    const activeRequests = useRef(0);
    const abortController = useRef<AbortController | null>(null);
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('drexbanana-theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        }
    }, []);

    useEffect(() => {
        document.body.className = `${theme}-mode antialiased`;
        localStorage.setItem('drexbanana-theme', theme);
    }, [theme]);

    const processQueue = useCallback(async () => {
        if (activeRequests.current >= API_CONCURRENCY_LIMIT || requestQueue.current.length === 0 || !abortController.current) {
            return;
        }

        activeRequests.current++;
        const item = requestQueue.current.shift();

        if (!item) {
            activeRequests.current--;
            return;
        }

        const { outputId, sourceImageId, promptId } = item;
        
        const sourceImage = uploadedImages.find(i => i.id === sourceImageId);
        let promptText = "Make this image better";
        if (mode === 'vector') {
            if (vectorPrompt.trim()) promptText = vectorPrompt.trim();
        } else {
            const matrixPrompt = prompts.find(p => p.id === promptId);
            if (matrixPrompt) promptText = matrixPrompt.text;
        }

        if (!sourceImage) {
            console.error("Could not find source image for processing.");
            setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, status: 'error', error: 'Source image not found.' } : o));
            activeRequests.current--;
            processQueue();
            return;
        }

        setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, status: 'generating' } : o));
        
        try {
            const imageUrl = await generateImageWithRetry(sourceImage.base64Data, promptText, abortController.current.signal);
            setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, status: 'complete', imageUrl } : o));
        } catch (error) {
            const errorMessage = error instanceof Error && error.name === 'AbortError' ? 'Cancelled by user.' : (error as Error).message;
            setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, status: 'error', error: errorMessage } : o));
        } finally {
            activeRequests.current--;
            if (requestQueue.current.length === 0 && activeRequests.current === 0) {
                setIsGenerating(false);
            } else {
                processQueue();
            }
        }
    }, [uploadedImages, mode, vectorPrompt, prompts]);

    useEffect(() => {
        if (isGenerating && requestQueue.current.length > 0) {
            for (let i = 0; i < API_CONCURRENCY_LIMIT; i++) {
                processQueue();
            }
        }
    }, [isGenerating, processQueue]);

    const handleGenerate = useCallback(() => {
        const isVectorReady = mode === 'vector' && vectorPrompt.trim() !== '';
        const isMatrixReady = mode === 'matrix' && prompts.length > 0;

        if (uploadedImages.length === 0 || (!isVectorReady && !isMatrixReady)) {
            alert("Please add at least one image and one prompt.");
            return;
        }

        abortController.current = new AbortController();
        setIsGenerating(true);
        activeRequests.current = 0;
        
        const newOutputs: OutputItem[] = [];
        const newQueue: RequestQueueItem[] = [];
        
        const promptsToUse = mode === 'vector' ? [{ id: -1, title: 'Result', text: vectorPrompt }] : prompts;

        for (const image of uploadedImages) {
            for (const prompt of promptsToUse) {
                const outputId = nextId.current++;
                newOutputs.push({
                    id: outputId,
                    sourceImageId: image.id,
                    promptId: prompt.id,
                    imageUrl: null,
                    status: 'pending',
                    error: null,
                });
                newQueue.push({ outputId, sourceImageId: image.id, promptId: prompt.id });
            }
        }
        setOutputs(newOutputs);
        requestQueue.current = newQueue;
    }, [mode, vectorPrompt, prompts, uploadedImages]);

    const handleCancel = useCallback(() => {
        if (abortController.current) {
            abortController.current.abort();
        }
        requestQueue.current = [];
        setOutputs(prev => prev.map(o => (o.status === 'pending' || o.status === 'generating') ? { ...o, status: 'error', error: 'Cancelled by user.' } : o));
        setIsGenerating(false);
        activeRequests.current = 0;
    }, []);

    const handleRegenerate = useCallback((outputId: number) => {
        const output = outputs.find(o => o.id === outputId);
        if (!output) return;

        if (!isGenerating) {
            abortController.current = new AbortController();
            setIsGenerating(true);
        }
        
        setOutputs(prev => prev.map(o => o.id === outputId ? { ...o, status: 'pending', imageUrl: null, error: null } : o));
        requestQueue.current.push({ outputId: output.id, sourceImageId: output.sourceImageId, promptId: output.promptId });
        processQueue();
    }, [outputs, isGenerating, processQueue]);
    
    const handleAddPrompt = useCallback((title: string, text: string) => {
        setPrompts(prev => [...prev, { id: nextId.current++, title, text }]);
    }, []);

    const handleRemovePrompt = useCallback((id: number) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
    }, []);

    const handleAddImages = useCallback(async (files: FileList) => {
        const newImages: UploadedImage[] = [];
        for (const file of Array.from(files)) {
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve((reader.result as string).split(',')[1]);
                reader.onerror = error => reject(error);
            });
            newImages.push({ id: nextId.current++, file, base64Data });
        }
        setUploadedImages(prev => [...prev, ...newImages]);
    }, []);

    const handleRemoveImage = useCallback((id: number) => {
        setUploadedImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const handleClearImages = useCallback(() => {
        setUploadedImages([]);
        setOutputs([]);
    }, []);

    const handleModeChange = useCallback((newMode: AppMode) => {
        setMode(newMode);
        setOutputs([]);
    }, []);
    
    return (
        <div className="max-w-md mx-auto p-4 space-y-6">
            <Header theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />
            <main className="space-y-6">
                <ModeSelector currentMode={mode} onModeChange={handleModeChange} />
                <ImageUploader
                    images={uploadedImages}
                    onAddImages={handleAddImages}
                    onRemoveImage={handleRemoveImage}
                    onClearImages={handleClearImages}
                />
                <PromptInput
                    mode={mode}
                    vectorPrompt={vectorPrompt}
                    onVectorPromptChange={setVectorPrompt}
                    matrixPrompts={prompts}
                    onAddMatrixPrompt={handleAddPrompt}
                    onRemoveMatrixPrompt={handleRemovePrompt}
                />
                <ActionButton
                    isGenerating={isGenerating}
                    outputs={outputs}
                    onGenerate={handleGenerate}
                    onCancel={handleCancel}
                />
                <OutputSection
                    outputs={outputs}
                    prompts={prompts}
                    mode={mode}
                    isGenerating={isGenerating}
                    onRegenerate={handleRegenerate}
                />
            </main>
            <Footer />
        </div>
    );
}

export default App;
