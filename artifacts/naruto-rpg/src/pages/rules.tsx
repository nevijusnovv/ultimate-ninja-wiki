import { Shell } from "@/components/layout/Shell";
import { BookOpen } from "lucide-react";

export default function Rules() {
  return (
    <Shell>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <header className="mb-12 text-center">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Свод Правил
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Основы ролевого отыгрыша, механика боев и правила поведения в сообществе.
          </p>
        </header>

        <div className="prose prose-invert prose-stone max-w-none 
              prose-headings:font-serif prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border/50
              prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-li:text-muted-foreground
              marker:text-primary">
          
          <h2>1. Базовые принципы отыгрыша</h2>
          <p>
            Ролевая игра строится на уважении к соигрокам и логике мира. Каждый персонаж — это не просто набор характеристик, а живой человек со своей историей, мотивацией и слабостями.
          </p>
          <ul>
            <li><strong>Адекватность (Манчкинство запрещено):</strong> Ваш персонаж не может уворачиваться от всех атак или знать то, чего он не мог узнать в рамках игры (метагейминг).</li>
            <li><strong>Литературный стиль:</strong> Посты пишутся от третьего лица в прошедшем или настоящем времени. Минимальный объем поста в боевой ситуации — 10-15 строк, в мирной — на усмотрение соигроков.</li>
            <li><strong>Смерть персонажа:</strong> Смерть окончательна. Воскрешение возможно только в исключительных сюжетных случаях, одобренных Мастерами Игры (ГМ).</li>
          </ul>

          <h2>2. Боевая система</h2>
          <p>
            Бои в нашей ролевой строятся на описательной логике с применением системы статов для разрешения спорных ситуаций.
          </p>
          <ul>
            <li><strong>Очередность:</strong> Игроки ходят строго по очереди. В один пост можно вместить одно атакующее и одно защитное действие, либо сложную комбинацию техник (если позволяет ранг и выносливость).</li>
            <li><strong>Система чакры:</strong> Использование техник (Ниндзюцу, Гендзюцу) расходует чакру. Перерасход чакры приводит к обмороку или смерти.</li>
            <li><strong>Тайдзюцу:</strong> Физические атаки зависят от стата Силы и Скорости.</li>
            <li><strong>Реакция ГМ:</strong> В турнирных и сюжетных боях действия описывает и судит ГМ. Решение ГМ неоспоримо.</li>
          </ul>

          <h2>3. Экономика и миссии</h2>
          <p>
            Развитие персонажа происходит через выполнение миссий, которые выдает Каге вашей деревни или соответствующие NPC.
          </p>
          <ul>
            <li><strong>Ранги миссий:</strong> От D (простые поручения) до S (смертельно опасные). Ранг миссии должен соответствовать рангу персонажа (или группы).</li>
            <li><strong>Награды:</strong> За выполнение миссий начисляется Рё (валюта) и опыт, необходимый для изучения новых техник.</li>
          </ul>

          <div className="bg-card/50 border border-primary/20 rounded-lg p-6 mt-12">
            <h3 className="text-xl font-serif text-primary mt-0 mb-4 border-none">Золотое правило</h3>
            <p className="text-foreground/80 mb-0">
              Мастер Игры всегда прав. Если ситуация не описана в правилах, она разрешается на усмотрение ГМ, исходя из здравого смысла и баланса.
            </p>
          </div>

        </div>
      </div>
    </Shell>
  );
}
