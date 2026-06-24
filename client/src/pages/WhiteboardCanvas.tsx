import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Trash2, Undo2, Type } from "lucide-react";
import { Input } from "@/components/ui/input";

interface WhiteboardCanvasProps {
  onSave?: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export default function WhiteboardCanvas({
  onSave,
  width = 800,
  height = 600,
}: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser" | "text">("pen");
  const [history, setHistory] = useState<string[]>([]);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Save initial state
    setHistory([canvas.toDataURL()]);
  }, [width, height]);

  const getContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "text") {
      setShowTextInput(true);
      return;
    }

    setIsDrawing(true);
    const ctx = getContext();
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = getContext();
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    } else {
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory((prev) => [...prev, canvas.toDataURL()]);
    }
  };

  const addText = () => {
    if (!textInput.trim()) {
      setShowTextInput(false);
      return;
    }

    const ctx = getContext();
    if (!ctx) return;

    ctx.fillStyle = color;
    ctx.font = `${brushSize * 5}px Arial`;
    ctx.fillText(textInput, 50, 50);

    const canvas = canvasRef.current;
    if (canvas) {
      setHistory((prev) => [...prev, canvas.toDataURL()]);
    }

    setTextInput("");
    setShowTextInput(false);
  };

  const undo = () => {
    if (history.length <= 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = getContext();
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clear = () => {
    const ctx = getContext();
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    const canvas = canvasRef.current;
    if (canvas) {
      setHistory([canvas.toDataURL()]);
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-2">
          <Button
            onClick={() => setTool("pen")}
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
          >
            Pen
          </Button>
          <Button
            onClick={() => setTool("eraser")}
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
          >
            Eraser
          </Button>
          <Button
            onClick={() => setTool("text")}
            variant={tool === "text" ? "default" : "outline"}
            size="sm"
            className="gap-2"
          >
            <Type className="h-4 w-4" />
            Text
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
            disabled={tool === "eraser"}
          />
          <span className="text-sm text-gray-600">Color</span>
        </div>

        <div className="flex items-center gap-2">
          <Slider
            value={[brushSize]}
            onValueChange={(val) => setBrushSize(val[0])}
            min={1}
            max={20}
            step={1}
            className="w-24"
          />
          <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            onClick={undo}
            variant="outline"
            size="sm"
            disabled={history.length <= 1}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button
            onClick={clear}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          <Button onClick={save} size="sm">
            Save
          </Button>
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair block w-full"
        />
      </div>

      {showTextInput && (
        <div className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text..."
            onKeyPress={(e) => {
              if (e.key === "Enter") addText();
            }}
            autoFocus
          />
          <Button onClick={addText} size="sm">
            Add
          </Button>
          <Button
            onClick={() => {
              setShowTextInput(false);
              setTextInput("");
            }}
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
