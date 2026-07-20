import { Shell } from "@/components/layout/Shell";
import { Shield, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function Ranks() {
  const ranks = [
    {
      title: "Студент Академии",
      level: "Начальный этап",
      desc: "Только начинает свой путь. Изучает основы контроля чакры, базовые техники клонирования и трансформации.",
      req: "Регистрация анкеты",
      color: "border-stone-500/30"
    },
    {
      title: "Генин",
      level: "Младший ниндзя",
      desc: "Выпускник академии. Выполняет миссии D и C рангов в составе команды под руководством Джонина.",
      req: "Сдача экзамена Академии",
      color: "border-blue-500/30"
    },
    {
      title: "Чунин",
      level: "Средний ниндзя",
      desc: "Опытный шиноби, способный руководить командой. Выполняет миссии C и B рангов. Владеет 2-3 стихиями.",
      req: "Победа или проявление лидерских качеств на Экзамене на Чунина",
      color: "border-green-500/30"
    },
    {
      title: "Джонин",
      level: "Высший ниндзя",
      desc: "Элита деревни. Владеет мощными техниками, обучает генинов, выполняет миссии A и S рангов.",
      req: "Рекомендация Каге + сложный квест",
      color: "border-purple-500/30"
    },
    {
      title: "АНБУ",
      level: "Спецотряд",
      desc: "Секретные агенты Каге. Занимаются шпионажем, убийствами и охраной. Работают в масках.",
      req: "Приглашение Каге, выдающиеся навыки скрытности",
      color: "border-red-500/30"
    },
    {
      title: "Каге",
      level: "Тень деревни",
      desc: "Лидер скрытой деревни, сильнейший шиноби своего селения.",
      req: "Выборы / Назначение предыдущим Каге",
      color: "border-primary/50 shadow-[0_0_15px_rgba(255,107,0,0.15)]"
    }
  ];

  return (
    <Shell>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-16 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Иерархия Шиноби
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Система рангов определяет вашу силу, доступные миссии и положение в обществе.
          </p>
        </header>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line connecting ranks */}
          <div className="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-border/50 hidden md:block" />

          <div className="space-y-6">
            {ranks.map((rank, index) => (
              <div key={index} className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                
                {/* Desktop connection dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-background border-2 border-primary rounded-full hidden md:block" />
                
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:order-last md:pl-12"}`}>
                  <Card className={`bg-card/80 backdrop-blur border ${rank.color} hover:border-primary/50 transition-colors`}>
                    <CardHeader className="pb-3">
                      <div className={`text-xs font-mono text-primary mb-1 uppercase tracking-widest ${index % 2 === 0 ? "md:justify-end flex" : ""}`}>
                        {rank.level}
                      </div>
                      <CardTitle className="font-serif text-2xl">{rank.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm space-y-4">
                      <p>{rank.desc}</p>
                      <div className={`pt-4 border-t border-border/50 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                        <strong className="text-foreground/80 block mb-1">Как получить:</strong>
                        {rank.req}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Spacer for empty half on desktop */}
                <div className="hidden md:block w-1/2" />
                
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
