'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganizationStore } from '@/lib/store/organization-store';
import { useShopDataStore } from '@/lib/store/shop-data-store';
import { AIBusinessEngine } from '@/lib/services/ai-business-engine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Send, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  User, 
  HelpCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface AICopilotDrawerProps {
  onClose: () => void;
}

export function AICopilotDrawer({ onClose }: AICopilotDrawerProps) {
  const router = useRouter();
  const { organization } = useOrganizationStore();
  const { 
    getProducts, 
    getSales, 
    getPurchases, 
    getCustomers, 
    getSuppliers, 
    getExpenses 
  } = useShopDataStore();

  const orgId = organization?.id || 'default';
  const isCustom = organization?.isCustom || orgId.startsWith('org_custom_');
  const businessType = organization?.businessType || 'retail';

  const products = getProducts(orgId, businessType, isCustom);
  const sales = getSales(orgId, businessType, isCustom);
  const purchases = getPurchases(orgId, isCustom);
  const customers = getCustomers(orgId, isCustom);
  const suppliers = getSuppliers(orgId, isCustom);
  const expenses = getExpenses(orgId, isCustom);

  const engine = new AIBusinessEngine(
    products,
    sales,
    purchases,
    customers,
    suppliers,
    expenses,
    organization || ({} as any)
  );

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    actions?: { label: string; route: string }[];
  }>>([
    {
      role: 'assistant',
      content: `Hello! I am your **FactoryBrain AI Business Copilot** for **${organization?.name || 'Your Business'}**.\n\nI continuously monitor your live transactions, stock levels, receivables, and profit margins. How can I help you today?`,
    },
  ]);

  const quickPrompts = [
    'Why did my profit fall this month?',
    'Which products are selling fastest?',
    'Which products are likely to run out?',
    'What should I purchase this week?',
    'Who owes me the most money?',
    'Which supplier gives me the best deal?',
    'Will I have enough cash next month?',
    'What was my most profitable product?',
    'What should I focus on today?',
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg = promptText.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Compute live data-backed response from AIBusinessEngine
    const response = engine.answerCopilotQuestion(userMsg);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          actions: response.actions,
        },
      ]);
    }, 400);
  };

  return (
    <div className="w-80 sm:w-96 border-l bg-card flex flex-col h-full shrink-0 shadow-2xl z-40 transition-all">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg fb-gradient-bg flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              AI Business Copilot
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20 py-0">
                Live Data
              </Badge>
            </span>
            <p className="text-[10px] text-muted-foreground truncate">{organization?.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 p-3.5 sm:p-4">
        <div className="space-y-3.5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-br-xs shadow-xs'
                    : 'bg-muted/70 text-foreground border border-muted-foreground/10 rounded-bl-xs leading-relaxed space-y-2'
                }`}
              >
                <div
                  className="whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />

                {/* Inline Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 border-t border-border/50 flex flex-wrap gap-1.5 mt-2">
                    {msg.actions.map((act, aIdx) => (
                      <Button
                        key={aIdx}
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-6 px-2 bg-background hover:bg-primary/10 hover:text-primary gap-1 font-medium border-primary/20"
                        onClick={() => {
                          onClose();
                          router.push(act.route);
                        }}
                      >
                        {act.label} <ArrowRight className="w-2.5 h-2.5" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Prompts Chips */}
      <div className="px-3 py-2 border-t bg-muted/10 shrink-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
          Quick Questions:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.slice(0, 4).map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendPrompt(p)}
              className="text-[10px] whitespace-nowrap px-2 py-1 rounded-full border bg-card hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors shrink-0"
            >
              💡 {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t p-3 bg-card shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex gap-1.5"
        >
          <Input
            placeholder="Ask anything about your business..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="text-xs h-8.5 focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button type="submit" size="sm" className="h-8.5 px-3 font-semibold shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
