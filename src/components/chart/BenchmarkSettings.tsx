import { useState } from "react";
import { PRESET_BENCHMARKS, BenchmarkConfig, createCustomBenchmark } from "@/data/benchmarks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Plus, X, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BenchmarkSettingsProps {
  config: BenchmarkConfig;
  onChange: (config: BenchmarkConfig) => void;
}

const categoryLabels: Record<string, string> = {
  index: "指数基金",
  commodity: "商品",
  deposit: "存款/货币",
  custom: "自定义基金",
};

const BenchmarkSettings = ({ config, onChange }: BenchmarkSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");

  const toggleBenchmark = (id: string) => {
    const next = config.selectedIds.includes(id)
      ? config.selectedIds.filter((x) => x !== id)
      : [...config.selectedIds, id];
    onChange({ ...config, selectedIds: next });
  };

  const addCustomFund = () => {
    const code = newCode.trim();
    if (!code) { toast({ title: "请输入基金代码", variant: "destructive" }); return; }
    const customId = `custom_${code}`;
    if (config.customFunds.find((f) => f.code === code)) {
      toast({ title: "该基金已添加", variant: "destructive" }); return;
    }
    const next: BenchmarkConfig = {
      selectedIds: [...config.selectedIds, customId],
      customFunds: [...config.customFunds, { code, name: newName.trim() || `基金${code}` }],
    };
    onChange(next);
    setNewCode("");
    setNewName("");
    toast({ title: "已添加", description: `${newName.trim() || code} 加入对比` });
  };

  const removeCustomFund = (code: string) => {
    const customId = `custom_${code}`;
    onChange({
      selectedIds: config.selectedIds.filter((x) => x !== customId),
      customFunds: config.customFunds.filter((f) => f.code !== code),
    });
  };

  const categories = ["index", "commodity", "deposit"] as const;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-accent transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        对比设置
        {config.selectedIds.length > 0 && (
          <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {config.selectedIds.length}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">对比基准设置</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">选择要在图表中叠加对比的基准，支持多选</p>

          <div className="space-y-5 pt-2">
            {categories.map((cat) => {
              const items = PRESET_BENCHMARKS.filter((b) => b.category === cat);
              return (
                <div key={cat}>
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                    {categoryLabels[cat]}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {items.map((b) => {
                      const selected = config.selectedIds.includes(b.id);
                      return (
                        <button
                          key={b.id}
                          onClick={() => toggleBenchmark(b.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                            selected
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
                          {b.name}
                          {selected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Custom funds */}
            <div>
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                {categoryLabels.custom}
              </h4>

              {config.customFunds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {config.customFunds.map((f, i) => {
                    const customId = `custom_${f.code}`;
                    const selected = config.selectedIds.includes(customId);
                    const bench = createCustomBenchmark(f.code, f.name, i);
                    return (
                      <div key={f.code} className="flex items-center gap-1">
                        <button
                          onClick={() => toggleBenchmark(customId)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg text-xs font-medium transition-all border ${
                            selected
                              ? "border-primary/50 bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bench.color }} />
                          {f.name} ({f.code})
                          {selected && <Check className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => removeCustomFund(f.code)}
                          className="px-1.5 py-1.5 rounded-r-lg border border-l-0 border-border bg-muted text-muted-foreground hover:text-loss hover:bg-loss-muted transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="基金代码"
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => e.key === "Enter" && addCustomFund()}
                />
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="名称（可选）"
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  onKeyDown={(e) => e.key === "Enter" && addCustomFund()}
                />
                <button
                  onClick={addCustomFund}
                  className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
            <button
              onClick={() => onChange({ selectedIds: [], customFunds: config.customFunds })}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              清空选择
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity"
            >
              完成
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BenchmarkSettings;
